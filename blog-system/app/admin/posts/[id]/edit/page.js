'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPostByIdAdmin, updatePost, uploadBlogImage } from '../../../../../lib/supabase';
import { generateSEO, generateSlug, DELHI_NCR_GEO } from '../../../../../lib/seoGenerator';
import { parseMediaUrl, getMediaTypeLabel } from '../../../../../lib/mediaUtils';
import dynamic from 'next/dynamic';

const RichEditor = dynamic(() => import('../../../../../components/RichEditor'), {
  ssr: false,
  loading: () => <div style={{ padding: '2rem', textAlign: 'center', color: '#b0b0ff', fontFamily: 'Montserrat' }}>Loading editor...</div>,
});

export default function EditPostPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('content');

  // Form fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('draft');
  const [scheduledAt, setScheduledAt] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaEmbeds, setMediaEmbeds] = useState([]);
  const [mediaError, setMediaError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    loadPost();
  }, [id]);

  async function loadPost() {
    const { data, error } = await getPostByIdAdmin(id);
    if (error || !data) {
      router.push('/admin/posts');
      return;
    }

    setTitle(data.title || '');
    setSlug(data.slug || '');
    setContent(data.content || '');
    setExcerpt(data.excerpt || '');
    setFeaturedImage(data.featured_image || '');
    setTags((data.tags || []).join(', '));
    setStatus(data.status || 'draft');
    setScheduledAt(data.scheduled_at ? data.scheduled_at.slice(0, 16) : '');
    setSeoTitle(data.seo_title || '');
    setSeoDesc(data.seo_description || '');
    setSeoKeywords(data.seo_keywords || '');
    setMediaEmbeds(data.media_embeds || []);
    setLoading(false);
  }

  function handleGenerateSEO() {
    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
    const seo = generateSEO({ title, content, excerpt, tags: tagList });
    setSeoTitle(seo.seo_title);
    setSeoDesc(seo.seo_description);
    setSeoKeywords(seo.seo_keywords);
  }

  function handleAddMedia() {
    setMediaError('');
    const parsed = parseMediaUrl(mediaUrl.trim());
    if (!parsed) {
      setMediaError('Unrecognized URL. Paste a YouTube, Instagram, or direct image link.');
      return;
    }
    setMediaEmbeds(prev => [...prev, parsed]);
    setMediaUrl('');
  }

  function removeMedia(index) {
    setMediaEmbeds(prev => prev.filter((_, i) => i !== index));
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setUploadError('File too large. Max 5MB.'); return; }
    setUploading(true);
    setUploadError('');
    const { url, error } = await uploadBlogImage(file, slug || 'featured');
    if (error) setUploadError('Upload failed: ' + error.message);
    else setFeaturedImage(url);
    setUploading(false);
  }

  async function handleSave(publishNow = false) {
    if (!title.trim()) { setSaveError('Title is required.'); return; }
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
    const finalStatus = publishNow ? 'published' : (scheduledAt ? 'scheduled' : status);

    const updates = {
      title: title.trim(),
      slug: slug.trim(),
      content,
      excerpt: excerpt.trim(),
      featured_image: featuredImage.trim(),
      status: finalStatus,
      scheduled_at: scheduledAt || null,
      published_at: finalStatus === 'published' ? new Date().toISOString() : null,
      seo_title: seoTitle,
      seo_description: seoDesc,
      seo_keywords: seoKeywords,
      tags: tagList,
      media_embeds: mediaEmbeds,
      ...DELHI_NCR_GEO,
    };

    const { error } = await updatePost(id, updates);
    if (error) {
      setSaveError('Save failed: ' + (error.message || 'Unknown error'));
    } else {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  const tabs = [
    { id: 'content', label: '✍️ Content' },
    { id: 'media', label: '📸 Media' },
    { id: 'seo', label: '🔍 SEO' },
    { id: 'settings', label: '⚙️ Settings' },
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Montserrat', fontWeight: 900, color: '#fff', fontSize: '1.8rem' }}>
            ✏️ Edit Post
          </h1>
          <p style={{ color: '#b0b0ff', fontFamily: 'Montserrat', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Status: <span className={`status-${status}`}>{status}</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {status === 'published' && (
            <a href={`https://digitalstorystudio.in/blog/${slug}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: 'rgba(0,255,100,0.1)', border: '1px solid rgba(0,255,100,0.3)', borderRadius: '8px', color: '#00ff64', textDecoration: 'none', fontFamily: 'Montserrat', fontWeight: 600, fontSize: '0.9rem' }}>
              🌐 View Live
            </a>
          )}
          <button onClick={() => handleSave(false)} disabled={saving} style={{ padding: '0.6rem 1.5rem', background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.3)', borderRadius: '8px', color: '#00f0ff', cursor: 'pointer', fontFamily: 'Montserrat', fontWeight: 600, fontSize: '0.9rem' }}>
            {saving ? '💾 Saving...' : '💾 Save Changes'}
          </button>
          <button onClick={() => handleSave(true)} disabled={saving} className="btn-primary" style={{ fontSize: '0.9rem' }}>
            🚀 Publish Now
          </button>
        </div>
      </div>

      {saveError && (
        <div style={{ background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#ff6b6b', fontFamily: 'Montserrat', fontSize: '0.9rem' }}>
          ⚠️ {saveError}
        </div>
      )}

      {saveSuccess && (
        <div style={{ background: 'rgba(0,255,100,0.1)', border: '1px solid rgba(0,255,100,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#00ff64', fontFamily: 'Montserrat', fontSize: '0.9rem' }}>
          ✅ Changes saved successfully!
        </div>
      )}

      {/* Title */}
      <div style={{ marginBottom: '1.25rem' }}>
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Blog post title..." className="form-input" style={{ fontSize: '1.4rem', fontWeight: 700, padding: '1rem 1.25rem' }} />
      </div>

      {/* Slug */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ color: '#b0b0ff', fontFamily: 'Montserrat', fontSize: '0.85rem', flexShrink: 0 }}>/blog/</span>
        <input type="text" value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} className="form-input" style={{ fontSize: '0.9rem' }} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: '1.5rem', borderBottom: '1px solid rgba(0,240,255,0.15)' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '0.75rem 1.25rem', background: 'none', border: 'none', borderBottom: activeTab === tab.id ? '2px solid #00f0ff' : '2px solid transparent', color: activeTab === tab.id ? '#00f0ff' : '#b0b0ff', cursor: 'pointer', fontFamily: 'Montserrat', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s', marginBottom: '-1px' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content tab */}
      {activeTab === 'content' && (
        <div>
          <div className="glass-card" style={{ marginBottom: '1.25rem', overflow: 'hidden' }}>
            <div style={{ borderBottom: '1px solid rgba(0,240,255,0.15)', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.3)' }}>
              <span style={{ color: '#b0b0ff', fontFamily: 'Montserrat', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Blog Content</span>
            </div>
            <RichEditor content={content} onChange={setContent} />
          </div>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <label style={{ display: 'block', color: '#b0b0ff', fontFamily: 'Montserrat', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Excerpt</label>
            <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="Short summary..." className="form-input" rows={3} />
          </div>
        </div>
      )}

      {/* Media tab — same as new post */}
      {activeTab === 'media' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'Montserrat', fontWeight: 700, color: '#00f0ff', fontSize: '1rem', marginBottom: '1rem' }}>Featured Image</h3>
            {featuredImage && (
              <div style={{ marginBottom: '1rem', position: 'relative', display: 'inline-block' }}>
                <img src={featuredImage} alt="" style={{ maxHeight: '200px', borderRadius: '8px', border: '1px solid rgba(0,240,255,0.3)' }} />
                <button onClick={() => setFeaturedImage('')} style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ff4444', border: 'none', color: '#fff', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: '0.8rem' }}>×</button>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.3)', borderRadius: '8px', color: '#00f0ff', cursor: 'pointer', fontFamily: 'Montserrat', fontWeight: 600, fontSize: '0.85rem' }}>
                {uploading ? '⏳ Uploading...' : '📁 Upload Photo'}
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploading} />
              </label>
              {uploadError && <p style={{ color: '#ff6b6b', fontFamily: 'Montserrat', fontSize: '0.85rem' }}>{uploadError}</p>}
              <input type="url" value={featuredImage} onChange={e => setFeaturedImage(e.target.value)} placeholder="Or paste image URL..." className="form-input" />
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'Montserrat', fontWeight: 700, color: '#00f0ff', fontSize: '1rem', marginBottom: '0.5rem' }}>📸 YouTube / Instagram / Image Embeds</h3>
            <p style={{ color: '#b0b0ff', fontFamily: 'Montserrat', fontSize: '0.85rem', marginBottom: '1rem' }}>Paste any YouTube, Instagram, or image URL.</p>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <input type="url" value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddMedia()} placeholder="Paste URL here..." className="form-input" />
              <button onClick={handleAddMedia} style={{ padding: '0 1.5rem', background: '#00f0ff', color: '#0a0a1a', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Montserrat', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>+ Add</button>
            </div>
            {mediaError && <p style={{ color: '#ff6b6b', fontFamily: 'Montserrat', fontSize: '0.85rem', marginBottom: '0.75rem' }}>⚠️ {mediaError}</p>}
            {mediaEmbeds.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(0,240,255,0.05)', border: '1px solid rgba(0,240,255,0.15)', borderRadius: '8px', marginBottom: '0.5rem' }}>
                <div>
                  <div style={{ color: '#00f0ff', fontFamily: 'Montserrat', fontSize: '0.85rem', fontWeight: 600 }}>{getMediaTypeLabel(m.type)}</div>
                  <div style={{ color: 'rgba(176,176,255,0.6)', fontFamily: 'Montserrat', fontSize: '0.75rem' }}>{m.originalUrl?.substring(0, 60)}...</div>
                </div>
                <button onClick={() => removeMedia(i)} style={{ background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.3)', color: '#ff6b6b', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontFamily: 'Montserrat', fontSize: '0.8rem' }}>Remove</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEO tab */}
      {activeTab === 'seo' && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontFamily: 'Montserrat', fontWeight: 700, color: '#00f0ff', fontSize: '1rem' }}>🔍 SEO & Geo Tags</h3>
            <button onClick={handleGenerateSEO} style={{ padding: '0.6rem 1.25rem', background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.3)', borderRadius: '8px', color: '#00f0ff', cursor: 'pointer', fontFamily: 'Montserrat', fontWeight: 700, fontSize: '0.85rem' }}>✨ Re-generate SEO</button>
          </div>
          <div style={{ background: 'rgba(0,240,255,0.05)', border: '1px solid rgba(0,240,255,0.15)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
            <p style={{ color: '#00f0ff', fontFamily: 'Montserrat', fontSize: '0.85rem', fontWeight: 600 }}>📍 Geo Tags auto-applied: Delhi NCR, India (28.6139, 77.2090)</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', color: '#b0b0ff', fontFamily: 'Montserrat', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>SEO Title</label>
              <input type="text" value={seoTitle} onChange={e => setSeoTitle(e.target.value)} className="form-input" maxLength={70} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#b0b0ff', fontFamily: 'Montserrat', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Meta Description</label>
              <textarea value={seoDesc} onChange={e => setSeoDesc(e.target.value)} className="form-input" rows={3} maxLength={170} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#b0b0ff', fontFamily: 'Montserrat', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>SEO Keywords</label>
              <textarea value={seoKeywords} onChange={e => setSeoKeywords(e.target.value)} className="form-input" rows={4} />
            </div>
          </div>
        </div>
      )}

      {/* Settings tab */}
      {activeTab === 'settings' && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontFamily: 'Montserrat', fontWeight: 700, color: '#00f0ff', fontSize: '1rem', marginBottom: '1.5rem' }}>⚙️ Publish Settings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', color: '#b0b0ff', fontFamily: 'Montserrat', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Tags (comma separated)</label>
              <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="wedding, videography, delhi" className="form-input" />
            </div>
            <div>
              <label style={{ display: 'block', color: '#b0b0ff', fontFamily: 'Montserrat', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>Post Status</label>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {[
                  { value: 'draft', label: '📋 Draft', color: '#ffc800' },
                  { value: 'published', label: '🟢 Published', color: '#00ff64' },
                  { value: 'scheduled', label: '⏰ Scheduled', color: '#008cff' },
                ].map(opt => (
                  <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.6rem 1rem', borderRadius: '8px', border: status === opt.value ? `1px solid ${opt.color}` : '1px solid rgba(255,255,255,0.1)', background: status === opt.value ? `${opt.color}15` : 'transparent', color: status === opt.value ? opt.color : '#b0b0ff', fontFamily: 'Montserrat', fontSize: '0.9rem', fontWeight: 600 }}>
                    <input type="radio" name="status" value={opt.value} checked={status === opt.value} onChange={e => setStatus(e.target.value)} style={{ display: 'none' }} />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
            {status === 'scheduled' && (
              <div>
                <label style={{ display: 'block', color: '#b0b0ff', fontFamily: 'Montserrat', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>📅 Schedule Date & Time</label>
                <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} className="form-input" min={new Date().toISOString().slice(0, 16)} style={{ colorScheme: 'dark' }} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom save bar */}
      <div style={{ position: 'sticky', bottom: '1rem', marginTop: '2rem', padding: '1rem 1.5rem', background: 'rgba(5,5,20,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: '12px', display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button onClick={() => router.push('/admin/posts')} style={{ padding: '0.6rem 1.25rem', background: 'transparent', border: '1px solid rgba(176,176,255,0.2)', borderRadius: '8px', color: '#b0b0ff', cursor: 'pointer', fontFamily: 'Montserrat', fontWeight: 600, fontSize: '0.9rem' }}>← Back to Posts</button>
        <button onClick={() => handleSave(false)} disabled={saving} style={{ padding: '0.6rem 1.5rem', background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.3)', borderRadius: '8px', color: '#00f0ff', cursor: 'pointer', fontFamily: 'Montserrat', fontWeight: 700, fontSize: '0.9rem' }}>💾 Save Changes</button>
        <button onClick={() => handleSave(true)} disabled={saving} className="btn-primary" style={{ fontSize: '0.9rem' }}>🚀 Publish Now</button>
      </div>
    </div>
  );
}
