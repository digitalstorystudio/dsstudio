import { supabase } from "./supabase.js";

const params = new URLSearchParams(window.location.search);
const slug = params.get("slug");


// ================= LOAD POST =================
async function loadPost() {
  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !post) {
    document.body.innerHTML = "<h2 style='text-align:center;margin-top:50px;'>Post not found</h2>";
    return;
  }

  // ===== Render title =====
  document.getElementById("title").innerText = post.title;

  // ===== Render content with auto internal linking =====
  document.getElementById("content").innerHTML = autoLink(post.content);

  // ===== SEO META =====
  document.title = (post.seo_title || post.title) + " | Digital Story Studio";

  setMeta("description", post.meta_description || extractText(post.content, 150));
  setMeta("og:title", post.seo_title || post.title);
  setMeta("og:description", post.meta_description || extractText(post.content, 150));
  setMeta("og:url", window.location.href);

  // ===== JSON-LD SCHEMA =====
  addSchema(post);

  // ===== Track view =====
  await supabase
    .from("posts")
    .update({ views: (post.views || 0) + 1 })
    .eq("id", post.id);

  // ===== Load related =====
  loadRelated();
}


// ================= META HELPER =================
function setMeta(name, content) {
  let tag =
    document.querySelector(`meta[name="${name}"]`) ||
    document.querySelector(`meta[property="${name}"]`);

  if (!tag) {
    tag = document.createElement("meta");
    if (name.startsWith("og:")) tag.setAttribute("property", name);
    else tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }

  tag.setAttribute("content", content);
}


// ================= TEXT EXTRACT =================
function extractText(html, length) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.innerText.slice(0, length);
}


// ================= JSON-LD SCHEMA =================
function addSchema(post) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.meta_description || extractText(post.content, 150),
    author: {
      "@type": "Organization",
      name: "Digital Story Studio"
    },
    publisher: {
      "@type": "Organization",
      name: "Digital Story Studio"
    },
    mainEntityOfPage: window.location.href,
    datePublished: post.created_at
  };

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}


// ================= AUTO INTERNAL LINKING =================
function autoLink(content) {
  const keywords = [
    "wedding videographer in Delhi",
    "pre wedding shoot Delhi",
    "wedding photography price Delhi"
  ];

  keywords.forEach(k => {
    const url = `/blog/search.html?q=${encodeURIComponent(k)}`;
    const regex = new RegExp(k, "gi");

    content = content.replace(
      regex,
      `<a href="${url}" class="seo-link">${k}</a>`
    );
  });

  return content;
}


// ================= RELATED POSTS =================
async function loadRelated() {
  const { data } = await supabase
    .from("posts")
    .select("title, slug")
    .neq("slug", slug)
    .limit(3);

  const container = document.getElementById("relatedPosts");

  if (!data || !data.length) return;

  container.innerHTML = data
    .map(
      p => `
      <a href="post.html?slug=${p.slug}" 
         style="padding:12px;border:1px solid #eee;border-radius:8px;text-decoration:none;color:#333;">
        ${p.title}
      </a>
    `
    )
    .join("");
}


// ================= START =================
loadPost();
