import { supabase } from "./supabase.js";

const { data } = await supabase.from("bookings").select("*");

const total = data.reduce((s,b)=>s + (b.amount || 0),0);

document.getElementById("total").innerText = "₹" + total;

document.getElementById("list").innerHTML =
data.map(b=>`<li>₹${b.amount} (Advance ₹${b.advance})</li>`).join("");
