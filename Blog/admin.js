import { supabase } from "./supabase.js";

/* ================= IMAGE OPTIMIZE UPLOAD ================= */

async function uploadOptimizedImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/.netlify/functions/optimize-image", {
    method: "POST",
    body: JSON.stringify({
      imageUrl: URL.createObjectURL(file),
      fileName: Date.now().toString(),
    }),
  });

  const data = await res.json();

  if (!data.url) {
    alert("Image upload failed");
    throw new Error("Upload failed");
  }

  return data.url;
}

/* ================= POST CREATE / EDIT ================= */

const form = document.getElementById("postForm");
const fileInput = document.getElementById("image");

const params = new URLSearchParams(location.search);
const editId = params.get("edit");

/* ====== EDIT MODE LOAD ====== */
if (editId) {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", editId)
    .single();

  if (!error && data) {
    form.title.value = data.title;
    form.slug.value = data.slug;
    document.getElementById("content").value = data.content || "";
  }
}

/* ====== SUBMIT ====== */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = form.title.value.trim();
  const slug = form.slug.value.trim();
  const content = document.getElementById("content").value;

  let imageUrl = "";

  const file = fileInput?.files?.[0];

  /* ==== Upload optimized image if selected ==== */
  if (file) {
    try {
      imageUrl = await uploadOptimizedImage(file);
    } catch (err) {
      console.error(err);
      return;
    }
  }

  const payload = {
    title,
    slug,
    content,
    image_url: imageUrl || null,
  };

  /* ===== INSERT or UPDATE ===== */
  if (editId) {
    await supabase.from("posts").update(payload).eq("id", editId);
  } else {
    await supabase.from("posts").insert([payload]);
  }

  /* ===== Redirect to dashboard ===== */
  location.href = "/Blog/dashboard.html";
});
