import { supabase } from "./supabase.js";


// ================= AUTH SECURITY =================
const { data: { session } } = await supabase.auth.getSession();

if (!session) {
  window.location.href = "/blog/admin-login.html";
}


// ================= LOAD DASHBOARD DATA =================
async function loadDashboard() {

  try {

    // 🔹 Fetch all required data in parallel
    const [
      { data: posts = [] },
      { data: leads = [] },
      { data: bookings = [] }
    ] = await Promise.all([
      supabase.from("posts").select("*"),
      supabase.from("leads").select("*"),
      supabase.from("bookings").select("*")
    ]);


    // ================= CALCULATIONS =================
    const totalPosts = posts.length;
    const totalLeads = leads.length;
    const totalBookings = bookings.length;

    const totalRevenue = bookings.reduce(
      (sum, b) => sum + (b.amount || 0),
      0
    );


    // ================= UPDATE UI CARDS =================
    setText("totalPosts", totalPosts);
    setText("totalLeads", totalLeads);
    setText("totalBookings", totalBookings);
    setText("totalRevenue", "₹" + totalRevenue);


    // ================= RECENT POSTS TABLE =================
    const table = document.getElementById("postTable");

    if (table) {
      table.innerHTML = posts
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5)
        .map(
          p => `
            <tr>
              <td>${escapeHTML(p.title)}</td>
              <td>${p.views || 0}</td>
            </tr>
          `
        )
        .join("");
    }

  } catch (err) {
    console.error("Dashboard load error:", err);
    alert("Failed to load dashboard data. Check console.");
  }
}


// ================= SAFE TEXT HELPER =================
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerText = value;
}


// ================= XSS SAFETY =================
function escapeHTML(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// ================= START =================
loadDashboard();
