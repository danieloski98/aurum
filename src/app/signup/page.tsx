'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm, SubmitHandler } from 'react-hook-form';
import { createClient } from '@/lib/supabase/client';
import { Mail, Key, Eye, EyeOff, User, ArrowRight, ShieldCheck, Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface SignupFormData {
  fullName: string;
  email: string;
  password: string;
  deliveryAddress: string;
  acceptTerms: boolean;
}

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<SignupFormData>({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      deliveryAddress: '',
      acceptTerms: false
    }
  });

  const onSubmit: SubmitHandler<SignupFormData> = async (data) => {
    setIsLoading(true);
    setFeedback(null);

    try {
      const supabase = createClient();
      
      // 1. Create account in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            delivery_address: data.deliveryAddress
          }
        }
      });

      if (authError) {
        if (authError.status === 429 || authError.message.toLowerCase().includes('rate limit')) {
          setFeedback({
            type: 'error',
            message: `Supabase Rate Limit Exceeded (429): Email confirmation limit reached. Disable "Confirm email" in Supabase Dashboard -> Auth -> Providers -> Email for instant signups during development.`
          });
        } else {
          setFeedback({
            type: 'error',
            message: `Supabase Error: ${authError.message}`
          });
        }
        setIsLoading(false);
        return;
      }

      // 2. Store profile in Supabase 'profiles' database table
      if (authData?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([
            {
              id: authData.user.id,
              full_name: data.fullName,
              email: data.email,
              delivery_address: data.deliveryAddress,
              updated_at: new Date().toISOString()
            }
          ]);

        if (profileError) {
          console.warn('Profile table note:', profileError.message);
        }
      }

      setFeedback({
        type: 'success',
        message: `Account created successfully for ${data.email}! User profile saved to Supabase.`
      });
      reset();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'An unexpected error occurred during sign up.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc' }}>
      {/* 1. Header / Navbar */}
      <header className="navbar">
        <div className="navbar-container">
          <Link href="/" className="navbar-brand">
            <div className="logo-icon">S</div>
            <span>Storefront</span>
          </Link>

          <nav className="nav-links">
            <Link href="/" className="nav-link">Shop</Link>
            <Link href="/#curated" className="nav-link">Help</Link>
          </nav>

          <div className="nav-actions">
            <button className="user-icon-btn" title="User Profile">
              <User size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Signup Area */}
      <main className="auth-page-wrapper" style={{ flexGrow: 1, padding: '3.5rem 1.5rem' }}>
        <div className="signup-container">
          {/* Left Column: Brand Showcase */}
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.2em', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              —— AURUM & CO. MEMBERSHIP
            </p>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.15, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
              Elevate Your Shopping Experience.
            </h1>
            <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '480px' }}>
              Create your account to unlock curated collections, priority 256-bit secure checkout, and seamless worldwide delivery tailored to your precise preferences.
            </p>

            {/* Store Image Preview Card */}
            <div style={{ position: 'relative', width: '100%', height: '240px', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-md)', marginBottom: '1.5rem' }}>
              <Image
                src="/images/store_interior.jpg"
                alt="Store Interior"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                style={{ objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,23,42,0.1) 0%, rgba(15,23,42,0.85) 100%)' }} />
              <div style={{ position: 'absolute', bottom: '1.25rem', left: '1.25rem', right: '1.25rem', color: '#ffffff' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.4 }}>
                  Trusted Worldwide — Over 50,000 satisfied members enjoying timeless luxury commerce.
                </p>
              </div>
            </div>

            {/* Security Badges Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.8rem', color: '#64748b' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Lock size={14} /> 256-Bit SSL Encryption
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={14} /> Data Privacy Guaranteed
              </span>
            </div>
          </div>

          {/* Right Column: Sign Up Form Card */}
          <div className="signup-card">
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
              Create Account
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.75rem' }}>
              Please fill in your details to get started.
            </p>

            {feedback && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  marginBottom: '1.25rem',
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
              {/* Name & Email 2-column Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.35rem' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    className={`auth-input ${errors.fullName ? 'error' : ''}`}
                    style={{ paddingLeft: '0.9rem' }}
                    placeholder="e.g. Eleanor Vance"
                    {...register('fullName', {
                      required: 'Full name is required',
                      minLength: { value: 2, message: 'Name must be at least 2 characters' }
                    })}
                  />
                  {errors.fullName && (
                    <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.2rem', display: 'block' }}>
                      {errors.fullName.message}
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.35rem' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    className={`auth-input ${errors.email ? 'error' : ''}`}
                    style={{ paddingLeft: '0.9rem' }}
                    placeholder="eleanor@example.com"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Enter a valid email'
                      }
                    })}
                  />
                  {errors.email && (
                    <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.2rem', display: 'block' }}>
                      {errors.email.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.35rem' }}>
                  Password
                </label>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`auth-input has-right-icon ${errors.password ? 'error' : ''}`}
                    style={{ paddingLeft: '0.9rem' }}
                    placeholder="••••••••••••"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 8, message: 'Must be at least 8 characters' },
                      pattern: {
                        value: /^(?=.*[0-9])(?=.*[!@#$%^&*])/,
                        message: 'Must contain at least 1 number and 1 special symbol (!@#$%^&*)'
                      }
                    })}
                  />
                  <button
                    type="button"
                    className="input-icon-right"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password ? (
                  <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.2rem', display: 'block' }}>
                    {errors.password.message}
                  </span>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem', display: 'block' }}>
                    Must be at least 8 characters with a number and symbol.
                  </span>
                )}
              </div>

              {/* Delivery Address */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.35rem' }}>
                  Delivery Address
                </label>
                <textarea
                  className={`auth-textarea ${errors.deliveryAddress ? 'error' : ''}`}
                  placeholder="Street address, apartment, suite, city, postal code"
                  {...register('deliveryAddress', {
                    required: 'Delivery address is required'
                  })}
                />
                {errors.deliveryAddress && (
                  <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.2rem', display: 'block' }}>
                    {errors.deliveryAddress.message}
                  </span>
                )}
              </div>

              {/* Terms Checkbox */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.78rem', color: '#64748b', cursor: 'pointer', lineHeight: 1.4 }}>
                  <input
                    type="checkbox"
                    style={{ width: '1rem', height: '1rem', accentColor: '#0f172a', marginTop: '0.1rem', flexShrink: 0 }}
                    {...register('acceptTerms', {
                      required: 'You must accept the terms of service'
                    })}
                  />
                  <span>
                    I agree to the Terms of Service and Privacy Policy, acknowledging our secure 256-bit SSL encrypted data handling.
                  </span>
                </label>
                {errors.acceptTerms && (
                  <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                    {errors.acceptTerms.message}
                  </span>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn-signup"
                disabled={isLoading}
                style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', borderRadius: '6px' }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} /> Creating Account...
                  </>
                ) : (
                  <>
                    Create Account <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Footer Link */}
            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: '#c2410c', fontWeight: 700 }}>
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Footer */}
      <footer className="footer">
        <p>© 2024 Storefront. All rights reserved.</p>
      </footer>
    </div>
  );
}
