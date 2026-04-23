# Digital Story Studio — Blog System Setup Guide

## What You're Getting

A fully professional blog system with:
- ✅ Secure Admin Login (email + password via Supabase)
- ✅ Rich Text Editor (bold, headings, lists, images, links)
- ✅ Upload photos directly OR paste Instagram/YouTube links — auto-embedded
- ✅ Publish Now or Schedule posts for any future date/time
- ✅ Auto-generated Delhi NCR SEO keywords for every post
- ✅ Geo-tags (Delhi, 28.6139°N 77.2090°E) on every page
- ✅ JSON-LD structured data for Google rich results
- ✅ Free hosting on Vercel + Free database on Supabase

---

## Step 1 — Create Your Supabase Project (FREE)

1. Go to **https://supabase.com** and sign up (free)
2. Click **"New Project"**
3. Fill in:
   - **Project name:** `digital-story-studio-blog`
   - **Database password:** Choose a strong password (save it!)
   - **Region:** `ap-southeast-1` (Singapore — closest to Delhi)
4. Wait ~2 minutes for it to provision

---

## Step 2 — Run the Database Schema

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Open the file `supabase-schema.sql` from this folder
4. Copy everything and paste it into the SQL Editor
5. Click **"Run"** (or press Ctrl+Enter)
6. You should see "Success. No rows returned"

---

## Step 3 — Get Your API Keys

