import ContactForm from './ContactForm'
import type { Metadata } from 'next'
import Script from 'next/script'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Contact Us — Card Station',
  description:
    'Get in touch with Card Station. Contact us for feedback, support, or questions about our free online card games.',
  alternates: { canonical: `${site.url || ''}/contact` },
  openGraph: {
    title: 'Contact Us — Card Station',
    description: 'Get in touch with Card Station. Contact us for feedback, support, or questions about our free online card games.',
    type: 'website',
    url: `${site.url || ''}/contact`,
    siteName: 'Card Station',
    images: [
      {
        url: site.url ? `${site.url}/assets/img/og/holdem_og.webp` : '/assets/img/og/holdem_og.webp',
        width: 1200,
        height: 630,
        alt: 'Contact Card Station - Free Online Card Games'
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us — Card Station',
    description: 'Get in touch with Card Station. Contact us for feedback, support, or questions about our free online card games.',
    images: [site.url ? `${site.url}/assets/img/og/holdem_og.webp` : '/assets/img/og/holdem_og.webp'],
  },
}

export default function ContactPage() {
  return (
    <div className='space-y-8'>
      {/* JSON-LD structured data for FAQ */}
      <Script id="faq-structured-data" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          'mainEntity': [
            {
              '@type': 'Question',
              'name': 'How do I report a bug?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'If you encounter any bugs or issues while playing our games, please use the contact form below to provide details so we can investigate and fix them promptly.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Can I suggest a new game?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Absolutely! We welcome suggestions for new card games to add to our platform. Use the contact form to share your ideas with us.'
              }
            },
            {
              '@type': 'Question',
              'name': 'What kind of support can I get?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'We strive to respond promptly and assist you with any issues or questions you may have regarding our free online card games.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Is Card Station free to use?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Yes, Card Station is completely free to use. All games are instant play, require no signup, and have no gambling or casino elements.'
              }
            },
            {
              '@type': 'Question',
              'name': 'How do I contact Card Station for feedback?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'You can use the contact form on this page to send us your feedback, questions, or suggestions. We value all input from our community.'
              }
            }
          ]
        })}
      </Script>

      <header className='text-center'>
        <h1 className='text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4'>
          Contact Us
        </h1>
      </header>

      <section className='max-w-6xl mx-auto text-slate-300 space-y-4'>
        <p className='text-slate-300 mx-auto text-left'>
          We&apos;d love to hear from you! Whether you have feedback, questions,
          or suggestions for new games, feel free to reach out.
        </p>
        <h2 className='text-2xl font-semibold'>
          Card Station Contact & Support
        </h2>
        <p>
          At Card Station, we&apos;re committed to providing excellent free
          online card games help. Common reasons to contact us include reporting
          bugs, requesting new games, or general support inquiries. We strive to
          respond promptly and assist you with any issues or questions you may
          have.
        </p>
      </section>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8'>
        <div className='grid grid-cols-1 gap-6'>
          {/* Contact Information */}
          <div className='space-y-6'>
            <div className='rounded-2xl bg-white/5 backdrop-blur ring-1 ring-white/10 p-6 md:p-8'>
              <h2 className='text-2xl font-bold text-white mb-6'>
                Get in touch
              </h2>
              <div className='space-y-4'>
                <div className='flex items-start gap-4'>
                  <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-fuchsia-500 to-indigo-500 flex items-center justify-center flex-shrink-0'>
                    <span className='text-white text-lg'>📧</span>
                  </div>
                  <div>
                    <h3 className='font-semibold text-white'>Email</h3>
                    <p className='text-slate-300'>contact@cardstation.games</p>
                  </div>
                </div>
                <div className='flex items-start gap-4'>
                  <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0'>
                    <span className='text-white text-lg'>⚡</span>
                  </div>
                  <div>
                    <h3 className='font-semibold text-white'>Response Time</h3>
                    <p className='text-slate-300'>
                      We typically respond within 24-48 hours
                    </p>
                  </div>
                </div>

                <div className='flex items-start gap-4'>
                  <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0'>
                    <span className='text-white text-lg'>🎮</span>
                  </div>
                  <div>
                    <h3 className='font-semibold text-white'>
                      Game Suggestions
                    </h3>
                    <p className='text-slate-300'>
                      Have an idea for a new card game? We&apos;d love to hear
                      it!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='rounded-2xl bg-white/5 backdrop-blur ring-1 ring-white/10 p-6 md:p-8'>
            <h2 className='text-2xl font-bold text-white mb-4'>
              Frequently Asked Questions
            </h2>
            <div className='space-y-4'>
              <div>
                <h3 className='font-semibold text-white mb-1'>
                  Are the games really free?
                </h3>
                <p className='text-slate-300 text-sm'>
                  Yes! All our games are completely free to play with no hidden
                  costs or subscriptions.
                </p>
              </div>

              <div>
                <h3 className='font-semibold text-white mb-1'>
                  Do I need to create an account?
                </h3>
                <p className='text-slate-300 text-sm'>
                  No account required! Just visit and start playing instantly.
                </p>
              </div>

              <div>
                <h3 className='font-semibold text-white mb-1'>
                  Can I play on mobile?
                </h3>
                <p className='text-slate-300 text-sm'>
                  Absolutely! All games are optimized for mobile, tablet, and
                  desktop.
                </p>
              </div>

              <div>
                <h3 className='font-semibold'>How do I report a bug?</h3>
                <p>
                  If you encounter any bugs or issues while playing our games,
                  please use the contact form below to provide details so we can
                  investigate and fix them promptly.
                </p>
              </div>
              <div>
                <h3 className='font-semibold'>Can I suggest a new game?</h3>
                <p>
                  Absolutely! We welcome suggestions for new card games to add
                  to our platform. Use the contact form to share your ideas with
                  us.
                </p>
              </div>
              <div>
                <h3 className='font-semibold'>What kind of support can I get?</h3>
                <p>
                  We strive to respond promptly and assist you with any issues or
                  questions you may have regarding our free online card games.
                </p>
              </div>
              <div>
                <h3 className='font-semibold'>How do I contact Card Station for feedback?</h3>
                <p>
                  You can use the contact form on this page to send us your
                  feedback, questions, or suggestions. We value all input from our
                  community.
                </p>
              </div>
            </div>
          </div>
        </div>

        <ContactForm />
      </div>
    </div>
  )
}
