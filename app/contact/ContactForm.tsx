'use client'

import { useState } from 'react'

export default function ContactForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // Capture the form element before any awaits to avoid null refs
    const form = e.currentTarget

    try {
      const formData = new FormData(form)
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          subject: formData.get('subject'),
          message: formData.get('message'),
        }),
      })

      if (!response.ok) {
        let message = 'Failed to send message'
        try {
          const data = await response.json()
          if (data?.error) message = data.error
        } catch {}
        throw new Error(message)
      }

      setIsSubmitted(true)
      // Reset form using captured reference
      form.reset()

      // Reset the notification after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false)
      }, 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Success Notification */}
      {isSubmitted && (
        <div className='fixed top-4 right-4 z-50 max-w-sm'>
          <div className='bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-lg shadow-lg ring-1 ring-white/20 animate-in slide-in-from-top-2 duration-300'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0'>
                <span className='text-lg'>✓</span>
              </div>
              <div>
                <h3 className='font-semibold'>Message Sent!</h3>
                <p className='text-sm text-green-100'>
                  We'll get back to you soon.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className='fixed top-4 right-4 z-50 max-w-sm'>
          <div className='bg-gradient-to-r from-red-500 to-rose-500 text-white p-4 rounded-lg shadow-lg ring-1 ring-white/20 animate-in slide-in-from-top-2 duration-300'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0'>
                <span className='text-lg'>⚠</span>
              </div>
              <div>
                <h3 className='font-semibold'>Error</h3>
                <p className='text-sm text-red-100'>{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className='ml-2 text-white/80 hover:text-white'
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Form */}
      <div className='rounded-2xl bg-white/5 backdrop-blur ring-1 ring-white/10 p-6 md:p-8'>
        <h2 className='text-2xl font-bold text-white mb-6'>
          Send us a message
        </h2>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label
              htmlFor='name'
              className='block text-sm font-medium text-slate-200 mb-2'
            >
              Name
            </label>
            <input
              type='text'
              id='name'
              name='name'
              required
              className='w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition'
              placeholder='Your name'
            />
          </div>

          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-slate-200 mb-2'
            >
              Email
            </label>
            <input
              type='email'
              id='email'
              name='email'
              required
              className='w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition'
              placeholder='your.email@example.com'
            />
          </div>

          <div>
            <label
              htmlFor='subject'
              className='block text-sm font-medium text-slate-200 mb-2'
            >
              Subject
            </label>
            <select
              id='subject'
              name='subject'
              required
              className='w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition'
            >
              <option value=''>Select a topic</option>
              <option value='feedback'>Game Feedback</option>
              <option value='bug'>Bug Report</option>
              <option value='suggestion'>Feature Suggestion</option>
              <option value='support'>Technical Support</option>
              <option value='other'>Other</option>
            </select>
          </div>

          <div>
            <label
              htmlFor='message'
              className='block text-sm font-medium text-slate-200 mb-2'
            >
              Message
            </label>
            <textarea
              id='message'
              name='message'
              rows={5}
              required
              className='w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition resize-vertical'
              placeholder='Tell us what you think...'
            />
          </div>

          <button
            type='submit'
            disabled={isSubmitting}
            className='w-full inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-6 py-3 font-semibold text-white shadow-lg shadow-fuchsia-500/20 ring-1 ring-white/10 hover:scale-[1.02] transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
          >
            {isSubmitting ? (
              <>
                <svg
                  className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  ></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
                Sending...
              </>
            ) : (
              'Send Message'
            )}
          </button>
        </form>
      </div>
    </>
  )
}
