import { supabase } from "./supabase.js";

async function loadAnalytics() {
  // Total views
  const { count } = await supabase
    .from("analytics")
    .select("*", { count: "exact", head: true });

  document.getElementById("totalViews").innerText =
    "Total Views: " + count;

  // Top posts
  const { data } = await supabase.rpc("top_posts");

  const container = document.getElementById("topPosts");
  container.innerHTML = "<h2>Top Posts</h2>";

  data.forEach(p => {
    const div = document.createElement("div");
    div.innerText = `${p.post_slug} — ${p.views} views`;
    container.appendChild(div);
  });
}

loadAnalytics();
