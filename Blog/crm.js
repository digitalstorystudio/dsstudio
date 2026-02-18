import { supabase } from "./supabase.js";

const { data } = await supabase
  .from("leads")
  .select("*")
  .order("created_at",{ascending:false});

const table = document.getElementById("leadTable");

table.innerHTML = data.map(l=>`
<tr>
<td>${l.name || "-"}</td>
<td>${l.phone || "-"}</td>
<td>${l.status}</td>
<td>
<button onclick="updateStatus('${l.id}','contacted')">Contacted</button>
<button onclick="updateStatus('${l.id}','booked')">Booked</button>
</td>
</tr>
`).join("");

window.updateStatus = async(id,status)=>{
  await supabase.from("leads").update({status}).eq("id",id);
  location.reload();
};
