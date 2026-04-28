'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if this is a Supabase auth callback (password reset, email confirm, etc.)
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      // Password reset link — forward to reset-password page with the token
      router.replace('/reset-password' + hash);
    } else if (hash && hash.includes('access_token')) {
      // Other auth callbacks — forward to admin
      router.replace('/admin' + hash);
    } else {
      // Normal root visit — go to blog
      router.replace('/blog');
    }
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a1a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#b0b0ff',
      fontFamily: 'Montserrat, sans-serif',
    }}>
      <p>Loading...</p>
    </div>
  );
}
