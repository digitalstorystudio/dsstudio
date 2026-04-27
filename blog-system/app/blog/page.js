'use client';
import { useState, useEffect } from 'react';
import { getPublishedPosts } from '../../lib/supabase';
import BlogCard from '../../components/BlogCard';
import SiteLayout from '../../components/SiteLayout';
import Link from 'next/link';

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 9;

  useEffect(() => {
    async function load() {
      setLoading(true);
      const offset = (page - 1) * limit;
      const { data, count } = await getPublishedPosts(limit, offset);
      setPosts(data || []);
      setTotalPages(count ? Math.ceil(count / limit) : 1);
      setLoading(false);
    }
    load();
  }, [page]);

  return (
    <SiteLayout>
      {/* Hero */}
      <section style={{
        paddingTop: '80px', paddingBottom: '60px', textAlign: 'center',
        background: 'linear-gradient(180deg, rgba(0,240,255,0.05) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(0,240,255,0.1)',
        minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 5%' }}>
          <p style={{ color: '#00f0ff', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '1rem', fontFamily: 'Montserrat', fontSize: '0.85rem' }}>
            ✦ Stories &amp; Inspiration ✦
          </p>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, color: '#fff', marginBottom: '1rem', lineHeight: 1.2, fontFamily: 'Montserrat' }}>
            Our Blog
          </h1>
          <p style={{ color: '#b0b0ff', fontSize: '1.1rem', lineHeight: 1.8, fontFamily: 'Montserrat' }}>
            Wedding photography tips, behind-the-scenes stories, and videography inspiration from Delhi NCR's premier studio.
          </p>
        </div>
      </section>

      {/* Posts Grid */}
      <section style={{ padding: '60px 5%', maxWidth: '1200px', margin: '0 auto' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: '#b0b0ff', fontFamily: 'Montserrat' }}>
            Loading posts...
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📸</div>
            <h2 style={{ color: '#00f0ff', fontFamily: 'Montserrat', marginBottom: '0.5rem' }}>Coming Soon</h2>
            <p style={{ color: '#b0b0ff', fontFamily: 'Montserrat' }}>Our first blog posts are being crafted. Check back soon!</p>
          </div>
        )}

        {!loading && posts.length > 0 && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
              {posts.map((post, i) => (
                <BlogCard key={post.id} post={post} index={i} />
              ))}
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '3rem' }}>
                {page > 1 && (
                  <button onClick={() => setPage(p => p - 1)} className="btn-outline">← Previous</button>
                )}
                <span style={{ color: '#b0b0ff', padding: '0.6rem 1rem', fontFamily: 'Montserrat' }}>
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <button onClick={() => setPage(p => p + 1)} className="btn-outline">Next →</button>
                )}
              </div>
            )}
          </>
        )}
      </section>

      {/* CTA */}
      <section style={{
        textAlign: 'center', padding: '60px 5%',
        background: 'linear-gradient(135deg, rgba(0,240,255,0.05) 0%, rgba(0,140,255,0.05) 100%)',
        borderTop: '1px solid rgba(0,240,255,0.1)',
      }}>
        <h2 style={{ color: '#00f0ff', fontFamily: 'Montserrat', fontWeight: 800, fontSize: '2rem', marginBottom: '1rem', textShadow: '0 0 15px rgba(0,240,255,0.7)' }}>
          Ready to Create Your Story?
        </h2>
        <p style={{ color: '#b0b0ff', fontFamily: 'Montserrat', marginBottom: '2rem', fontSize: '1.1rem' }}>
          Book Delhi NCR's most trusted videography &amp; photography studio today.
        </p>
        <a href="https://www.digitalstorystudio.in/contactus.html"
          style={{ display: 'inline-block', background: '#00f0ff', color: '#0a0a1a', fontWeight: 700, padding: '1rem 2.5rem', borderRadius: '30px', textDecoration: 'none', fontFamily: 'Montserrat', fontSize: '1rem', boxShadow: '0 0 20px rgba(0,240,255,0.4)' }}>
          Book Your Shoot →
        </a>
      </section>
    </SiteLayout>
  );
}
