import { supabase } from "./supabase.js";

async function loadPosts() {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  const grid = document.getElementById("blogGrid");

  if (error) {
    grid.innerHTML = "Error loading posts";
    console.error(error);
    return;
  }

  if (!data.length) {
    grid.innerHTML = "<p>No posts yet.</p>";
    return;
  }

  grid.innerHTML = data.map(p => `
    <article class="blog-card">
      ${p.image_url ? `<img src="${p.image_url}" class="blog-img">` : ""}
      <h2>${p.title}</h2>
      <p>${p.excerpt}</p>
      <small>${p.author || ""} • ${new Date(p.created_at).toDateString()}</small>
    </article>
  `).join("");
}

loadPosts();
