import { supabase } from "./supabase.js";

const { data:{session} } = await supabase.auth.getSession();
if (!session) location.href="/blog/admin-login.html";

const title = document.getElementById("title");
const content = document.getElementById("content");
const category = document.getElementById("category");
const image = document.getElementById("image");
const seoTitle = document.getElementById("seoTitle");
const metaDesc = document.getElementById("metaDesc");

const params = new URLSearchParams(location.search);
const postId = params.get("id");


// 🔹 Load categories
const { data: cats } = await supabase.from("categories").select("*");
category.innerHTML = cats.map(c=>`<option value="${c.id}">${c.name}</option>`).join("");


// 🔹 Edit mode
if(postId){
  const { data } = await supabase.from("posts").select("*").eq("id",postId).single();
  title.value=data.title;
  content.value=data.content;
  image.value=data.image || "";
  seoTitle.value=data.seo_title || "";
  metaDesc.value=data.meta_description || "";
  category.value=data.category_id;
}


// 🔹 Auto SEO
title.addEventListener("blur",()=>{
  seoTitle.value = `${title.value} | Wedding Videographer in Delhi`;
  metaDesc.value = content.value.slice(0,140);
});


// 🔹 Save
document.getElementById("saveBtn").onclick = async ()=>{
  const payload = {
    title:title.value.trim(),
    content:content.value.trim(),
    image:image.value.trim(),
    category_id:category.value,
    seo_title:seoTitle.value,
    meta_description:metaDesc.value
  };

  if(postId){
    await supabase.from("posts").update(payload).eq("id",postId);
  }else{
    await supabase.from("posts").insert(payload);
  }

  location.href="dashboard.html";
};
