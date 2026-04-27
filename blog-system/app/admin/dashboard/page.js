'use client';

import { useEffect, useState } from 'react';
import { getAllPostsAdmin, publishScheduledPosts } from '../../../lib/supabase';
import Link from 'next/link';

export default function AdminDashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadPosts();
    // Auto-publish scheduled posts on dashboard load
    publishScheduledPosts();
  }, []);

  async function loadPosts() {
    const { data } = await getAllPostsAdmin();
    setPosts(data || []);
    setLoading(false);
  }

  const stats = {
    total: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    scheduled: posts.filter(p => p.status === 'scheduled').length,
    drafts: posts.filter(p => p.status === 'draft').length,
    totalViews: posts.reduce((sum, p) => sum + (p.view_count || 0), 0),
  };

  const recentPosts = posts.slice(0, 5);

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Montserrat', fontWeight: 900, color: '#fff', fontSize: '1.8rem', marginBottom: '0.25rem' }}>
            Dashboard
          </h1>
          <p style={{ color: '#b0b0ff', fontFamily: 'Montserrat', fontSize: '0.9rem' }}>
            Digital Story Studio · Blog Management
          </p>
        </div>
        <Link href="/admin/posts/new" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
          ✍️ Write New Post
        </Link>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {[
          { label: 'Total Posts', value: stats.total, icon: '📝', color: '#00f0ff' },
          { label: 'Published', value: stats.published, icon: '🟢', color: '#00ff64' },
          { label: 'Scheduled', value: stats.scheduled, icon: '🕐', color: '#008cff' },
          { label: 'Drafts', value: stats.drafts, icon: '📋', color: '#ffc800' },
          { label: 'Total Views', value: stats.totalViews, icon: '👁', color: '#b0b0ff' },
        ].map(stat => (
          <div
            key={stat.label}
            className="glass-card"
            style={{ padding: '1.5rem', textAlign: 'center' }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
            <div style={{ fontFamily: 'Montserrat', fontWeight: 900, fontSize: '2rem', color: stat.color, lineHeight: 1 }}>
              {loading ? '—' : stat.value}
            </div>
            <div style={{ fontFamily: 'Montserrat', fontSize: '0.8rem', color: '#b0b0ff', marginTop: '0.25rem' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: 'Montserrat', fontWeight: 700, color: '#00f0ff', fontSize: '1.1rem', marginBottom: '1rem' }}>
          Quick Actions
        </h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/admin/posts/new"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.3)', borderRadius: '10px', color: '#00f0ff', textDecoration: 'none', fontFamily: 'Montserrat', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,240,255,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,240,255,0.1)'}
          >
            ✍️ New Blog Post
          </Link>
          <Link href="/admin/posts"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.3)', borderRadius: '10px', color: '#00f0ff', textDecoration: 'none', fontFamily: 'Montserrat', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s' }}
          >
            📋 Manage All Posts
          </Link>
          <a href="https://digitalstorystudio.in/blog" target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.3)', borderRadius: '10px', color: '#00f0ff', textDecoration: 'none', fontFamily: 'Montserrat', fontWeight: 600, fontSize: '0.9rem' }}
          >
            🌐 View Live Blog
          </a>
        </div>
      </div>

      {/* Recent Posts */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontFamily: 'Montserrat', fontWeight: 700, color: '#00f0ff', fontSize: '1.1rem' }}>
            Recent Posts
          </h2>
          <Link href="/admin/posts" style={{ color: '#b0b0ff', fontFamily: 'Montserrat', fontSize: '0.85rem', textDecoration: 'none' }}>
            View all →
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <div className="spinner" />
          </div>
        ) : recentPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#b0b0ff', fontFamily: 'Montserrat' }}>
            <p>No posts yet. <Link href="/admin/posts/new" style={{ color: '#00f0ff' }}>Write your first post →</Link></p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Montserrat' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(0,240,255,0.15)' }}>
                  {['Title', 'Status', 'Views', 'Date', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.75rem', color: '#b0b0ff', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentPosts.map(post => (
                  <tr key={post.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,240,255,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '0.9rem 0.75rem' }}>
                      <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: '280px' }}>
                        {post.title}
                      </span>
                    </td>
                    <td style={{ padding: '0.9rem 0.75rem' }}>
                      <span className={`status-${post.status}`}>{post.status}</span>
                    </td>
                    <td style={{ padding: '0.9rem 0.75rem', color: '#b0b0ff', fontSize: '0.85rem' }}>
                      {post.view_count || 0}
                    </td>
                    <td style={{ padding: '0.9rem 0.75rem', color: '#b0b0ff', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString('en-IN')
                        : post.scheduled_at
                        ? `⏰ ${new Date(post.scheduled_at).toLocaleDateString('en-IN')}`
                        : new Date(post.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td style={{ padding: '0.9rem 0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link href={`/admin/posts/${post.id}/edit`}
                          style={{ padding: '4px 12px', background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.3)', borderRadius: '6px', color: '#00f0ff', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}>
                          Edit
                        </Link>
                        {post.status === 'published' && (
                          <a href={`https://digitalstorystudio.in/blog/${post.slug}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ padding: '4px 12px', background: 'rgba(0,255,100,0.1)', border: '1px solid rgba(0,255,100,0.3)', borderRadius: '6px', color: '#00ff64', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}>
                            View
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
