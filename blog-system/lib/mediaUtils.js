// ================================================================
// MEDIA UTILITIES
// Handles YouTube, Instagram, and direct image embeds
// ================================================================

/**
 * Detects media type from URL and returns embed data
 */
export function parseMediaUrl(url) {
  if (!url || typeof url !== 'string') return null;
  url = url.trim();

  // ── YouTube ─────────────────────────────────────────────────────
  const ytPatterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of ytPatterns) {
    const match = url.match(pattern);
    if (match) {
      const videoId = match[1];
      return {
        type: 'youtube',
        id: videoId,
        embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        originalUrl: url,
      };
    }
  }

  // ── Instagram ────────────────────────────────────────────────────
  const igPatterns = [
    /instagram\.com\/p\/([a-zA-Z0-9_-]+)/,
    /instagram\.com\/reel\/([a-zA-Z0-9_-]+)/,
    /instagram\.com\/tv\/([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of igPatterns) {
    const match = url.match(pattern);
    if (match) {
      const postId = match[1];
      // Clean the URL to just the post URL
      const cleanUrl = url.split('?')[0];
      const embedUrl = cleanUrl.endsWith('/') ? `${cleanUrl}embed/` : `${cleanUrl}/embed/`;
      return {
        type: 'instagram',
        id: postId,
        embedUrl,
        originalUrl: cleanUrl,
      };
    }
  }

  // ── Direct image URL ─────────────────────────────────────────────
  if (/\.(jpg|jpeg|png|webp|gif|avif)(\?.*)?$/i.test(url)) {
    return {
      type: 'image',
      url,
      originalUrl: url,
    };
  }

  return null;
}

/**
 * Returns the embed HTML for a media item
 * Used in blog post rendering
 */
export function getEmbedHtml(media) {
  if (!media) return '';

  switch (media.type) {
    case 'youtube':
      return `
        <div class="media-embed youtube-embed">
          <iframe
            src="${media.embedUrl}"
            title="YouTube video"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            loading="lazy"
          ></iframe>
        </div>
      `;

    case 'instagram':
      return `
        <div class="media-embed instagram-embed">
          <blockquote
            class="instagram-media"
            data-instgrm-permalink="${media.originalUrl}"
            data-instgrm-version="14"
          >
            <a href="${media.originalUrl}" target="_blank" rel="noopener noreferrer">
              View on Instagram
            </a>
          </blockquote>
          <script async src="//www.instagram.com/embed.js"></script>
        </div>
      `;

    case 'image':
      return `
        <div class="media-embed image-embed">
          <img src="${media.url}" alt="Blog image" loading="lazy" />
        </div>
      `;

    default:
      return '';
  }
}

/**
 * Checks if a string is a valid media URL
 */
export function isMediaUrl(str) {
  return parseMediaUrl(str) !== null;
}

/**
 * Returns a user-friendly label for a media type
 */
export function getMediaTypeLabel(type) {
  const labels = {
    youtube: '▶ YouTube Video',
    instagram: '📸 Instagram Post',
    image: '🖼️ Image',
  };
  return labels[type] || 'Media';
}
