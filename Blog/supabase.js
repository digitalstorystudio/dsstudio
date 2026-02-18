import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://zkekqsvnbfelsuqkuwoz.supabase.co";
const supabaseKey = "sb_publishable__cvthxlZb5tbI4UyNXwbkg_bDLjseJ0";

export const supabase = createClient(supabaseUrl, supabaseKey);
