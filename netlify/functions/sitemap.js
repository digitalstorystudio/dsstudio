import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://zkekqsvnbfelsuqkuwoz.supabase.co",
  "sb_publishable__cvthxlZb5tbI4UyNXwbkg_bDLjseJ0"
);

export async function handler() {
  const { data, error } = await supabase
    .from("posts")
    .select("slug, updated_at")
    .eq("status", "published");

  if (error) {
    return {
      statusCode: 500,
      body: "Error generating sitemap",
    };
  }

  const urls = data
    .map(
      (p) => `
  <url>
    <loc>https://digitalstorystudio.in/Blog/post.html?slug=${p.slug}</loc>
    <lastmod>${new Date(p.updated_at).toISOString()}</lastmod>
  </url>`
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
