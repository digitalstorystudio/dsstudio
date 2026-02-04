import { supabase } from "./supabase.js";

/* slug URL se lo */
const slug = new URLSearchParams(location.search).get("slug");

/* safety check */
if (!slug) {
  document.body.innerHTML = "Invalid post URL";
  throw new Error("Missing slug");
}

/* Supabase se single post lao */
const { data, error } = await supabase
  .from("posts")
  .select("*")
  .eq("slug", slug)
  .eq("status", "published")
  .single();
  trackView(slug);

if (error || !data) {
  document.body.innerHTML = "Post not found";
  throw new Error("Post not found");
}

/* HTML render */
const container = document.getElementById("post");

container.innerHTML = `
  <h1>${data.title}</h1>
  <div>${data.content}</div>
`;

/* ================= SEO META AUTO SET ================= */

/* Title */
document.title = data.title;

/* Description */
const metaDesc = document.createElement("meta");
metaDesc.name = "description";
metaDesc.content = data.excerpt || "";
document.head.appendChild(metaDesc);

/* OpenGraph */
const ogTitle = document.createElement("meta");
ogTitle.setAttribute("property", "og:title");
ogTitle.content = data.title;
document.head.appendChild(ogTitle);

const ogDesc = document.createElement("meta");
ogDesc.setAttribute("property", "og:description");
ogDesc.content = data.excerpt || "";
document.head.appendChild(ogDesc);

/* OG Image */
if (data.image_url) {
  const ogImg = document.createElement("meta");
  ogImg.setAttribute("property", "og:image");
  ogImg.content = data.image_url;
  document.head.appendChild(ogImg);
}

/* Canonical URL */
const canonical = document.createElement("link");
canonical.rel = "canonical";
canonical.href = `https://digitalstorystudio.in/Blog/post.html?slug=${slug}`;
document.head.appendChild(canonical);


async function trackView(slug) {
  await supabase.from("analytics").insert({
    post_slug: slug,
    device: navigator.userAgent,
    country: "unknown"
  });
}


