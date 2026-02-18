import { supabase } from "./supabase.js";

const { data } = await supabase
  .from("reviews")
  .select("*")
  .order("created_at",{ascending:false});

document.getElementById("reviews").innerHTML =
data.map(r=>`<li>⭐ ${r.rating}/5 — ${r.text}</li>`).join("");
