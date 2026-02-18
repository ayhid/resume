import { useState } from 'preact/hooks';

interface ContactFormProps {
  locale: string;
  apiUrl?: string;
}

const labels = {
  en: {
    name: 'Name',
    email: 'Email',
    subject: 'Subject',
    message: 'Message',
    send: 'Send Message',
    sending: 'Sending...',
    success: 'Message sent! I\'ll get back to you soon.',
    error: 'Something went wrong. Please try again or email me directly.',
    required: 'This field is required',
    invalidEmail: 'Please enter a valid email',
  },
  fr: {
    name: 'Nom',
    email: 'Email',
    subject: 'Sujet',
    message: 'Message',
    send: 'Envoyer',
    sending: 'Envoi...',
    success: 'Message envoyé ! Je vous répondrai bientôt.',
    error: 'Une erreur est survenue. Réessayez ou contactez-moi par email.',
    required: 'Ce champ est requis',
    invalidEmail: 'Veuillez entrer un email valide',
  },
};

export default function ContactForm({ locale, apiUrl = '' }: ContactFormProps) {
  const t = labels[locale as keyof typeof labels] || labels.en;
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = t.required;
    if (!form.email.trim()) errs.email = t.required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = t.invalidEmail;
    if (!form.subject.trim()) errs.subject = t.required;
    if (!form.message.trim()) errs.message = t.required;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!validate()) return;

    setStatus('sending');
    try {
      const res = await fetch(`${apiUrl}/api/contact-submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            ...form,
            submittedAt: new Date().toISOString(),
            locale,
          },
        }),
      });

      if (!res.ok) throw new Error('Failed');
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div class="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <p class="text-green-700 font-medium">{t.success}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} class="space-y-4" noValidate>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-white/80 mb-1">{t.name}</label>
          <input
            type="text"
            value={form.name}
            onInput={(e) => setForm({ ...form, name: (e.target as HTMLInputElement).value })}
            class="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          {errors.name && <p class="text-red-200 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <label class="block text-sm font-medium text-white/80 mb-1">{t.email}</label>
          <input
            type="email"
            value={form.email}
            onInput={(e) => setForm({ ...form, email: (e.target as HTMLInputElement).value })}
            class="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          {errors.email && <p class="text-red-200 text-xs mt-1">{errors.email}</p>}
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-white/80 mb-1">{t.subject}</label>
        <input
          type="text"
          value={form.subject}
          onInput={(e) => setForm({ ...form, subject: (e.target as HTMLInputElement).value })}
          class="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
        />
        {errors.subject && <p class="text-red-200 text-xs mt-1">{errors.subject}</p>}
      </div>

      <div>
        <label class="block text-sm font-medium text-white/80 mb-1">{t.message}</label>
        <textarea
          rows={4}
          value={form.message}
          onInput={(e) => setForm({ ...form, message: (e.target as HTMLTextAreaElement).value })}
          class="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
        />
        {errors.message && <p class="text-red-200 text-xs mt-1">{errors.message}</p>}
      </div>

      {status === 'error' && (
        <p class="text-red-200 text-sm">{t.error}</p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        class="btn btn-white w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'sending' ? t.sending : t.send}
      </button>
    </form>
  );
}
