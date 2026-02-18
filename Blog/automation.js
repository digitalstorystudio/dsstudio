import { supabase } from "./supabase.js";


// ================= AUTH SECURITY =================
const { data: { session } } = await supabase.auth.getSession();

if (!session) {
  window.location.href = "/blog/admin-login.html";
}


// ================= LOAD DASHBOARD =================
async function loadAutomationDashboard() {

  try {

    // 🔹 Fetch data in parallel (fast)
    const [
      { data: leads = [] },
      { data: bookings = [] },
      { data: posts = [] }
    ] = await Promise.all([
      supabase.from("leads").select("*"),
      supabase.from("bookings").select("*"),
      supabase.from("posts").select("title, views")
    ]);


    // ================= SUMMARY CALCULATIONS =================
    const totalLeads = leads.length;
    const totalBookings = bookings.length;

    const totalRevenue = bookings.reduce(
      (sum, b) => sum + (b.amount || 0),
      0
    );

    const conversion =
      totalLeads === 0
        ? 0
        : Math.round((totalBookings / totalLeads) * 100);


    // ================= UPDATE UI =================
    setText("totalLeads", totalLeads);
    setText("totalBookings", totalBookings);
    setText("totalRevenue", "₹" + totalRevenue);
    setText("conversion", conversion + "%");


    // ================= MONTHLY REVENUE GRAPH =================
    renderRevenueChart(bookings);


    // ================= TOP POSTS =================
    const topList = document.getElementById("topPosts");

    if (topList) {
      topList.innerHTML = posts
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5)
        .map(
          p => `<li>${escapeHTML(p.title)} — ${p.views || 0} views</li>`
        )
        .join("");
    }

  } catch (err) {
    console.error("Automation dashboard error:", err);
    alert("Failed to load automation dashboard. Check console.");
  }
}


// ================= RENDER REVENUE CHART =================
function renderRevenueChart(bookings) {

  const canvas = document.getElementById("revenueChart");
  if (!canvas || typeof Chart === "undefined") return;

  const monthly = {};

  bookings.forEach(b => {
    if (!b.created_at) return;

    const month = new Date(b.created_at).toLocaleString("default", {
      month: "short",
      year: "numeric"
    });

    monthly[month] = (monthly[month] || 0) + (b.amount || 0);
  });

  const labels = Object.keys(monthly);
  const values = Object.values(monthly);

  new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Revenue ₹",
        data: values,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: "#fff" }
        }
      },
      scales: {
        x: {
          ticks: { color: "#ccc" }
        },
        y: {
          ticks: { color: "#ccc" }
        }
      }
    }
  });
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
loadAutomationDashboard();
