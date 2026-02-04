import { supabase } from "./supabase.js";

const postsList = document.getElementById("postsList");
const newPostBtn = document.getElementById("newPostBtn");


// 🔐 Check login
async function checkAuth() {
  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    window.location.href = "/blog/admin-login.html";
  }
}


// 📥 Load posts
async function loadPosts() {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    postsList.innerHTML =
      `<tr><td colspan="4" class="empty">Error loading posts</td></tr>`;
    console.error(error);
    return;
  }

  if (!data.length) {
    postsList.innerHTML =
      `<tr><td colspan="4" class="empty">No posts yet</td></tr>`;
    return;
  }

  postsList.innerHTML = "";

  data.forEach(post => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${post.title}</td>
      <td>${post.slug}</td>
      <td>${new Date(post.created_at).toLocaleDateString()}</td>
      <td>
        <button class="action-btn edit" data-id="${post.id}">Edit</button>
        <button class="action-btn delete" data-id="${post.id}">Delete</button>
      </td>
    `;

    postsList.appendChild(tr);
  });
}


// ❌ Delete
async function deletePost(id) {
  if (!confirm("Delete this post?")) return;

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Delete failed");
    console.error(error);
    return;
  }

  loadPosts();
}


// 🎯 Click events
postsList.addEventListener("click", e => {
  if (e.target.classList.contains("delete")) {
    deletePost(e.target.dataset.id);
  }

  if (e.target.classList.contains("edit")) {
    window.location.href = `/blog/admin.html?id=${e.target.dataset.id}`;
  }
});


newPostBtn.addEventListener("click", () => {
  window.location.href = "/blog/admin.html";
});


// 🚀 Start
await checkAuth();
await loadPosts();
