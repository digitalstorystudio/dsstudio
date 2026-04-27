'use client';

import { useEffect, useState } from 'react';
import { getAllPostsAdmin, deletePost } from '../../../lib/supabase';
import Link from 'next/link';

export default function AllPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    const { data } = await getAllPostsAdmin();
    setPosts(data || []);
    setLoading(false);
  }

  async function handleDelete(id, title) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    const { error } = await deletePost(id);
    if (!error) {
      setPosts(prev => prev.filter(p => p.id !== id));
    }
    setDeleting(null);
  }

  const filtered = posts.filter(p => {
    const matchesFilter = filter === 'all' || p.status === filter;
    const matchesSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Montserrat', fontWeight: 900, color: '#fff', fontSize: '1.8rem', marginBottom: '0.25rem' }}>
            All Posts
          </h1>
          <p style={{ color: '#b0b0ff', fontFamily: 'Montserrat', fontSize: '0.9rem' }}>
            {posts.length} total posts
          </p>
        </div>
        <Link href="/admin/posts/new" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
          ✍️ Write New Post
        </Link>
      </div>

      {/* Filters + Search */}
      <div className="glass-card" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['all', 'published', 'scheduled', 'draft'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '0.4rem 1rem', borderRadius: '20px', cursor: 'pointer',
                fontFamily: 'Montserrat', fontWeight: 600, fontSize: '0.82rem',
                border: filter === f ? '1px solid #00f0ff' : '1px solid rgba(0,240,255,0.2)',
                background: filter === f ? 'rgba(0,240,255,0.15)' : 'transparent',
                color: filter === f ? '#00f0ff' : '#b0b0ff',
                transition: 'all 0.2s',
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span style={{ marginLeft: '0.4rem', fontSize: '0.75rem' }}>
                ({f === 'all' ? posts.length : posts.filter(p => p.status === f).length})
              </span>
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="form-input"
          style={{ maxWidth: '280px', marginLeft: 'auto' }}
        />
      </div>

      {/* Posts Table */}
      <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#b0b0ff', fontFamily: 'Montserrat' }}>
            <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>📭</p>
            <p>No posts found. <Link href="/admin/posts/new" style={{ color: '#00f0ff' }}>Create your first post →</Link></p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Montserrat' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(0,240,255,0.15)' }}>
                {['Title', 'Status', 'Views', 'Date', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.75rem', color: '#b0b0ff', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(post => (
                <tr
                  key={post.id}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,240,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '1rem 0.75rem' }}>
                    <div>
                      <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.2rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {post.title}
                      </div>
                      <div style={{ color: 'rgba(176,176,255,0.5)', fontSize: '0.75rem' }}>
                        /{post.slug}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 0.75rem' }}>
                    <span className={`status-${post.status}`}>{post.status}</span>
                  </td>
                  <td style={{ padding: '1rem 0.75rem', color: '#b0b0ff', fontSize: '0.85rem' }}>
                    {post.view_count || 0}
                  </td>
                  <td style={{ padding: '1rem 0.75rem', color: '#b0b0ff', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                    {post.status === 'published' && post.published_at
                      ? `📅 ${new Date(post.published_at).toLocaleDateString('en-IN')}`
                      : post.status === 'scheduled' && post.scheduled_at
                      ? `⏰ ${new Date(post.scheduled_at).toLocaleDateString('en-IN')}`
                      : `🗒️ ${new Date(post.created_at).toLocaleDateString('en-IN')}`}
                  </td>
                  <td style={{ padding: '1rem 0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'nowrap' }}>
                      <Link href={`/admin/posts/${post.id}/edit`}
                        style={{ padding: '5px 12px', background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.3)', borderRadius: '6px', color: '#00f0ff', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        ✏️ Edit
                      </Link>
                      {post.status === 'published' && (
                        <a href={`https://digitalstorystudio.in/blog/${post.slug}`}
                          target="_blank" rel="noopener noreferrer"
                          style={{ padding: '5px 12px', background: 'rgba(0,255,100,0.1)', border: '1px solid rgba(0,255,100,0.3)', borderRadius: '6px', color: '#00ff64', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600 }}>
                          🌐 View
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        disabled={deleting === post.id}
                        style={{ padding: '5px 12px', background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.3)', borderRadius: '6px', color: '#ff6b6b', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, opacity: deleting === post.id ? 0.5 : 1 }}>
                        {deleting === post.id ? '...' : '🗑️'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
