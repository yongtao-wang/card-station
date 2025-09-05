import { NextRequest, NextResponse } from 'next/server'

interface ContactData {
  name: string
  email: string
  subject: string
  message: string
}

function sanitizeSubject(input: string) {
  return String(input)
    .replace(/[\r\n]+/g, ' ')
    .slice(0, 200)
}

function toHtml(text: string) {
  const escaped = String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return escaped.replace(/\n/g, '<br>')
}

function toText(text: string) {
  return String(text)
}

export async function POST(request: NextRequest) {
  try {
    const data: ContactData = await request.json()

    // Validate required fields
    if (!data.name || !data.email || !data.subject || !data.message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Basic length guardrails
    if (data.message.length > 5000) {
      return NextResponse.json(
        { error: 'Message is too long' },
        { status: 413 }
      )
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY
    const EMAIL_FROM =
      process.env.EMAIL_FROM || 'Card Station <contact@cardstation.games>'
    const CONTACT_TO = process.env.CONTACT_TO || 'Card Station <contact@cardstation.games>'

    if (!RESEND_API_KEY) {
      console.error('Missing RESEND_API_KEY environment variable')
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    const subject = `Contact Form: ${sanitizeSubject(data.subject)}`

    const html = `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; line-height: 1.6;">
        <h2 style="margin: 0 0 12px;">New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${toHtml(data.name)}</p>
        <p><strong>Email:</strong> ${toHtml(data.email)}</p>
        <p><strong>Subject:</strong> ${toHtml(data.subject)}</p>
        <p><strong>Message:</strong></p>
        <div style="white-space: normal;">${toHtml(data.message)}</div>
        <hr style="margin: 16px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="color:#6b7280; font-size: 12px;">Sent at ${new Date().toISOString()}</p>
      </div>
    `

    const text =
      `New Contact Form Submission\n\n` +
      `Name: ${toText(data.name)}\n` +
      `Email: ${toText(data.email)}\n` +
      `Subject: ${toText(data.subject)}\n\n` +
      `${toText(data.message)}\n\n` +
      `Sent at ${new Date().toISOString()}`

    // Send email via Resend REST API (no extra dependency)
    const to = CONTACT_TO.split(',').map((s) => s.trim()).filter(Boolean)
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to,
        subject,
        html,
        text,
        reply_to: data.email,
      }),
    })

    const result = await resp.json().catch(() => ({}))

    if (!resp.ok) {
      console.error('Resend error:', { status: resp.status, result })
      return NextResponse.json(
        { error: result?.message || 'Failed to send email' },
        { status: 502 }
      )
    }

    return NextResponse.json(
      { message: 'Email sent successfully', id: result?.id },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