1. In Supabase, go to **Settings → API**
2. Copy these two values:
   - **Project URL** (looks like: `https://abcdefgh.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)
3. Also copy the **service_role key** (keep this secret!)

---

## Step 4 — Create Your Admin User

1. In Supabase, go to **Authentication → Users**
2. Click **"Invite User"** or **"Add User"**
3. Enter your email address
4. Check your email and set a password
5. This email/password will be your admin login

---

## Step 5 — Set Up the Project Locally

```bash
# Open terminal/command prompt
# Navigate to the blog-system folder
cd "path/to/blog-system"

# Install dependencies
npm install

# Create your environment file
cp .env.local.example .env.local
```

Now edit `.env.local` with your values:
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_SITE_URL=https://digitalstorystudio.in
NEXT_PUBLIC_SITE_NAME=Digital Story Studio
```

Test locally:
```bash
npm run dev
# Open http://localhost:3000/blog
# Open http://localhost:3000/admin
```

---

## Step 6 — Deploy to Vercel (FREE)

1. Go to **https://vercel.com** and sign up (free)
2. Connect your GitHub account
3. Push your `blog-system` folder to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial blog system"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/dss-blog.git
   git push -u origin main
   ```
4. In Vercel: **"Add New Project"** → Import your GitHub repo
5. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
   - `SUPABASE_SERVICE_ROLE_KEY` = your service role key
   - `NEXT_PUBLIC_SITE_URL` = `https://digitalstorystudio.in`
6. Click **"Deploy"**
7. Vercel gives you a URL like `dss-blog.vercel.app`

---

## Step 7 — Connect to Your Main Domain

**Option A: Subdomain (easiest)**
Add to your DNS (in GoDaddy/Namecheap/Cloudflare):
```
CNAME   blog   cname.vercel-dns.com
```
Blog will be at: `blog.digitalstorystudio.in`

**Option B: /blog path on main domain**
Add in Vercel dashboard → "Domains" → add `digitalstorystudio.in`
Then go to Vercel → Settings → "Path Rewrites" to route `/blog/*` to your Next.js app.

---

## Step 8 — Enable Scheduled Posts Auto-Publishing

For scheduled posts to auto-publish, set up a Supabase Edge Function cron:

1. In Supabase → Edge Functions → Create new function called `publish-scheduled`
2. Paste this code:
```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  await supabase.rpc('publish_scheduled_posts')
  return new Response('OK')
})
```
3. In Supabase → Integrations → Cron Jobs → Add:
   - Schedule: `*/5 * * * *` (every 5 minutes)
   - Function: `publish-scheduled`

Alternatively: Vercel Cron (free tier allows daily crons) can call your `/api/publish-scheduled` endpoint.

---

## How to Use the Admin Panel

### Access Admin
Go to: `your-domain.com/admin`
Login with your email and password.

### Write a New Post
1. Click **"Write New Post"** from dashboard
2. Type your title — the URL slug auto-generates
3. Use the editor tabs:
   - **Content** — Write your blog post with rich text
   - **Media** — Upload a photo OR paste YouTube/Instagram link
   - **SEO** — Click "Auto-Generate SEO" for Delhi NCR keywords
   - **Settings** — Choose Draft, Publish Now, or Schedule

### Adding YouTube Videos
In the Media tab, paste any YouTube URL:
- `https://www.youtube.com/watch?v=XXXXXXXXX`
- `https://youtu.be/XXXXXXXXX`
- YouTube Shorts work too!

### Adding Instagram Posts
In the Media tab, paste any Instagram URL:
- `https://www.instagram.com/p/XXXXXXXXX/`
- `https://www.instagram.com/reel/XXXXXXXXX/`

### Scheduling Posts
1. In Settings tab, select "⏰ Schedule"
2. Pick your date and time
3. Click "Save Draft"
4. The post auto-publishes at the scheduled time (requires Step 8 above)

---

## SEO — How It Works

Every post automatically gets:
1. **Geo tags**: `geo.region=IN-DL`, lat/lng for Delhi NCR
2. **Auto keywords**: Generated from your content + predefined Delhi NCR photography terms
3. **JSON-LD** structured data: BlogPosting schema with location (Delhi NCR)
4. **Open Graph**: For WhatsApp/Facebook/Twitter previews
5. **Meta description**: Auto-generated from your excerpt/content

The SEO generator knows about:
- Wedding, event, drone, portrait, product, maternity photography
- All Delhi NCR locations (South Delhi, Noida, Gurgaon, etc.)
- Service-specific keyword combinations

---

## File Structure

```
blog-system/
├── app/
│   ├── blog/
│   │   ├── page.js              ← Public blog listing
│   │   └── [slug]/page.js       ← Individual post page
│   ├── admin/
│   │   ├── layout.js            ← Admin auth guard + sidebar
│   │   ├── page.js              ← Login page
│   │   ├── dashboard/page.js    ← Dashboard with stats
│   │   └── posts/
│   │       ├── page.js          ← All posts list
│   │       ├── new/page.js      ← New post editor
│   │       └── [id]/edit/page.js ← Edit post
│   ├── globals.css              ← Site-wide styles
│   └── layout.js                ← Root layout with SEO
├── components/
│   ├── BlogCard.js              ← Post card for listing
│   └── RichEditor.js            ← TipTap rich text editor
├── lib/
│   ├── supabase.js              ← DB + auth functions
│   ├── seoGenerator.js          ← Delhi NCR SEO auto-generator
│   └── mediaUtils.js            ← YouTube/Instagram URL parser
├── supabase-schema.sql          ← Database schema (run once)
├── .env.local.example           ← Environment variables template
└── package.json
```

---

## Troubleshooting

**"Missing Supabase environment variables"**
→ Make sure `.env.local` exists and has correct values. Restart `npm run dev`.

**"Row level security violation"**
→ You're not logged in as admin. Check Supabase Auth → Users to confirm your account exists.

**Posts not showing on public blog**
→ Make sure status is set to `published`. Draft/scheduled posts won't appear publicly.

**Instagram embed not loading**
→ Instagram embeds require the viewer to allow third-party cookies. This is an Instagram limitation. The link preview still works.

**Scheduled post didn't publish**
→ Set up the Supabase Edge Function cron as described in Step 8.

---

## Support

Having issues? Contact the developer or check:
- Supabase docs: https://supabase.com/docs
- Next.js docs: https://nextjs.org/docs
- Vercel docs: https://vercel.com/docs
