'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Database, CheckCircle2, AlertTriangle, ShieldCheck, KeyRound } from 'lucide-react';

export default function SupabaseStatus() {
  const [status, setStatus] = useState<'configured' | 'unconfigured' | 'testing'>('testing');
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (
      envUrl &&
      envKey &&
      !envUrl.includes('your-project.supabase.co') &&
      !envKey.includes('your-anon-key')
    ) {
      setUrl(envUrl);
      setStatus('configured');
    } else {
      setUrl(envUrl || 'Not provided');
      setStatus('unconfigured');
    }
  }, []);

  return (
    <div className="glass-card animate-fade-in mb-8">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            padding: '0.6rem',
            background: 'rgba(99, 102, 241, 0.15)',
            borderRadius: '10px',
            color: '#818cf8',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Database size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc' }}>Supabase SDK Integration</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Client & Server helper modules ready in <code style={{ background: 'rgba(255,255,255,0.08)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>src/lib/supabase</code></p>
          </div>
        </div>

        <div>
          {status === 'configured' ? (
            <span className="badge badge-success">
              <CheckCircle2 size={14} /> Connected: {url.replace('https://', '').split('.')[0]}
            </span>
          ) : (
            <span className="badge badge-warning">
              <AlertTriangle size={14} /> Setup Required (.env.local)
            </span>
          )}
        </div>
      </div>

      {status === 'unconfigured' && (
        <div style={{
          marginTop: '1.25rem',
          padding: '1rem',
          background: 'rgba(15, 23, 42, 0.5)',
          borderRadius: '8px',
          border: '1px border var(--card-border)',
          fontSize: '0.85rem',
          color: '#cbd5e1'
        }}>
          <p style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <KeyRound size={16} color="#f59e0b" /> To activate real database connections:
          </p>
          <ol style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <li>Open <code style={{ color: '#818cf8' }}>.env.local</code> in the project root.</li>
            <li>Add your Supabase Project URL and Anon Public Key from the Supabase Dashboard.</li>
            <li>Submit forms below to store real records in your Supabase tables!</li>
          </ol>
        </div>
      )}
    </div>
  );
}
