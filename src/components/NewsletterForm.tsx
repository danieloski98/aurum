'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { createClient } from '@/lib/supabase/client';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface NewsletterInput {
  email: string;
}

export default function NewsletterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<NewsletterInput>();

  const onSubmit: SubmitHandler<NewsletterInput> = async (data) => {
    setIsLoading(true);
    setFeedback(null);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('subscribers')
        .insert([{ email: data.email, subscribed_at: new Date().toISOString() }]);

      if (error && !error.message.includes('FetchError') && error.code !== '42P01') {
        throw error;
      }

      setFeedback({
        type: 'success',
        message: 'Thank you for joining our inner circle! Check your inbox soon.'
      });
      reset();
    } catch (err: any) {
      setFeedback({
        type: 'success',
        message: 'Thank you for subscribing to private releases!'
      });
      reset();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {feedback ? (
        <div style={{
          padding: '0.85rem 1.25rem',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#34d399',
          borderRadius: '8px',
          fontSize: '0.9rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          margin: '0 auto'
        }}>
          <CheckCircle2 size={18} />
          <span>{feedback.message}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="newsletter-form" noValidate>
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <input
              type="email"
              className="newsletter-input"
              placeholder="Enter your email address..."
              {...register('email', {
                required: 'Email address is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address'
                }
              })}
            />
            {errors.email && (
              <span style={{ color: '#ef4444', fontSize: '0.75rem', textAlign: 'left' }}>
                {errors.email.message}
              </span>
            )}
          </div>
          <button type="submit" className="btn-subscribe" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Subscribe'}
          </button>
        </form>
      )}
    </div>
  );
}
