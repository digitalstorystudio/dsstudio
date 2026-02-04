import sharp from "sharp";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://zkekqsvnbfelsuqkuwoz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprZWtxc3ZuYmZlbHN1cWt1d296Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDIxOTM3OSwiZXhwIjoyMDg1Nzk1Mzc5fQ.Nq9H47P1SCO5ehpXfo4iFKzi7BquZP3ZK1_Fvp5CBuw"
);

export async function handler(event) {
  try {
    const { imageUrl, fileName } = JSON.parse(event.body);

    /* original image download */
    const res = await fetch(imageUrl);
    const buffer = await res.buffer();

    /* compress + convert to webp */
    const optimized = await sharp(buffer)
      .resize({ width: 1200 })
      .webp({ quality: 75 })
      .toBuffer();

    /* upload to Supabase storage */
    const { error } = await supabase.storage
      .from("blog-images")
      .upload(`optimized/${fileName}.webp`, optimized, {
        contentType: "image/webp",
        upsert: true,
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from("blog-images")
      .getPublicUrl(`optimized/${fileName}.webp`);

    return {
      statusCode: 200,
      body: JSON.stringify({ url: data.publicUrl }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: err.message,
    };
  }
}
