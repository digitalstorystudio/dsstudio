'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase, DEMO_MODE, signOut } from '../../lib/supabase';
import Link from 'next/link';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  const isLoginPage = pathname === '/admin';

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false);
      return;
    }

    // Demo mode: check sessionStorage for demo login flag
    if (DEMO_MODE) {
      const demoUser = sessionStorage.getItem('demo_admin_user');
      if (!demoUser) {
        router.replace('/admin');
      } else {
        setUser({ email: demoUser });
      }
      setChecking(false);
      return;
    }

    // Real Supabase auth check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/admin');
      } else {
        setUser(session.user);
      }
      setChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && !isLoginPage) {
        router.replace('/admin');
      } else if (session) {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname]);

  async function handleLogout() {
    if (DEMO_MODE) {
      sessionStorage.removeItem('demo_admin_user');
    } else {
      await signOut();
    }
    router.push('/admin');
  }

  if (isLoginPage) return <>{children}</>;

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0a0a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#00f0ff', fontFamily: 'Montserrat', fontSize: '1rem' }}>Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const navItems = [
    { href: '/admin/dashboard', label: '📊 Dashboard' },
    { href: '/admin/posts', label: '📝 All Posts' },
    { href: '/admin/posts/new', label: '✍️ New Post' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a1a', display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px', flexShrink: 0,
        background: 'rgba(5,5,20,0.98)',
        borderRight: '1px solid rgba(0,240,255,0.15)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50,
        overflowY: 'auto',
      }}>
        {/* Brand */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(0,240,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', border: '2px solid #00f0ff', background: 'rgba(0,240,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '1.1rem' }}>📸</span>
            </div>
            <div>
              <div style={{ fontFamily: 'Montserrat', fontWeight: 800, color: '#00f0ff', fontSize: '0.95rem' }}>Digital Story</div>
              <div style={{ fontFamily: 'Montserrat', color: '#b0b0ff', fontSize: '0.75rem' }}>
                Blog Admin {DEMO_MODE && <span style={{ color: '#ffc800', fontSize: '0.7rem' }}>· DEMO</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ padding: '1rem 0', flex: 1 }}>
          {navItems.map(item => (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '0.85rem 1.5rem', textDecoration: 'none',
              fontFamily: 'Montserrat', fontWeight: 600, fontSize: '0.9rem',
              color: pathname.startsWith(item.href) ? '#00f0ff' : '#b0b0ff',
              background: pathname.startsWith(item.href) ? 'rgba(0,240,255,0.08)' : 'transparent',
              borderLeft: pathname.startsWith(item.href) ? '3px solid #00f0ff' : '3px solid transparent',
              transition: 'all 0.2s ease',
            }}>
              {item.label}
            </Link>
          ))}

          <div style={{ margin: '1rem 1.5rem', height: '1px', background: 'rgba(0,240,255,0.1)' }} />

          <a href="/blog" target="_blank" rel="noopener noreferrer" style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '0.85rem 1.5rem', textDecoration: 'none',
            fontFamily: 'Montserrat', fontWeight: 600, fontSize: '0.9rem', color: '#b0b0ff',
          }}>
            🌐 View Live Blog
          </a>
        </nav>

        {/* User + logout */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(0,240,255,0.1)' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ fontFamily: 'Montserrat', fontSize: '0.72rem', color: 'rgba(176,176,255,0.5)', marginBottom: '0.2rem' }}>Logged in as</div>
            <div style={{ fontFamily: 'Montserrat', fontSize: '0.82rem', color: '#b0b0ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
          </div>
          <button onClick={handleLogout} style={{
            width: '100%', padding: '0.6rem', borderRadius: '8px',
            background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.3)',
            color: '#ff6b6b', cursor: 'pointer', fontFamily: 'Montserrat', fontSize: '0.85rem', fontWeight: 600,
          }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: '260px', flex: 1, minHeight: '100vh', overflow: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
