'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, resetPasswordForEmail, DEMO_MODE } from '../../lib/supabase';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password state
  const [forgotMode, setForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent]   = useState(false);
  const [resetError, setResetError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await signIn(email, password);

    if (error) {
      setError(error.message || 'Invalid email or password. Please try again.');
      setLoading(false);
      return;
    }

    if (data?.session || data?.user) {
      if (DEMO_MODE) {
        sessionStorage.setItem('demo_admin_user', email);
      }
      router.push('/admin/dashboard');
      router.refresh();
    }
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');

    if (DEMO_MODE) {
      setResetError('Demo mode: password reset requires a real Supabase connection.');
      setResetLoading(false);
      return;
    }

    const { error } = await resetPasswordForEmail(resetEmail);
    setResetLoading(false);

    if (error) {
      setResetError(error.message || 'Failed to send reset email. Please try again.');
    } else {
      setResetSent(true);
    }
  }

  // ── Shared styles ────────────────────────────────────────────────
  const pageStyle = {
    minHeight: '100vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '2rem',
    background: 'radial-gradient(ellipse at 50% 0%, rgba(0,240,255,0.08) 0%, #0a0a1a 60%)',
    fontFamily: 'Montserrat, sans-serif',
  };

  const cardStyle = {
    width: '100%', maxWidth: '440px',
    background: 'rgba(10,10,30,0.9)',
    border: '1px solid rgba(0,240,255,0.2)',
    borderRadius: '20px',
    padding: '2.5rem',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  };

  // ── Logo block (shared) ──────────────────────────────────────────
  const LogoBlock = () => (
    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
      <div style={{
        width: 70, height: 70, borderRadius: '50%',
        border: '3px solid #00f0ff',
        boxShadow: '0 0 20px rgba(0,240,255,0.5)',
        margin: '0 auto 1rem',
        background: 'rgba(0,240,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '2rem',
      }}>📸</div>
      <h1 style={{ fontWeight: 900, color: '#00f0ff', fontSize: '1.6rem', textShadow: '0 0 15px rgba(0,240,255,0.7)', marginBottom: '0.25rem' }}>
        Digital Story Studio
      </h1>
      <p style={{ color: '#b0b0ff', fontSize: '0.9rem' }}>Blog Admin Panel</p>
    </div>
  );

  // ── Reset sent confirmation ──────────────────────────────────────
  if (resetSent) {
    return (
      <div style={pageStyle}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <LogoBlock />
          <div style={{ ...cardStyle, textAlign: 'center' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1.25rem' }}>📧</div>
            <h2 style={{ color: '#00ff64', fontWeight: 800, fontSize: '1.4rem', marginBottom: '0.75rem' }}>
              Reset Email Sent!
            </h2>
            <p style={{ color: '#b0b0ff', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '2rem' }}>
              A password reset link has been sent to<br />
              <strong style={{ color: '#00f0ff' }}>{resetEmail}</strong><br /><br />
              Check your inbox and click the link to set a new password. The link expires in 1 hour.
            </p>
            <button
              onClick={() => { setForgotMode(false); setResetSent(false); setResetEmail(''); }}
              className="btn-primary"
              style={{ width: '100%' }}
            >
              ← Back to Login
            </button>
          </div>
          <p style={{ textAlign: 'center', color: 'rgba(176,176,255,0.4)', fontSize: '0.78rem', marginTop: '1.5rem' }}>
            Digital Story Studio © {new Date().getFullYear()} · Delhi NCR
          </p>
        </div>
      </div>
    );
  }

  // ── Forgot password form ─────────────────────────────────────────
  if (forgotMode) {
    return (
      <div style={pageStyle}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <LogoBlock />
          <div style={cardStyle}>
            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.5rem' }}>
              🔑 Forgot Password?
            </h2>
            <p style={{ color: '#b0b0ff', fontSize: '0.88rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
              Enter the email address for your admin account. We'll send you a secure link to reset your password.
            </p>

            {resetError && (
              <div style={{ background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#ff6b6b', fontSize: '0.88rem', display: 'flex', gap: '0.5rem' }}>
                <span>⚠️</span> {resetError}
              </div>
            )}

            {DEMO_MODE && (
              <div style={{ background: 'rgba(255,200,0,0.08)', border: '1px solid rgba(255,200,0,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#ffc800', fontSize: '0.85rem' }}>
                🧪 <strong>Demo Mode</strong> — Password reset requires a real Supabase connection.
              </div>
            )}

            <form onSubmit={handleForgotPassword}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: '#b0b0ff', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Admin Email Address
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="form-input"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={resetLoading}
                className="btn-primary"
                style={{ width: '100%', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}
              >
                {resetLoading ? (
                  <><div className="spinner" style={{ width: 20, height: 20, borderWidth: '2px' }} /> Sending...</>
                ) : '📧 Send Reset Link'}
              </button>

              <button
                type="button"
                onClick={() => { setForgotMode(false); setResetError(''); }}
                style={{ width: '100%', background: 'transparent', border: '1px solid rgba(0,240,255,0.25)', color: '#b0b0ff', padding: '0.75rem', borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'Montserrat, sans-serif', transition: 'all 0.2s' }}
              >
                ← Back to Login
              </button>
            </form>
          </div>
          <p style={{ textAlign: 'center', color: 'rgba(176,176,255,0.4)', fontSize: '0.78rem', marginTop: '1.5rem' }}>
            Digital Story Studio © {new Date().getFullYear()} · Delhi NCR
          </p>
        </div>
      </div>
    );
  }

  // ── Main login form ──────────────────────────────────────────────
  return (
    <div style={pageStyle}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <LogoBlock />

        <div style={cardStyle}>
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.5rem' }}>
            Welcome Back 👋
          </h2>
          <p style={{ color: '#b0b0ff', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Sign in to manage your blog posts
          </p>

          {DEMO_MODE && (
            <div style={{ background: 'rgba(0,240,255,0.07)', border: '1px solid rgba(0,240,255,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem', color: '#00f0ff', fontSize: '0.85rem' }}>
              🧪 <strong>Demo Mode</strong> — No Supabase connected yet.<br />
              Use any email + password <strong>demo123</strong> to log in.
            </div>
          )}

          {error && (
            <div style={{ background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem', color: '#ff6b6b', fontSize: '0.9rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <span>⚠️</span>
              <span>{error}
                {error.toLowerCase().includes('invalid') && !DEMO_MODE && (
                  <><br /><span style={{ fontSize: '0.82rem', opacity: 0.85 }}>
                    Tip: Make sure you confirmed your email, or disable email confirmations in Supabase → Authentication → Settings.
                  </span></>
                )}
              </span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', color: '#b0b0ff', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="form-input"
                autoComplete="email"
              />
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ color: '#b0b0ff', fontSize: '0.85rem', fontWeight: 600 }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => { setForgotMode(true); setResetEmail(email); setError(''); }}
                  style={{ background: 'none', border: 'none', color: '#00f0ff', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', padding: 0, textDecoration: 'underline', textUnderlineOffset: '2px' }}
                >
                  Forgot password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="form-input"
                  autoComplete="current-password"
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#b0b0ff', cursor: 'pointer', fontSize: '1.1rem' }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', marginTop: '1.5rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {loading ? (
                <><div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} /> Signing in...</>
              ) : '🔐 Sign In'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(176,176,255,0.4)', fontSize: '0.8rem', marginTop: '1.5rem' }}>
          Digital Story Studio © {new Date().getFullYear()} · Delhi NCR
        </p>
      </div>
    </div>
  );
}
