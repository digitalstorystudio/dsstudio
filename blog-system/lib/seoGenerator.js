// ================================================================
// AUTO SEO GENERATOR
// Generates Delhi NCR-targeted SEO keywords for every blog post
// ================================================================

// Core Delhi NCR photography/videography keywords
const DELHI_NCR_BASE_KEYWORDS = [
  'videographer in Delhi',
  'photographer in Delhi',
  'videography services Delhi NCR',
  'photography services Delhi',
  'Digital Story Studio',
  'wedding videographer Delhi',
  'event photographer Delhi NCR',
  'professional videographer Delhi',
  'cinematic videographer Delhi',
  'best photographer Delhi NCR',
];

// Location-based keyword boosters
const DELHI_LOCATIONS = [
  'South Delhi', 'North Delhi', 'East Delhi', 'West Delhi',
  'Noida', 'Gurgaon', 'Faridabad', 'Ghaziabad',
  'Laxmi Nagar', 'Rohini', 'Dwarka', 'Saket',
  'Connaught Place', 'Karol Bagh', 'Janakpuri',
  'Vasant Kunj', 'Greater Kailash', 'Defence Colony',
];

// Service-type keywords
const SERVICE_KEYWORDS = {
  wedding: [
    'wedding videography Delhi', 'wedding photography Delhi NCR',
    'cinematic wedding film Delhi', 'wedding shoot Delhi',
    'pre-wedding shoot Delhi', 'wedding cinematographer Delhi',
    'best wedding photographer Delhi', 'Punjabi wedding videographer Delhi',
    'Hindu wedding videographer Delhi', 'luxury wedding shoot Delhi',
  ],
  event: [
    'event videography Delhi', 'event photography Delhi',
    'corporate event videographer Delhi', 'birthday photography Delhi NCR',
    'event coverage Delhi', 'party photographer Delhi',
  ],
  drone: [
    'drone videography Delhi', 'aerial photography Delhi',
    'drone photographer Delhi NCR', 'aerial videographer Delhi',
  ],
  portrait: [
    'portrait photographer Delhi', 'professional photoshoot Delhi',
    'personal branding photographer Delhi', 'model photography Delhi NCR',
  ],
  product: [
    'product photography Delhi', 'commercial photographer Delhi',
    'brand photography Delhi NCR', 'e-commerce photography Delhi',
  ],
  maternity: [
    'maternity photographer Delhi', 'newborn photography Delhi',
    'baby photoshoot Delhi NCR', 'maternity shoot Delhi',
  ],
};

/**
 * Detects relevant service types from blog content
 */
function detectServiceTypes(title, content, tags = []) {
  const combined = `${title} ${content} ${tags.join(' ')}`.toLowerCase();
  const detected = [];

  const serviceMap = {
    wedding: ['wedding', 'bride', 'groom', 'shadi', 'vivah', 'pre-wedding', 'engagement'],
    event: ['event', 'corporate', 'birthday', 'party', 'function', 'anniversary'],
    drone: ['drone', 'aerial', 'sky', 'dji'],
    portrait: ['portrait', 'model', 'headshot', 'personal', 'individual'],
    product: ['product', 'brand', 'commercial', 'ecommerce', 'e-commerce'],
    maternity: ['maternity', 'newborn', 'baby', 'pregnancy', 'infant'],
  };

  for (const [service, triggers] of Object.entries(serviceMap)) {
    if (triggers.some(t => combined.includes(t))) {
      detected.push(service);
    }
  }

  return detected.length > 0 ? detected : ['wedding', 'event'];
}

/**
 * Extracts meaningful words from content for additional keywords
 */
function extractContentKeywords(title, content) {
  const strip = content.replace(/<[^>]*>/g, ' ');
  const words = `${title} ${strip}`.toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 4)
    .filter(w => !['about', 'their', 'which', 'where', 'there', 'these', 'those', 'would', 'could', 'should'].includes(w));

  const wordFreq = {};
  words.forEach(w => { wordFreq[w] = (wordFreq[w] || 0) + 1; });

  return Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

/**
 * Main SEO generator - call this when creating/editing a post
 * Returns: { seo_title, seo_description, seo_keywords }
 */
export function generateSEO({ title, content, excerpt, tags = [] }) {
  const serviceTypes = detectServiceTypes(title, content, tags);
  const contentWords = extractContentKeywords(title, content);

  // Build keyword list
  const keywordSet = new Set();

  // 1. Add base Delhi NCR keywords
  DELHI_NCR_BASE_KEYWORDS.slice(0, 5).forEach(k => keywordSet.add(k));

  // 2. Add service-specific keywords
  serviceTypes.forEach(service => {
    const serviceKws = SERVICE_KEYWORDS[service] || [];
    serviceKws.slice(0, 4).forEach(k => keywordSet.add(k));
  });

  // 3. Add location combos for detected services
  const topLocations = DELHI_LOCATIONS.slice(0, 5);
  serviceTypes.slice(0, 2).forEach(service => {
    topLocations.forEach(loc => {
      keywordSet.add(`${service} photographer ${loc}`);
      keywordSet.add(`${service} videographer ${loc}`);
    });
  });

  // 4. Add content-derived keywords
  contentWords
    .filter(w => w.length > 5)
    .slice(0, 5)
    .forEach(w => keywordSet.add(`${w} Delhi NCR`));

  const keywords = Array.from(keywordSet).slice(0, 30).join(', ');

  // Generate SEO title (max 60 chars)
  let seoTitle = title;
  if (seoTitle.length > 55) {
    seoTitle = seoTitle.substring(0, 52) + '...';
  }
  if (!seoTitle.toLowerCase().includes('delhi')) {
    seoTitle = `${seoTitle} | Delhi NCR`;
  }

  // Generate SEO description (max 160 chars)
  const plainText = (excerpt || content.replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
  let seoDesc = plainText.substring(0, 145);
  if (plainText.length > 145) seoDesc += '...';
  if (!seoDesc.toLowerCase().includes('delhi')) {
    seoDesc = seoDesc.substring(0, 120) + ' | Delhi NCR Services';
  }

  return {
    seo_title: seoTitle,
    seo_description: seoDesc,
    seo_keywords: keywords,
  };
}

/**
 * Geo-tag meta tags for every blog post
 * Always targets Delhi NCR area
 */
export const DELHI_NCR_GEO = {
  geo_region: 'IN-DL',
  geo_placename: 'Delhi NCR, India',
  geo_lat: '28.6139',
  geo_lng: '77.2090',
};

/**
 * Returns full geo meta tag HTML string for a blog post
 */
export function getGeoMetaTags(post) {
  return {
    'geo.region': post.geo_region || DELHI_NCR_GEO.geo_region,
    'geo.placename': post.geo_placename || DELHI_NCR_GEO.geo_placename,
    'geo.position': `${post.geo_lat || DELHI_NCR_GEO.geo_lat};${post.geo_lng || DELHI_NCR_GEO.geo_lng}`,
    'ICBM': `${post.geo_lat || DELHI_NCR_GEO.geo_lat}, ${post.geo_lng || DELHI_NCR_GEO.geo_lng}`,
  };
}

/**
 * Generates a URL-friendly slug from a title
 */
export function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);
}
