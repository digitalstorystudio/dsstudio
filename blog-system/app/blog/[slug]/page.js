'use client';
import { useState, useEffect } from 'react';
import { getPostBySlug } from '../../../lib/supabase';
import SiteLayout from '../../../components/SiteLayout';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// Media embed component
function MediaEmbed({ media }) {
  if (!media) return null;
  if (media.type === 'youtube') {
    return (
      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', border: '1px solid rgba(0,240,255,0.2)', marginBottom: '1.5rem' }}>
        <iframe src={media.embedUrl} title="YouTube video" frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen loading="lazy"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
      </div>
    );
  }
  if (media.type === 'instagram') {
    return (
      <div style={{ margin: '1.5rem auto', maxWidth: '550px', borderRadius: '12px', overflow: 'hidden' }}>
        <iframe src={media.embedUrl} width="100%" height="600" frameBorder="0"
          scrolling="no" loading="lazy" title="Instagram post"
          style={{ border: '1px solid rgba(0,240,255,0.2)', borderRadius: '12px' }} />
      </div>
    );
  }
  if (media.type === 'image') {
    return (
      <div style={{ marginBottom: '1.5rem' }}>
        <img src={media.url} alt="Blog media" loading="lazy"
          style={{ width: '100%', borderRadius: '12px', border: '1px solid rgba(0,240,255,0.2)' }} />
      </div>
    );
  }
  return null;
}

export default function BlogPostPage() {
  const params = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await getPostBySlug(params.slug);
      setPost(data);
      setLoading(false);
    }
    load();
  }, [params.slug]);

  if (loading) {
    return (
      <SiteLayout>
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b0b0ff', fontFamily: 'Montserrat' }}>
          Loading...
        </div>
      </SiteLayout>
    );
  }

  if (!post) {
    return (
      <SiteLayout>
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
          <div>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📸</div>
            <h1 style={{ color: '#00f0ff', fontFamily: 'Montserrat', marginBottom: '1rem' }}>Post Not Found</h1>
            <Link href="/blog" style={{ color: '#00f0ff', fontFamily: 'Montserrat' }}>← Back to Blog</Link>
          </div>
        </div>
      </SiteLayout>
    );
  }

  const publishedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <SiteLayout>
      {/* Hero Image */}
      {post.featured_image && (
        <div style={{ position: 'relative', height: '420px', overflow: 'hidden' }}>
          <img src={post.featured_image} alt={post.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.75 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,10,26,0.2) 0%, rgba(10,10,26,0.92) 100%)' }} />
        </div>
      )}

      {/* Article */}
      <article style={{ maxWidth: '820px', margin: '0 auto', padding: post.featured_image ? '0 5% 4rem' : '60px 5% 4rem' }}>

        {/* Breadcrumb */}
        <nav style={{ marginBottom: '1.5rem', paddingTop: post.featured_image ? '2rem' : 0 }}>
          <span style={{ color: '#b0b0ff', fontFamily: 'Montserrat', fontSize: '0.9rem' }}>
            <Link href="/blog" style={{ color: '#00f0ff', textDecoration: 'none' }}>Blog</Link>
            <span style={{ margin: '0 0.5rem' }}>›</span>
            <span>{post.title.substring(0, 50)}{post.title.length > 50 ? '...' : ''}</span>
          </span>
        </nav>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            {post.tags.map(tag => (
              <span key={tag} style={{ padding: '3px 12px', background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.3)', borderRadius: '20px', fontSize: '0.78rem', color: '#00f0ff', fontFamily: 'Montserrat', fontWeight: 500 }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 style={{ fontFamily: 'Montserrat', fontWeight: 900, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#fff', lineHeight: 1.3, marginBottom: '1.5rem' }}>
          {post.title}
        </h1>

        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(0,240,255,0.15)', fontFamily: 'Montserrat', fontSize: '0.9rem', color: '#b0b0ff' }}>
          <span>✦ Digital Story Studio</span>
          {publishedDate && <span>📅 {publishedDate}</span>}
          <span>📍 Delhi NCR</span>
          {post.view_count > 0 && <span>👁 {post.view_count} views</span>}
        </div>

        {/* Excerpt */}
        {post.excerpt && (
          <p style={{ fontFamily: 'Montserrat', fontSize: '1.1rem', color: '#b0b0ff', lineHeight: 1.9, marginBottom: '2rem', fontStyle: 'italic', padding: '1.25rem 1.5rem', background: 'rgba(0,240,255,0.05)', borderLeft: '4px solid #00f0ff', borderRadius: '0 8px 8px 0' }}>
            {post.excerpt}
          </p>
        )}

        {/* Media Embeds */}
        {post.media_embeds && post.media_embeds.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            {post.media_embeds.map((media, i) => <MediaEmbed key={i} media={media} />)}
          </div>
        )}

        {/* Content */}
        <div className="blog-content" dangerouslySetInnerHTML={{ __html: post.content }} />

        {/* Share */}
        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(0,240,255,0.15)', textAlign: 'center' }}>
          <p style={{ color: '#b0b0ff', fontFamily: 'Montserrat', marginBottom: '1rem', fontWeight: 600 }}>Share this story</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <a href={`https://wa.me/?text=${encodeURIComponent(post.title + ' - https://digitalstorystudio.in/blog/' + post.slug)}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem', background: '#25D366', color: '#fff', borderRadius: '20px', textDecoration: 'none', fontFamily: 'Montserrat', fontWeight: 600, fontSize: '0.9rem' }}>
              <i className="fab fa-whatsapp"></i> WhatsApp
            </a>
            <a href="https://www.instagram.com/digitalstorystudio" target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem', background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', color: '#fff', borderRadius: '20px', textDecoration: 'none', fontFamily: 'Montserrat', fontWeight: 600, fontSize: '0.9rem' }}>
              <i className="fab fa-instagram"></i> Instagram
            </a>
          </div>
        </div>

        {/* Back */}
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <Link href="/blog" style={{ color: '#00f0ff', textDecoration: 'none', fontFamily: 'Montserrat', fontWeight: 600 }}>
            ← Back to All Posts
          </Link>
        </div>
      </article>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '60px 5%', background: 'linear-gradient(135deg,rgba(0,240,255,0.05) 0%,rgba(0,140,255,0.05) 100%)', borderTop: '1px solid rgba(0,240,255,0.1)' }}>
        <h2 style={{ color: '#00f0ff', fontFamily: 'Montserrat', fontWeight: 800, fontSize: '1.8rem', marginBottom: '1rem', textShadow: '0 0 15px rgba(0,240,255,0.7)' }}>
          Want Us to Capture Your Story?
        </h2>
        <p style={{ color: '#b0b0ff', fontFamily: 'Montserrat', marginBottom: '2rem' }}>
          Book Delhi NCR's most trusted videography &amp; photography studio today.
        </p>
        <a href="https://www.digitalstorystudio.in/contactus.html"
          style={{ display: 'inline-block', background: '#00f0ff', color: '#0a0a1a', fontWeight: 700, padding: '1rem 2.5rem', borderRadius: '30px', textDecoration: 'none', fontFamily: 'Montserrat', boxShadow: '0 0 20px rgba(0,240,255,0.4)' }}>
          Book Your Shoot →
        </a>
      </section>
    </SiteLayout>
  );
}
