'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPost, uploadBlogImage } from '../../../../lib/supabase';
import { generateSEO, generateSlug, DELHI_NCR_GEO } from '../../../../lib/seoGenerator';
import { parseMediaUrl, getMediaTypeLabel } from '../../../../lib/mediaUtils';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with TipTap
const RichEditor = dynamic(() => import('../../../../components/RichEditor'), { ssr: false, loading: () => <div style={{ padding: '2rem', textAlign: 'center', color: '#b0b0ff', fontFamily: 'Montserrat' }}>Loading editor...</div> });

export default function NewPostPage() {
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('draft');
  const [scheduledAt, setScheduledAt] = useState('');

  // SEO state
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [seoGenerated, setSeoGenerated] = useState(false);

  // Media embed state
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaEmbeds, setMediaEmbeds] = useState([]);
  const [mediaError, setMediaError] = useState('');

  // Image upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Save state
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Active tab
  const [activeTab, setActiveTab] = useState('content'); // content | seo | media | settings

  // Auto-generate slug from title
  function handleTitleChange(val) {
    setTitle(val);
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(val));
    }
  }

  // Auto-generate SEO
  function handleGenerateSEO() {
    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
    const seo = generateSEO({ title, content, excerpt, tags: tagList });
    setSeoTitle(seo.seo_title);
    setSeoDesc(seo.seo_description);
    setSeoKeywords(seo.seo_keywords);
    setSeoGenerated(true);
  }

  // Add media embed from URL
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

  // Upload image file
  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File too large. Max 5MB allowed.');
      return;
    }

    setUploading(true);
    setUploadError('');
    const { url, error } = await uploadBlogImage(file, slug || 'featured');
    if (error) {
      setUploadError('Upload failed: ' + error.message);
    } else {
      setFeaturedImage(url);
    }
    setUploading(false);
  }

  // Save post
  async function handleSave(publishNow = false) {
    if (!title.trim()) { setSaveError('Title is required.'); return; }
    if (!slug.trim()) { setSaveError('Slug is required.'); return; }
    if (!content || content === '<p></p>') { setSaveError('Content cannot be empty.'); return; }

    setSaving(true);
    setSaveError('');

    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);

    // Auto-generate SEO if not done
    let finalSeoTitle = seoTitle;
    let finalSeoDesc = seoDesc;
    let finalSeoKeywords = seoKeywords;

    if (!seoGenerated) {
      const seo = generateSEO({ title, content, excerpt, tags: tagList });
      finalSeoTitle = seo.seo_title;
      finalSeoDesc = seo.seo_description;
      finalSeoKeywords = seo.seo_keywords;
    }

    const finalStatus = publishNow ? 'published' : (scheduledAt ? 'scheduled' : status);

    const postData = {
      title: title.trim(),
      slug: slug.trim(),
      content,
      excerpt: excerpt.trim(),
      featured_image: featuredImage.trim(),
      status: finalStatus,
      scheduled_at: scheduledAt || null,
      published_at: finalStatus === 'published' ? new Date().toISOString() : null,
      seo_title: finalSeoTitle,
      seo_description: finalSeoDesc,
      seo_keywords: finalSeoKeywords,
      tags: tagList,
      media_embeds: mediaEmbeds,
      ...DELHI_NCR_GEO,
    };

    const { data, error } = await createPost(postData);

    if (error) {
      setSaveError('Save failed: ' + (error.message || 'Unknown error'));
      setSaving(false);
      return;
    }

    router.push('/admin/posts');
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
        <h1 style={{ fontFamily: 'Montserrat', fontWeight: 900, color: '#fff', fontSize: '1.8rem' }}>
          ✍️ New Blog Post
        </h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            style={{ padding: '0.6rem 1.5rem', background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.3)', borderRadius: '8px', color: '#00f0ff', cursor: 'pointer', fontFamily: 'Montserrat', fontWeight: 600, fontSize: '0.9rem' }}
          >
            {saving ? '💾 Saving...' : '💾 Save Draft'}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="btn-primary"
            style={{ fontSize: '0.9rem' }}
          >
            {saving ? '⏳ Publishing...' : '🚀 Publish Now'}
          </button>
        </div>
      </div>

      {saveError && (
        <div style={{ background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#ff6b6b', fontFamily: 'Montserrat', fontSize: '0.9rem' }}>
          ⚠️ {saveError}
        </div>
      )}

      {/* Title */}
      <div style={{ marginBottom: '1.25rem' }}>
        <input
          type="text"
          value={title}
          onChange={e => handleTitleChange(e.target.value)}
          placeholder="Blog post title..."
          className="form-input"
          style={{ fontSize: '1.4rem', fontWeight: 700, padding: '1rem 1.25rem' }}
        />
      </div>

      {/* Slug */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ color: '#b0b0ff', fontFamily: 'Montserrat', fontSize: '0.85rem', flexShrink: 0 }}>
          /blog/
        </span>
        <input
          type="text"
          value={slug}
          onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
          placeholder="post-url-slug"
          className="form-input"
          style={{ fontSize: '0.9rem' }}
        />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '1.5rem', borderBottom: '1px solid rgba(0,240,255,0.15)' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 1.25rem',
              background: 'none', border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #00f0ff' : '2px solid transparent',
              color: activeTab === tab.id ? '#00f0ff' : '#b0b0ff',
              cursor: 'pointer', fontFamily: 'Montserrat', fontWeight: 600,
              fontSize: '0.9rem', transition: 'all 0.2s', marginBottom: '-1px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB: CONTENT ── */}
      {activeTab === 'content' && (
        <div>
          <div className="glass-card" style={{ marginBottom: '1.25rem', overflow: 'hidden' }}>
            <div style={{ borderBottom: '1px solid rgba(0,240,255,0.15)', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.3)' }}>
              <span style={{ color: '#b0b0ff', fontFamily: 'Montserrat', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Blog Content
              </span>
            </div>
            <RichEditor content={content} onChange={setContent} />
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <label style={{ display: 'block', color: '#b0b0ff', fontFamily: 'Montserrat', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Excerpt (short summary shown on blog listing)
            </label>
            <textarea
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              placeholder="Write a compelling 1-2 sentence summary of your post..."
              className="form-input"
              rows={3}
            />
          </div>
        </div>
      )}

      {/* ── TAB: MEDIA ── */}
      {activeTab === 'media' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Featured Image */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'Montserrat', fontWeight: 700, color: '#00f0ff', fontSize: '1rem', marginBottom: '1rem' }}>
              Featured Image
            </h3>

            {featuredImage && (
              <div style={{ marginBottom: '1rem', position: 'relative', display: 'inline-block' }}>
                <img src={featuredImage} alt="Featured" style={{ maxHeight: '200px', borderRadius: '8px', border: '1px solid rgba(0,240,255,0.3)' }} />
                <button
                  onClick={() => setFeaturedImage('')}
                  style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ff4444', border: 'none', color: '#fff', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ×
                </button>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Upload file */}
              <div>
                <label style={{ display: 'block', color: '#b0b0ff', fontFamily: 'Montserrat', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  📤 Upload Photo (JPG, PNG, WebP — max 5MB)
                </label>
                <label style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.6rem 1.25rem', background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.3)',
                  borderRadius: '8px', color: '#00f0ff', cursor: 'pointer', fontFamily: 'Montserrat', fontWeight: 600, fontSize: '0.85rem',
                }}>
                  {uploading ? '⏳ Uploading...' : '📁 Choose File'}
                  <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploading} />
                </label>
                {uploadError && <p style={{ color: '#ff6b6b', fontFamily: 'Montserrat', fontSize: '0.85rem', marginTop: '0.5rem' }}>{uploadError}</p>}
              </div>

              {/* Or paste URL */}
              <div>
                <label style={{ display: 'block', color: '#b0b0ff', fontFamily: 'Montserrat', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  🔗 Or Paste Image URL
                </label>
                <input
                  type="url"
                  value={featuredImage}
                  onChange={e => setFeaturedImage(e.target.value)}
                  placeholder="https://..."
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Media Embeds */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'Montserrat', fontWeight: 700, color: '#00f0ff', fontSize: '1rem', marginBottom: '0.5rem' }}>
              📸 Add YouTube / Instagram / Image Embeds
            </h3>
            <p style={{ color: '#b0b0ff', fontFamily: 'Montserrat', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Paste any YouTube video link, Instagram post link, or direct image URL. It will be auto-embedded.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <input
                type="url"
                value={mediaUrl}
                onChange={e => setMediaUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddMedia()}
                placeholder="Paste YouTube, Instagram, or image URL here..."
                className="form-input"
              />
              <button
                onClick={handleAddMedia}
                style={{ padding: '0 1.5rem', background: '#00f0ff', color: '#0a0a1a', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Montserrat', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                + Add
              </button>
            </div>

            {mediaError && (
              <p style={{ color: '#ff6b6b', fontFamily: 'Montserrat', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                ⚠️ {mediaError}
              </p>
            )}

            {mediaEmbeds.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {mediaEmbeds.map((m, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.75rem 1rem', background: 'rgba(0,240,255,0.05)', border: '1px solid rgba(0,240,255,0.15)', borderRadius: '8px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, overflow: 'hidden' }}>
                      {m.type === 'youtube' && m.thumbnailUrl && (
                        <img src={m.thumbnailUrl} alt="" style={{ width: 70, height: 50, objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }} />
                      )}
                      <div>
                        <div style={{ color: '#00f0ff', fontFamily: 'Montserrat', fontSize: '0.85rem', fontWeight: 600 }}>
                          {getMediaTypeLabel(m.type)}
                        </div>
                        <div style={{ color: 'rgba(176,176,255,0.6)', fontFamily: 'Montserrat', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '350px' }}>
                          {m.originalUrl}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeMedia(i)}
                      style={{ background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.3)', color: '#ff6b6b', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontFamily: 'Montserrat', fontSize: '0.8rem', flexShrink: 0 }}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: SEO ── */}
      {activeTab === 'seo' && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontFamily: 'Montserrat', fontWeight: 700, color: '#00f0ff', fontSize: '1rem' }}>
                🔍 SEO & Geo Tags
              </h3>
              <p style={{ color: '#b0b0ff', fontFamily: 'Montserrat', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Auto-generated Delhi NCR keywords. You can edit them manually.
              </p>
            </div>
            <button
              onClick={handleGenerateSEO}
              style={{ padding: '0.6rem 1.25rem', background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.3)', borderRadius: '8px', color: '#00f0ff', cursor: 'pointer', fontFamily: 'Montserrat', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
              ✨ Auto-Generate SEO
            </button>
          </div>

          {/* Geo tags info */}
          <div style={{ background: 'rgba(0,240,255,0.05)', border: '1px solid rgba(0,240,255,0.15)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
            <p style={{ color: '#00f0ff', fontFamily: 'Montserrat', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              📍 Geo Tags — Auto-applied to every post
            </p>
            <p style={{ color: '#b0b0ff', fontFamily: 'Montserrat', fontSize: '0.82rem' }}>
              Region: IN-DL (Delhi) · Location: Delhi NCR, India · Coordinates: 28.6139, 77.2090
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', color: '#b0b0ff', fontFamily: 'Montserrat', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                SEO Title <span style={{ color: 'rgba(176,176,255,0.4)' }}>(max 60 chars)</span>
              </label>
              <input type="text" value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder="SEO Title for Google..." className="form-input" maxLength={70} />
              <p style={{ color: seoTitle.length > 60 ? '#ff6b6b' : 'rgba(176,176,255,0.4)', fontFamily: 'Montserrat', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                {seoTitle.length}/60 characters
              </p>
            </div>

            <div>
              <label style={{ display: 'block', color: '#b0b0ff', fontFamily: 'Montserrat', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Meta Description <span style={{ color: 'rgba(176,176,255,0.4)' }}>(max 160 chars)</span>
              </label>
              <textarea value={seoDesc} onChange={e => setSeoDesc(e.target.value)} placeholder="What this post is about — shown in Google search results..." className="form-input" rows={3} maxLength={170} />
              <p style={{ color: seoDesc.length > 160 ? '#ff6b6b' : 'rgba(176,176,255,0.4)', fontFamily: 'Montserrat', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                {seoDesc.length}/160 characters
              </p>
            </div>

            <div>
              <label style={{ display: 'block', color: '#b0b0ff', fontFamily: 'Montserrat', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                SEO Keywords <span style={{ color: 'rgba(176,176,255,0.4)' }}>(comma separated)</span>
              </label>
              <textarea value={seoKeywords} onChange={e => setSeoKeywords(e.target.value)} placeholder="wedding videographer delhi, photographer delhi ncr, ..." className="form-input" rows={4} />
            </div>
          </div>

          {/* Google Preview */}
          {(seoTitle || title) && (
            <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ color: 'rgba(176,176,255,0.5)', fontFamily: 'Montserrat', fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Google Preview
              </p>
              <p style={{ color: '#8ab4f8', fontFamily: 'Arial, sans-serif', fontSize: '1.1rem', marginBottom: '0.2rem' }}>
                {seoTitle || title}
              </p>
              <p style={{ color: '#4caf50', fontFamily: 'Arial, sans-serif', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                digitalstorystudio.in/blog/{slug}
              </p>
              <p style={{ color: '#bdc1c6', fontFamily: 'Arial, sans-serif', fontSize: '0.85rem' }}>
                {seoDesc || excerpt || 'Meta description will appear here...'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: SETTINGS ── */}
      {activeTab === 'settings' && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontFamily: 'Montserrat', fontWeight: 700, color: '#00f0ff', fontSize: '1rem', marginBottom: '1.5rem' }}>
            ⚙️ Publish Settings
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Tags */}
            <div>
              <label style={{ display: 'block', color: '#b0b0ff', fontFamily: 'Montserrat', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Tags <span style={{ color: 'rgba(176,176,255,0.4)' }}>(comma separated)</span>
              </label>
              <input
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="wedding, videography, delhi, tips"
                className="form-input"
              />
            </div>

            {/* Status */}
            <div>
              <label style={{ display: 'block', color: '#b0b0ff', fontFamily: 'Montserrat', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                Post Status
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {[
                  { value: 'draft', label: '📋 Save as Draft', color: '#ffc800' },
                  { value: 'published', label: '🟢 Publish Now', color: '#00ff64' },
                  { value: 'scheduled', label: '⏰ Schedule', color: '#008cff' },
                ].map(opt => (
                  <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.6rem 1rem', borderRadius: '8px', border: status === opt.value ? `1px solid ${opt.color}` : '1px solid rgba(255,255,255,0.1)', background: status === opt.value ? `${opt.color}15` : 'transparent', color: status === opt.value ? opt.color : '#b0b0ff', fontFamily: 'Montserrat', fontSize: '0.9rem', fontWeight: 600 }}>
                    <input type="radio" name="status" value={opt.value} checked={status === opt.value} onChange={e => setStatus(e.target.value)} style={{ display: 'none' }} />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Schedule datetime */}
            {(status === 'scheduled') && (
              <div>
                <label style={{ display: 'block', color: '#b0b0ff', fontFamily: 'Montserrat', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  📅 Schedule Publish Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={e => setScheduledAt(e.target.value)}
                  className="form-input"
                  min={new Date().toISOString().slice(0, 16)}
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Save Bar */}
      <div style={{
        position: 'sticky', bottom: '1rem', marginTop: '2rem',
        padding: '1rem 1.5rem',
        background: 'rgba(5,5,20,0.95)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0,240,255,0.2)', borderRadius: '12px',
        display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap',
      }}>
        {saveError && <span style={{ color: '#ff6b6b', fontFamily: 'Montserrat', fontSize: '0.85rem', alignSelf: 'center' }}>⚠️ {saveError}</span>}
        <button onClick={() => router.push('/admin/posts')} style={{ padding: '0.6rem 1.25rem', background: 'transparent', border: '1px solid rgba(176,176,255,0.2)', borderRadius: '8px', color: '#b0b0ff', cursor: 'pointer', fontFamily: 'Montserrat', fontWeight: 600, fontSize: '0.9rem' }}>
          Cancel
        </button>
        <button onClick={() => handleSave(false)} disabled={saving} style={{ padding: '0.6rem 1.5rem', background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.3)', borderRadius: '8px', color: '#00f0ff', cursor: 'pointer', fontFamily: 'Montserrat', fontWeight: 700, fontSize: '0.9rem' }}>
          💾 Save Draft
        </button>
        <button onClick={() => handleSave(true)} disabled={saving} className="btn-primary" style={{ fontSize: '0.9rem' }}>
          🚀 Publish Now
        </button>
      </div>
    </div>
  );
}
