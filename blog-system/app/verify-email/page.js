'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, DEMO_MODE } from '../../lib/supabase';
import { Suspense } from 'react';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (DEMO_MODE) {
      setStatus('error');
      setMessage('Demo mode: email verification requires real Supabase.');
      return;
    }

    // Supabase sends ?token_hash=xxx&type=email or type=signup
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type');

    if (tokenHash && (type === 'email' || type === 'signup')) {
      supabase.auth.verifyOtp({ token_hash: tokenHash, type })
        .then(({ error }) => {
          if (error) {
            setStatus('error');
            setMessage(error.message || 'Verification failed. Link may have expired.');
          } else {
            setStatus('success');
            setTimeout(() => router.push('/admin/dashboard'), 3000);
          }
        });
    } else {
      // Check if already verified via hash fragment (older Supabase flow)
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setStatus('success');
          setTimeout(() => router.push('/admin/dashboard'), 3000);
        } else {
          setStatus('error');
          setMessage('Invalid or expired verification link. Please request a new one.');
        }
      });
    }
  }, []);

  const pageStyle = {
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at 50% 0%, rgba(0,240,255,0.08) 0%, #0a0a1a 60%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '2rem', fontFamily: 'Montserrat, sans-serif',
  };

  const cardStyle = {
    width: '100%', maxWidth: '440px', textAlign: 'center',
    background: 'rgba(10,10,30,0.9)',
    border: '1px solid rgba(0,240,255,0.2)',
    borderRadius: '20px', padding: '3rem 2.5rem',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  };

  if (status === 'verifying') return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ fontSize: '3rem', marginBottom: '1.5rem', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</div>
        <h2 style={{ color: '#00f0ff', fontWeight: 800, fontSize: '1.4rem', marginBottom: '0.75rem' }}>Verifying Email...</h2>
        <p style={{ color: '#b0b0ff', fontSize: '0.9rem' }}>Please wait a moment.</p>
      </div>
    </div>
  );

  if (status === 'success') return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1.5rem' }}>✅</div>
        <h2 style={{ color: '#00ff64', fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.75rem' }}>
          Email Verified!
        </h2>
        <p style={{ color: '#b0b0ff', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.7 }}>
          Your email has been verified successfully.<br />
          Redirecting you to dashboard...
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ff64', animation: `bounce 0.6s ${i * 0.15}s infinite alternate` }} />
          ))}
        </div>
        <style>{`@keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-8px); } }`}</style>
      </div>
    </div>
  );

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>❌</div>
        <h2 style={{ color: '#ff6b6b', fontWeight: 800, fontSize: '1.4rem', marginBottom: '0.75rem' }}>
          Verification Failed
        </h2>
        <p style={{ color: '#b0b0ff', fontSize: '0.88rem', marginBottom: '2rem', lineHeight: 1.7 }}>
          {message || 'The link has expired or is invalid.'}
        </p>
        <a href="/admin" style={{ display: 'inline-block', background: '#00f0ff', color: '#0a0a1a', padding: '0.85rem 2rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>
          ← Back to Login
        </a>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0a0a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b0b0ff', fontFamily: 'Montserrat' }}>
        Loading...
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
