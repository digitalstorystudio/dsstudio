import { supabase } from "./supabase.js";

const postsList = document.getElementById("postsList");
const totalPosts = document.getElementById("totalPosts");
const totalViews = document.getElementById("totalViews");
const latestPost = document.getElementById("latestPost");


// 🔐 Auth check
const { data: sessionData } = await supabase.auth.getSession();
if (!sessionData.session) {
  window.location.href = "/blog/admin-login.html";
}


// 📥 Load posts
async function loadDashboard() {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    postsList.innerHTML =
      `<tr><td colspan="4" class="empty">Error loading</td></tr>`;
    console.error(error);
    return;
  }

  if (!data.length) {
    postsList.innerHTML =
      `<tr><td colspan="4" class="empty">No posts yet</td></tr>`;
    return;
  }

  // Stats
  totalPosts.textContent = data.length;
  totalViews.textContent = data.reduce((sum,p)=>sum+(p.views||0),0);
  latestPost.textContent = data[0].title;

  postsList.innerHTML = "";

  data.forEach(post => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${post.title}</td>
      <td>${post.slug}</td>
      <td>${new Date(post.created_at).toLocaleDateString()}</td>
      <td>
        <button class="action edit" data-id="${post.id}">Edit</button>
        <button class="action delete" data-id="${post.id}">Delete</button>
      </td>
    `;

    postsList.appendChild(tr);
  });
}


// ❌ Delete
postsList.addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete")) {
    if (!confirm("Delete this post?")) return;

    await supabase.from("posts").delete().eq("id", e.target.dataset.id);
    loadDashboard();
  }

  if (e.target.classList.contains("edit")) {
    window.location.href = `/blog/admin.html?id=${e.target.dataset.id}`;
  }
});


// ➕ New post
document.getElementById("newPostBtn").onclick = () => {
  window.location.href = "/blog/admin.html";
};


// 🚪 Logout
document.getElementById("logoutBtn").onclick = async () => {
  await supabase.auth.signOut();
  window.location.href = "/blog/admin-login.html";
};


// 🚀 Start
loadDashboard();
