export async function handler() {
  const res = await fetch(
    "https://zkekqsvnbfelsuqkuwoz.supabase.co/rest/v1/posts?select=slug",
    {
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY,
      },
    }
  );

  const posts = await res.json();

  const urls = posts
    .map(
      (p) =>
        `<url><loc>https://digitalstorystudio.in/blog/post.html?slug=${p.slug}</loc></url>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls}
  </urlset>`;

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/xml" },
    body: xml,
  };
}
