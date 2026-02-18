export async function handler(event) {
  const body = JSON.parse(event.body);

  await fetch(
    "https://zkekqsvnbfelsuqkuwoz.supabase.co/rest/v1/leads",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(body)
    }
  );

  return {
    statusCode: 200,
    body: "Lead saved"
  };
}
