'use client';

/**
 * /login  →  alias for the admin login panel.
 * Redirects immediately to /admin so there is one canonical login URL.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin');
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(0,240,255,0.08) 0%, #0a0a1a 60%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Montserrat, sans-serif', color: '#b0b0ff', fontSize: '1rem',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔐</div>
        <p>Redirecting to login...</p>
      </div>
    </div>
  );
}
