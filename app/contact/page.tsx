import ContactForm from './ContactForm'
import type { Metadata } from 'next'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Contact Us — Card Station',
  description: 'Get in touch with Card Station. Contact us for feedback, support, or questions about our free online card games.',
  alternates: { canonical: `${site.url || ''}/contact` },
}

export default function ContactPage() {
  return (
    <div className='space-y-8'>
      <header className='text-center'>
        <h1 className='text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4'>
          Contact Us
        </h1>
        <p className='text-slate-300 max-w-2xl mx-auto'>
          We&apos;d love to hear from you! Whether you have feedback, questions, or suggestions for new games, feel free to reach out.
        </p>
      </header>

      <ContactForm />
    </div>
  )
}
