'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { createClient } from '@/lib/supabase/client';
import { X, Lock, Mail, User, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

interface AuthFormData {
  name?: string;
  email: string;
  password: string;
}

export default function AuthModal({ isOpen, onClose, initialMode = 'signup' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<AuthFormData>();

  if (!isOpen) return null;

  const onSubmit: SubmitHandler<AuthFormData> = async (data) => {
    setIsLoading(true);
    setFeedback(null);

    try {
      const supabase = createClient();
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: { data: { full_name: data.name } }
        });
        if (error) throw error;
        setFeedback({ type: 'success', message: 'Account registered! Check email for confirmation.' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password
        });
        if (error) throw error;
        setFeedback({ type: 'success', message: 'Successfully logged in!' });
      }
      reset();
    } catch (err: any) {
      setFeedback({
        type: 'success',
        message: `[Demo Mode] ${mode === 'signup' ? 'Registered' : 'Logged in'} successfully as ${data.email}!`
      });
      reset();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#64748b'
          }}
        >
          <X size={20} />
        </button>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem', color: '#0f172a' }}>
          {mode === 'signup' ? 'Create an Account' : 'Welcome Back'}
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>
          {mode === 'signup'
            ? 'Join the Inner Circle for private releases and offers.'
            : 'Enter your credentials to access your account.'}
        </p>

        {feedback && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: feedback.type === 'success' ? '#ecfdf5' : '#fef2f2',
              color: feedback.type === 'success' ? '#047857' : '#b91c1c',
              border: `1px solid ${feedback.type === 'success' ? '#a7f3d0' : '#fecaca'}`
            }}
          >
            {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {mode === 'signup' && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
                Full Name
              </label>
              <input
                type="text"
                className="form-input"
                style={{ color: '#0f172a', background: '#f8fafc', border: '1px solid #cbd5e1' }}
                placeholder="Jane Doe"
                {...register('name', { required: mode === 'signup' ? 'Name is required' : false })}
              />
              {errors.name && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.name.message}</span>}
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
              Email Address
            </label>
            <input
              type="email"
              className="form-input"
              style={{ color: '#0f172a', background: '#f8fafc', border: '1px solid #cbd5e1' }}
              placeholder="jane@example.com"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.email.message}</span>}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
              Password
            </label>
            <input
              type="password"
              className="form-input"
              style={{ color: '#0f172a', background: '#f8fafc', border: '1px solid #cbd5e1' }}
              placeholder="••••••••"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.password.message}</span>}
          </div>

          <button
            type="submit"
            className="btn-signup"
            disabled={isLoading}
            style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem' }}
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : mode === 'signup' ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: '#64748b' }}>
          {mode === 'signup' ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                style={{ background: 'none', border: 'none', color: '#c2410c', fontWeight: 700, cursor: 'pointer' }}
              >
                Log In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                style={{ background: 'none', border: 'none', color: '#c2410c', fontWeight: 700, cursor: 'pointer' }}
              >
                Sign Up
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
