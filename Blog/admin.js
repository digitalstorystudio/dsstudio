import { supabase } from "./supabase.js";

const titleInput = document.getElementById("title");
const slugInput = document.getElementById("slug");
const seoTitleInput = document.getElementById("seoTitle");
const metaDescInput = document.getElementById("metaDesc");
const saveBtn = document.getElementById("saveBtn");

// 🔐 Auth check
const { data: sessionData } = await supabase.auth.getSession();
if (!sessionData.session) {
  window.location.href = "/blog/admin-login.html";
}

// ✍️ Quill editor
const quill = new Quill("#editor", { theme: "snow" });


// ===== AUTO SLUG =====
titleInput.addEventListener("input", () => {
  slugInput.value = titleInput.value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
});


// ===== AUTO SEO GENERATOR =====
function generateSEO() {
  const title = titleInput.value.trim();
  const text = quill.root.innerText.trim();

  if (!title) return;

  // Delhi keyword injection
  const seoTitle = `${title} | Best Wedding Videographer in Delhi`;

  // 150 char smart description
  const metaDesc =
    (text.slice(0, 140) || title) +
    " – Professional wedding cinematography in Delhi by Digital Story Studio.";

  seoTitleInput.value = seoTitle;
  metaDescInput.value = metaDesc;
}

// run on typing
titleInput.addEventListener("blur", generateSEO);
quill.on("text-change", generateSEO);


// ===== EDIT MODE =====
const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

if (postId) {
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
    .single();

  if (data) {
    titleInput.value = data.title;
    slugInput.value = data.slug;
    quill.root.innerHTML = data.content;
    seoTitleInput.value = data.seo_title || "";
    metaDescInput.value = data.meta_description || "";
  }
}


// ===== SAVE POST =====
saveBtn.addEventListener("click", async () => {
  const title = titleInput.value.trim();
  const slug = slugInput.value.trim();
  const content = quill.root.innerHTML;
  const seo_title = seoTitleInput.value.trim();
  const meta_description = metaDescInput.value.trim();

  if (!title || !slug || !content) {
    alert("Fill all fields");
    return;
  }

  if (postId) {
    await supabase
      .from("posts")
      .update({ title, slug, content, seo_title, meta_description })
      .eq("id", postId);
  } else {
    await supabase
      .from("posts")
      .insert({ title, slug, content, seo_title, meta_description });
  }

  window.location.href = "/blog/dashboard.html";
});
