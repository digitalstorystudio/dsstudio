'use client';

import { useState } from 'react';
import { supabase, DEMO_MODE } from '../../lib/supabase';

export default function SignupPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSignup(e) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    if (DEMO_MODE) {
      setError('Demo mode: account creation requires a real Supabase connection.');
      return;
    }

    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message || 'Sign up failed. Please try again.');
    } else {
      setSuccess(true);
    }
  }

  // ── Styles ───────────────────────────────────────────────────────
  const pageStyle = {
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at 50% 0%, rgba(0,240,255,0.08) 0%, #0a0a1a 60%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '2rem', fontFamily: 'Montserrat, sans-serif',
  };

  const cardStyle = {
    width: '100%', maxWidth: '440px',
    background: 'rgba(10,10,30,0.9)',
    border: '1px solid rgba(0,240,255,0.2)',
    borderRadius: '20px', padding: '2.5rem',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  };

  // ── Success ──────────────────────────────────────────────────────
  if (success) {
    return (
      <div style={pageStyle}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✅</div>
            <h1 style={{ color: '#00ff64', fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              Account Created!
            </h1>
            <p style={{ color: '#b0b0ff', fontSize: '0.9rem', lineHeight: 1.7 }}>
              A confirmation email has been sent to<br />
              <strong style={{ color: '#00f0ff' }}>{email}</strong><br /><br />
              Please check your inbox and click the link to verify your email before logging in.
            </p>
          </div>
          <a
            href="/admin"
            style={{ display: 'block', textAlign: 'center', background: '#00f0ff', color: '#0a0a1a', padding: '0.85rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem' }}
          >
            Go to Login →
          </a>
          <p style={{ textAlign: 'center', color: 'rgba(176,176,255,0.4)', fontSize: '0.78rem', marginTop: '1.5rem' }}>
            Digital Story Studio © {new Date().getFullYear()} · Delhi NCR
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={{ width: '100%', maxWidth: '440px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 70, height: 70, borderRadius: '50%',
            border: '3px solid #00f0ff', boxShadow: '0 0 20px rgba(0,240,255,0.5)',
            background: 'rgba(0,240,255,0.1)', margin: '0 auto 1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
          }}>📸</div>
          <h1 style={{ fontWeight: 900, color: '#00f0ff', fontSize: '1.6rem', textShadow: '0 0 15px rgba(0,240,255,0.7)', marginBottom: '0.25rem' }}>
            Digital Story Studio
          </h1>
          <p style={{ color: '#b0b0ff', fontSize: '0.9rem' }}>Admin Account Setup</p>
        </div>

        <div style={cardStyle}>
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.5rem' }}>
            🔒 Create Admin Account
          </h2>
          <p style={{ color: '#b0b0ff', fontSize: '0.88rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            This page is for authorised admin setup only. Create your account below — you'll receive a verification email before you can log in.
          </p>

          {DEMO_MODE && (
            <div style={{ background: 'rgba(255,200,0,0.08)', border: '1px solid rgba(255,200,0,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem', color: '#ffc800', fontSize: '0.85rem' }}>
              🧪 <strong>Demo Mode</strong> — Connect Supabase to create real accounts.
            </div>
          )}

          {error && (
            <div style={{ background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#ff6b6b', fontSize: '0.88rem', display: 'flex', gap: '0.5rem' }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSignup}>
            {/* Email */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', color: '#b0b0ff', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem' }}>
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

            {/* Password */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', color: '#b0b0ff', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  required
                  className="form-input"
                  autoComplete="new-password"
                  style={{ paddingRight: '3rem' }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#b0b0ff', cursor: 'pointer', fontSize: '1.1rem' }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {/* Strength indicator */}
              {password.length > 0 && (
                <div style={{ marginTop: '0.4rem', display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{ height: '3px', flex: 1, borderRadius: '2px', transition: 'all 0.2s', background: password.length >= i * 3 ? (password.length >= 10 ? '#00ff64' : '#ffc800') : 'rgba(255,255,255,0.1)' }} />
                  ))}
                  <span style={{ color: password.length >= 10 ? '#00ff64' : '#ffc800', fontSize: '0.72rem', marginLeft: '4px', whiteSpace: 'nowrap' }}>
                    {password.length < 8 ? 'Too short' : password.length < 10 ? 'Good' : 'Strong ✓'}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'block', color: '#b0b0ff', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Re-enter password"
                required
                className="form-input"
                autoComplete="new-password"
                style={{ borderColor: confirm && confirm !== password ? 'rgba(255,50,50,0.5)' : confirm && confirm === password ? 'rgba(0,255,100,0.5)' : '' }}
              />
              {confirm && confirm !== password && (
                <p style={{ color: '#ff6b6b', fontSize: '0.78rem', marginTop: '0.3rem' }}>❌ Passwords don't match</p>
              )}
              {confirm && confirm === password && (
                <p style={{ color: '#00ff64', fontSize: '0.78rem', marginTop: '0.3rem' }}>✅ Passwords match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}
            >
              {loading ? (
                <><div className="spinner" style={{ width: 20, height: 20, borderWidth: '2px' }} /> Creating account...</>
              ) : '🔐 Create Admin Account'}
            </button>

            <p style={{ textAlign: 'center', color: '#b0b0ff', fontSize: '0.85rem' }}>
              Already have an account?{' '}
              <a href="/admin" style={{ color: '#00f0ff', textDecoration: 'underline', textUnderlineOffset: '2px' }}>Sign in</a>
            </p>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(176,176,255,0.4)', fontSize: '0.78rem', marginTop: '1.5rem' }}>
          Digital Story Studio © {new Date().getFullYear()} · Delhi NCR
        </p>
      </div>
    </div>
  );
}
