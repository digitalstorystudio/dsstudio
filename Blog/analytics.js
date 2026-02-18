import { supabase } from "./supabase.js";

const { data } = await supabase
  .from("posts")
  .select("title, views")
  .order("views",{ascending:false});

const ctx = document.getElementById("viewsChart");

new Chart(ctx,{
  type:"bar",
  data:{
    labels:data.map(p=>p.title),
    datasets:[{
      label:"Views",
      data:data.map(p=>p.views)
    }]
  }
});

// Top posts list
document.getElementById("topPosts").innerHTML =
  data.slice(0,5).map(p=>`<li>${p.title} (${p.views})</li>`).join("");
