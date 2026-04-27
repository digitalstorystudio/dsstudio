'use client';

import Link from 'next/link';
import { format } from 'date-fns';

export default function BlogCard({ post, index = 0 }) {
  const publishedDate = post.published_at
    ? format(new Date(post.published_at), 'MMM dd, yyyy')
    : '';

  // Alternate placeholder colors for cards without images
  const gradients = [
    'linear-gradient(135deg, rgba(0,240,255,0.2), rgba(0,140,255,0.1))',
    'linear-gradient(135deg, rgba(0,140,255,0.2), rgba(0,240,255,0.1))',
    'linear-gradient(135deg, rgba(176,0,255,0.15), rgba(0,240,255,0.1))',
  ];
  const placeholderBg = gradients[index % gradients.length];

  return (
    <Link
      href={`/blog/${post.slug}`}
      style={{ textDecoration: 'none' }}
    >
      <article
        className="glass-card fade-in-up"
        style={{
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          animationDelay: `${index * 0.1}s`,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-6px)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,240,255,0.2)';
          e.currentTarget.style.borderColor = 'rgba(0,240,255,0.4)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.borderColor = 'rgba(0,240,255,0.15)';
        }}
      >
        {/* Thumbnail */}
        <div style={{ height: '220px', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
          {post.featured_image ? (
            <img
              src={post.featured_image}
              alt={post.title}
              loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', background: placeholderBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '3rem' }}>📸</span>
            </div>
          )}

          {/* Date overlay */}
          {publishedDate && (
            <div style={{
              position: 'absolute', bottom: '10px', left: '10px',
              background: 'rgba(10,10,26,0.85)', backdropFilter: 'blur(10px)',
              color: '#00f0ff', fontSize: '0.75rem', fontWeight: 600,
              padding: '4px 10px', borderRadius: '20px', fontFamily: 'Montserrat',
              border: '1px solid rgba(0,240,255,0.3)',
            }}>
              {publishedDate}
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
              {post.tags.slice(0, 3).map(tag => (
                <span key={tag} className="tag-badge" style={{ fontSize: '0.72rem' }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h2 style={{
            fontFamily: 'Montserrat', fontWeight: 700, fontSize: '1.1rem',
            color: '#fff', marginBottom: '0.75rem', lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {post.title}
          </h2>

          {/* Excerpt */}
          {post.excerpt && (
            <p style={{
              color: '#b0b0ff', fontFamily: 'Montserrat', fontSize: '0.9rem',
              lineHeight: 1.7, flex: 1,
              display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {post.excerpt}
            </p>
          )}

          {/* Read More */}
          <div style={{
            marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ color: '#00f0ff', fontFamily: 'Montserrat', fontWeight: 600, fontSize: '0.9rem' }}>
              Read More →
            </span>
            <span style={{ color: 'rgba(176,176,255,0.4)', fontSize: '0.75rem', fontFamily: 'Montserrat' }}>
              📍 Delhi NCR
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
