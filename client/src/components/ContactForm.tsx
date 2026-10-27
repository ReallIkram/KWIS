import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { request, send } from '../api';
import { useContent } from '../content';
import { useCopy } from '../copy';
const schema = z.object({
  name: z.string().min(2, 'Please enter your full name'),
  email: z.email('Enter a valid email'),
  phone: z.string(),
  company: z.string(),
  service: z.string(),
  budget: z.string(),
  message: z.string().min(10, 'Please tell us a little more (at least 10 characters)'),
  website: z.string().max(0),
});
type Values = z.infer<typeof schema>;
export default function ContactForm() {
  const copy = useCopy();
  const settings = useContent().one('settings')?.data;
  const { list } = useContent();
  const [status, setStatus] = useState('');
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      service: '',
      budget: '',
      message: '',
      website: '',
    },
  });
  return (
    <form
      className="contact-form"
      onSubmit={handleSubmit(async (values) => {
        setStatus('');
        try {
          await request('/public/contact', send('POST', values));
          setSuccess(true);
          reset();
          setStatus(copy('contact.success'));
        } catch (e) {
          setSuccess(false);
          setStatus((e as Error).message);
        }
      })}
    >
      <div className="form-grid">
        {(['name', 'email', 'phone', 'company'] as const).map((key) => (
          <label key={key}>
            {copy('contact.' + key)}
            <input
              {...register(key)}
              type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'}
              autoComplete={
                key === 'name'
                  ? 'name'
                  : key === 'email'
                    ? 'email'
                    : key === 'phone'
                      ? 'tel'
                      : 'organization'
              }
              aria-invalid={!!errors[key]}
            />
            {errors[key] && <small className="error">{errors[key]?.message}</small>}
          </label>
        ))}
        <label>
          {copy('contact.service')}
          <select {...register('service')}>
            <option value="">{copy('contact.selectService')}</option>
            {list('services').map((s) => (
              <option key={s.id}>{s.title}</option>
            ))}
          </select>
        </label>
        <label>
          {copy('contact.budget')}
          <select {...register('budget')}>
            <option value="">{copy('contact.discuss')}</option>
            {(
              settings?.budgetOptions || [
                'Under $5,000',
                '$5,000–$15,000',
                '$15,000–$50,000',
                '$50,000+',
              ]
            ).map((b: string) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        {copy('contact.message')}
        <textarea
          {...register('message')}
          rows={5}
          placeholder={copy('contact.placeholder')}
          aria-invalid={!!errors.message}
        />
        {errors.message && <small className="error">{errors.message.message}</small>}
      </label>
      <label className="honeypot" aria-hidden="true">
        Website
        <input {...register('website')} tabIndex={-1} autoComplete="off" />
      </label>
      <p className="form-note">
        By sending this form, you agree to our <a href="#/privacy-policy">privacy policy</a>.
      </p>
      <button className="button" disabled={isSubmitting}>
        {isSubmitting ? 'Sending…' : copy('contact.submit')}
        <ArrowUpRight size={18} />
      </button>
      <p role="status" className={success ? 'success' : 'error'}>
        {success && <CheckCircle2 size={17} />} {status}
      </p>
    </form>
  );
}
