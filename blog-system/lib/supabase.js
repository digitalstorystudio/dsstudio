import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Demo mode — works without Supabase keys so you can preview locally
export const DEMO_MODE = !supabaseUrl || !supabaseAnonKey;

export const supabase = DEMO_MODE
  ? null
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    });

// ── Demo data ────────────────────────────────────────────────────
const DEMO_POSTS = [
  {
    id: 1,
    title: 'Best Wedding Videographer in Delhi NCR — Why Cinematic Films Matter',
    slug: 'best-wedding-videographer-delhi-ncr',
    excerpt: "Your wedding film is the only thing that will take you back to that exact moment — the tears, the laughter, the vows. Here's why a cinematic wedding film from Delhi NCR's top studio is worth every rupee.",
    content: '<p>Demo post — connect Supabase to save real content.</p>',
    featured_image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&q=80',
    status: 'published',
    published_at: '2026-04-20T10:00:00Z',
    tags: ['wedding', 'videography', 'delhi'],
    seo_keywords: ['wedding videographer delhi', 'cinematic wedding film', 'delhi ncr wedding'],
    view_count: 142,
    created_at: '2026-04-18T10:00:00Z',
  },
  {
    id: 2,
    title: 'Top 5 Pre-Wedding Shoot Locations in Delhi NCR for 2026',
    slug: 'top-pre-wedding-shoot-locations-delhi',
    excerpt: 'Looking for the perfect backdrop for your pre-wedding shoot? We have photographed couples at hundreds of Delhi NCR locations. Here are our top 5 picks.',
    content: '<p>Demo post — connect Supabase to save real content.</p>',
    featured_image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
    status: 'published',
    published_at: '2026-04-15T10:00:00Z',
    tags: ['pre-wedding', 'photography', 'locations'],
    seo_keywords: ['pre wedding shoot delhi', 'best locations delhi ncr', 'pre wedding photography'],
    view_count: 89,
    created_at: '2026-04-13T10:00:00Z',
  },
  {
    id: 3,
    title: 'Drone Videography for Weddings — Everything You Need to Know',
    slug: 'drone-videography-weddings-delhi',
    excerpt: 'Aerial drone shots have transformed how we capture weddings in Delhi NCR. Find out what permissions you need and why drone footage is worth it.',
    content: '<p>Demo post — connect Supabase to save real content.</p>',
    featured_image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&q=80',
    status: 'draft',
    published_at: null,
    tags: ['drone', 'wedding', 'aerial'],
    seo_keywords: ['drone videography wedding', 'aerial wedding video delhi', 'drone photography ncr'],
    view_count: 0,
    created_at: '2026-04-10T10:00:00Z',
  },
];

// ── Auth helpers ─────────────────────────────────────────────────

export async function signIn(email, password) {
  if (DEMO_MODE) {
    // Demo login: any email + password "demo123" works
    if (password === 'demo123') {
      return { data: { user: { email }, session: { access_token: 'demo' } }, error: null };
    }
    return { data: null, error: { message: 'Demo mode: use password "demo123" to log in' } };
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function signOut() {
  if (DEMO_MODE) return { error: null };
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getSession() {
  if (DEMO_MODE) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Send password reset email
export async function resetPasswordForEmail(email) {
  if (DEMO_MODE) {
    return { error: { message: 'Demo mode: password reset not available' } };
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/reset-password`,
  });
  return { error };
}

// Set new password (called from reset-password page after token exchange)
export async function updatePassword(newPassword) {
  if (DEMO_MODE) return { error: { message: 'Demo mode: not available' } };
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return { error };
}

// ── Posts helpers ─────────────────────────────────────────────────

export async function getPublishedPosts(limit = 10, offset = 0) {
  if (DEMO_MODE) {
    const published = DEMO_POSTS.filter(p => p.status === 'published');
    return { data: published.slice(offset, offset + limit), error: null, count: published.length };
  }
  const { data, error, count } = await supabase
    .from('posts')
    .select('id, title, slug, excerpt, featured_image, published_at, tags, seo_keywords', { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);
  return { data, error, count };
}

export async function getPostBySlug(slug) {
  if (DEMO_MODE) {
    const post = DEMO_POSTS.find(p => p.slug === slug);
    return { data: post || null, error: post ? null : { message: 'Post not found' } };
  }
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  return { data, error };
}

export async function getAllPostsAdmin() {
  if (DEMO_MODE) {
    return { data: DEMO_POSTS, error: null };
  }
  const { data, error } = await supabase
    .from('posts')
    .select('id, title, slug, status, published_at, scheduled_at, view_count, created_at')
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function getPostByIdAdmin(id) {
  if (DEMO_MODE) {
    const post = DEMO_POSTS.find(p => p.id === Number(id));
    return { data: post || null, error: null };
  }
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
}

export async function createPost(postData) {
  if (DEMO_MODE) {
    console.log('[DEMO] Would create post:', postData);
    return { data: { ...postData, id: Date.now() }, error: null };
  }
  const { data, error } = await supabase
    .from('posts')
    .insert([postData])
    .select()
    .single();
  return { data, error };
}

export async function updatePost(id, updates) {
  if (DEMO_MODE) {
    console.log('[DEMO] Would update post:', id, updates);
    return { data: { id, ...updates }, error: null };
  }
  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function deletePost(id) {
  if (DEMO_MODE) {
    console.log('[DEMO] Would delete post:', id);
    return { error: null };
  }
  const { error } = await supabase.from('posts').delete().eq('id', id);
  return { error };
}

export async function incrementViewCount(slug) {
  if (DEMO_MODE) return;
  await supabase.rpc('increment_view_count', { post_slug: slug });
}

export async function uploadBlogImage(file, fileName) {
  if (DEMO_MODE) {
    return { url: URL.createObjectURL(file), error: null };
  }
  const fileExt = file.name.split('.').pop();
  const filePath = `blog/${Date.now()}-${fileName || 'image'}.${fileExt}`;
  const { data, error } = await supabase.storage
    .from('blog-images')
    .upload(filePath, file, { cacheControl: '3600', upsert: false });
  if (error) return { url: null, error };
  const { data: urlData } = supabase.storage.from('blog-images').getPublicUrl(filePath);
  return { url: urlData.publicUrl, error: null };
}

export async function publishScheduledPosts() {
  if (DEMO_MODE) return { error: null };
  const { error } = await supabase.rpc('publish_scheduled_posts');
  return { error };
}
