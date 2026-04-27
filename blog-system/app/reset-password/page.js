'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, DEMO_MODE } from '../../lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword]       = useState('');
  const [confirm, setConfirm]         = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState(false);
  const [validToken, setValidToken]   = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Supabase sends user here with a recovery token in the URL hash
  // We listen for PASSWORD_RECOVERY event to confirm the link is valid
  useEffect(() => {
    if (DEMO_MODE) {
      setCheckingToken(false);
      setError('Demo mode: password reset requires real Supabase connection.');
      return;
    }

    // Handle the auth state change triggered by the recovery link
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setValidToken(true);
        setCheckingToken(false);
      }
    });

    // Also check if there's already a session (user clicked link, session was set)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setValidToken(true);
      }
      setCheckingToken(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleReset(e) {
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

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message || 'Failed to update password. Please try again.');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push('/admin'), 2500);
  }

  // ── Shared styles ───────────────────────────────────────────────
  const pageStyle = {
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at 50% 0%, rgba(0,240,255,0.08) 0%, #0a0a1a 60%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '2rem',
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

  // ── Loading state ───────────────────────────────────────────────
  if (checkingToken) {
    return (
      <div style={pageStyle}>
        <div style={{ textAlign: 'center', color: '#b0b0ff' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔐</div>
          <p>Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // ── Success state ───────────────────────────────────────────────
  if (success) {
    return (
      <div style={pageStyle}>
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ color: '#00ff64', fontWeight: 800, marginBottom: '0.5rem' }}>Password Updated!</h2>
          <p style={{ color: '#b0b0ff', fontSize: '0.9rem' }}>Redirecting you to login...</p>
        </div>
      </div>
    );
  }

  // ── Invalid / expired token ─────────────────────────────────────
  if (!validToken && !DEMO_MODE) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', border: '3px solid #ff6b6b', background: 'rgba(255,50,50,0.1)', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>⚠️</div>
            <h1 style={{ color: '#ff6b6b', fontWeight: 800, fontSize: '1.4rem', marginBottom: '0.5rem' }}>Link Expired</h1>
            <p style={{ color: '#b0b0ff', fontSize: '0.9rem', lineHeight: 1.6 }}>
              This password reset link has expired or already been used.<br />Please request a new one.
            </p>
          </div>
          <a href="/admin" style={{ display: 'block', textAlign: 'center', background: '#00f0ff', color: '#0a0a1a', padding: '0.85rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem' }}>
            ← Back to Login
          </a>
        </div>
      </div>
    );
  }

  // ── Main reset form ─────────────────────────────────────────────
  return (
    <div style={pageStyle}>
      <div style={{ width: '100%', maxWidth: '440px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', border: '3px solid #00f0ff', boxShadow: '0 0 20px rgba(0,240,255,0.5)', background: 'rgba(0,240,255,0.1)', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
            📸
          </div>
          <h1 style={{ color: '#00f0ff', fontWeight: 900, fontSize: '1.5rem', textShadow: '0 0 15px rgba(0,240,255,0.7)', marginBottom: '0.25rem' }}>
            Digital Story Studio
          </h1>
          <p style={{ color: '#b0b0ff', fontSize: '0.9rem' }}>Set your new password</p>
        </div>

        <div style={cardStyle}>
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.5rem' }}>
            🔑 Reset Password
          </h2>
          <p style={{ color: '#b0b0ff', fontSize: '0.85rem', marginBottom: '1.75rem' }}>
            Choose a strong password for your admin account.
          </p>

          {error && (
            <div style={{ background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#ff6b6b', fontSize: '0.88rem', display: 'flex', gap: '0.5rem' }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleReset}>
            {/* New Password */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', color: '#b0b0ff', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  required
                  className="form-input"
                  style={{ paddingRight: '3rem' }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#b0b0ff', cursor: 'pointer', fontSize: '1.1rem' }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {/* Password strength indicator */}
              {password.length > 0 && (
                <div style={{ marginTop: '0.4rem', display: 'flex', gap: '4px' }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{ height: '3px', flex: 1, borderRadius: '2px', background: password.length >= i * 3 ? (password.length >= 10 ? '#00ff64' : '#ffc800') : 'rgba(255,255,255,0.1)', transition: 'all 0.2s' }} />
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
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  className="form-input"
                  style={{ paddingRight: '3rem', borderColor: confirm && confirm !== password ? 'rgba(255,50,50,0.5)' : confirm && confirm === password ? 'rgba(0,255,100,0.5)' : '' }}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#b0b0ff', cursor: 'pointer', fontSize: '1.1rem' }}>
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
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
              style={{ width: '100%', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {loading ? (
                <><div className="spinner" style={{ width: 20, height: 20, borderWidth: '2px' }} /> Updating...</>
              ) : (
                '🔐 Set New Password'
              )}
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
