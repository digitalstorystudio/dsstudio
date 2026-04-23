# Digital Story Studio — Blog Deployment Guide
### Supabase + GitHub + Netlify — Complete Setup

---

## PART 1 — SUPABASE SETUP (Database)

### Step 1: Create Supabase Project
1. Go to https://supabase.com and sign up (free)
2. Click **"New Project"**
3. Fill in:
   - **Name:** digital-story-studio-blog
   - **Database Password:** Choose a strong password (save it!)
   - **Region:** Southeast Asia (Singapore) — closest to Delhi
4. Click **"Create new project"** — wait 1-2 minutes

### Step 2: Run the Database Schema
1. In your Supabase project, click **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Open the file `supabase-schema.sql` from this folder
4. Copy ALL the contents and paste into the SQL Editor
5. Click **"Run"** (green button)
6. You should see "Success. No rows returned"

### Step 3: Get Your API Keys
1. Click **"Project Settings"** (gear icon) in left sidebar
2. Click **"API"**
3. Copy these three values — you'll need them:
   - **Project URL** → looks like `https://abcdefgh.supabase.co`
   - **anon / public key** → long key starting with `eyJ...`
   - **service_role key** → another long key (keep this SECRET)

### Step 4: Create Your Admin User
1. Click **"Authentication"** in left sidebar
2. Click **"Users"** tab
3. Click **"Add user"** → **"Create new user"**
4. Fill in:
   - **Email:** admin@digitalstorystudio.in (or your email)
   - **Password:** Choose a strong password
5. Click **"Create User"**

### Step 5: Set Up Storage Bucket
1. Click **"Storage"** in left sidebar
2. Click **"New bucket"**
3. Name it exactly: `blog-images`
4. Toggle **"Public bucket"** ON
5. Click **"Save"**

---

## PART 2 — GITHUB SETUP

### Step 6: Add Blog to Your GitHub Repo
Your main website is already on GitHub. Now add the blog folder to it.

**Option A — Add to existing repo (recommended):**
```
# In your terminal, go to your website's GitHub folder
cd C:\your-website-folder

# Copy the blog-system folder into your repo
# (just drag the blog-system folder into your repo folder)

# Then commit and push
git add blog-system/
git commit -m "Add blog system with Next.js + Supabase"
git push origin main
```

**Option B — Separate GitHub repo:**
```
cd blog-system
git init
git add .
git commit -m "Initial blog system"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/dss-blog.git
git push -u origin main
```

> ⚠️ IMPORTANT: Never push `.env.local` to GitHub — it's already in `.gitignore`

---

## PART 3 — NETLIFY DEPLOYMENT

### Step 7: Create New Netlify Site for the Blog
Your main site is already on Netlify. The blog needs its own Netlify site.

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Click **"GitHub"** and select your repository
4. If blog is in a subfolder, set:
   - **Base directory:** `blog-system`
   - **Build command:** `npm run build`
   - **Publish directory:** `blog-system/.next`
5. Click **"Deploy site"**

### Step 8: Set Environment Variables in Netlify
This is where you put your Supabase keys — NOT in code files.

1. In your Netlify blog site, go to **"Site configuration"**
2. Click **"Environment variables"**
3. Click **"Add a variable"** for each:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service_role key |
| `NEXT_PUBLIC_SITE_URL` | `https://digitalstorystudio.in` |

4. After adding all 4 variables, click **"Trigger deploy"** → **"Deploy site"**

### Step 9: Set Up Custom Domain (blog.digitalstorystudio.in)
1. In your Netlify blog site, go to **"Domain management"**
2. Click **"Add a domain"**
3. Type: `blog.digitalstorystudio.in`
4. Netlify will show you a CNAME record to add

**In your domain registrar (GoDaddy / BigRock / wherever):**
1. Go to DNS settings for digitalstorystudio.in
2. Add a CNAME record:
   - **Host/Name:** `blog`
   - **Value/Points to:** `your-blog-site.netlify.app`
3. Wait 10-30 minutes for DNS to propagate

### Step 10: Add /blog Link on Main Site
Add this to your main site's navbar so visitors can find the blog:
```html
<a href="https://blog.digitalstorystudio.in">Blog</a>
```

Or if you want the blog at `digitalstorystudio.in/blog` (same domain):
Add this to your main site's `_redirects` file on Netlify:
```
/blog/* https://blog.digitalstorystudio.in/:splat 200
/blog https://blog.digitalstorystudio.in 200
```

---

## PART 4 — VERIFY EVERYTHING WORKS

### Step 11: Test Checklist
After deployment, verify:

- [ ] `https://blog.digitalstorystudio.in/blog` shows blog listing
- [ ] `https://blog.digitalstorystudio.in/admin` shows login page
- [ ] Login with your admin email + password works
- [ ] Dashboard loads with stats
- [ ] "New Post" editor loads
- [ ] Write a test post and publish it
- [ ] Published post appears on blog listing
- [ ] Individual post page loads with full nav/footer

---

## PART 5 — WRITING BLOGS (Daily Workflow)

Once everything is deployed:

1. Go to `https://blog.digitalstorystudio.in/admin`
2. Login with your admin credentials
3. Click **"✍️ New Post"**
4. Fill in:
   - **Title** — e.g., "Best Wedding Venues in Delhi NCR 2026"
   - **Content** — write using the rich text editor
   - **Media tab** — upload photos or paste YouTube/Instagram link
   - **SEO tab** — click "Auto-Generate SEO" button
   - **Settings tab** — choose Publish Now or Schedule for later
5. Click **"Publish Post"**

The post goes live immediately on your blog!

---

## TROUBLESHOOTING

**Build fails on Netlify?**
- Check that all 4 environment variables are set correctly
- Make sure Base directory is set to `blog-system`

**Login not working after Supabase setup?**
- Make sure you created the admin user in Supabase → Authentication → Users
- Check your email/password is correct
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set in Netlify

**Blog page shows no posts?**
- Make sure you ran the full `supabase-schema.sql`
- Check that your posts have status = 'published' in Supabase

**Images not loading after upload?**
- Make sure the `blog-images` storage bucket is set to PUBLIC in Supabase

---

## SUPPORT
If stuck, check Supabase docs: https://supabase.com/docs
Netlify Next.js guide: https://docs.netlify.com/frameworks/next-js/overview/
