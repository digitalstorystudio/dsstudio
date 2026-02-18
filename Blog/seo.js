import { supabase } from "./supabase.js";


// ================= SEO ANALYZER =================
window.analyzeSEO = async () => {

  const keyword = document.getElementById("keyword").value.toLowerCase().trim();
  const content = document.getElementById("content").value.toLowerCase().trim();

  if (!keyword || !content) {
    alert("Enter keyword and content");
    return;
  }

  // 🔹 keyword count
  const count = (content.match(new RegExp(keyword, "g")) || []).length;

  // 🔹 word count
  const words = content.split(/\s+/).length;

  // 🔹 density %
  const density = (count / words) * 100;

  // 🔹 score calculation
  let score = 0;

  if (density >= 0.8 && density <= 2.5) score += 40;
  if (content.length > 800) score += 30;
  if (content.includes(keyword)) score += 30;

  // 🔹 tips generator
  let tips = "";

  if (density < 0.8) tips += "Increase keyword usage. ";
  if (density > 2.5) tips += "Reduce keyword stuffing. ";
  if (content.length < 800) tips += "Write at least 800+ words. ";

  if (!tips) tips = "Great SEO optimization!";

  // 🔹 show result
  document.getElementById("score").innerText = "SEO Score: " + score + "/100";
  document.getElementById("tips").innerText = tips;

  // 🔹 save SEO log in Supabase
  try {
    await supabase.from("seo_logs").insert({
      keyword,
      score
    });
  } catch (err) {
    console.error("SEO log save error:", err);
  }
};


// ================= TOPIC SUGGESTION =================
window.suggestTopics = () => {

  const topics = [
    "Best wedding videographer in Delhi 2026",
    "Wedding photography price in Delhi",
    "Top pre wedding shoot locations in Delhi",
    "Affordable wedding videography Delhi",
    "Cinematic wedding film trends Delhi"
  ];

  document.getElementById("topics").innerHTML =
    topics.map(t => `<li>${t}</li>`).join("");
};
