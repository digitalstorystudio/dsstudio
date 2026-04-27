# Forms — Setup Guide (Read once, takes ~5 min)

## What I already did for you

All 3 forms on your site are now wired up:

| Form                       | Where it lives                            |
|----------------------------|-------------------------------------------|
| **Booking Inquiry**        | `contactus.html`                          |
| **General Inquiry**        | `contactus.html`                          |
| **Get a Free Quote**       | All 9 pages in `Ourwork/`                 |

When anyone submits any of these, the data goes to **two places**:

1. **Email → `chat.dsstudio@gmail.com`** (works the moment you go live, **zero setup**)
2. **Google Sheet** (works **only after** you complete the 5-minute setup below)

---

## PART 1 — Email forwarding (almost zero work)

The first time **anyone** submits a form on your live site, FormSubmit will send a verification email to `chat.dsstudio@gmail.com`. Just click the verification link in that email — that's it. After that, all form submissions land directly in your inbox forever.

**You don't need to do anything until that first submission happens.**

---

## PART 2 — Google Sheet integration (5 minutes, do once)

This is the part where data goes into a **Google Sheet** automatically. Follow the steps in order. If you get stuck on any step, take a screenshot and send to me.

### Step 1 — Create the Google Sheet

1. Go to <https://sheets.google.com> and click the big **+** to create a new blank sheet.
2. Rename it to **`DSS Form Submissions`** (top-left, click the title).
3. At the bottom, you'll see a tab called **`Sheet1`**. We need **3 tabs**.
   - Right-click `Sheet1` → **Rename** → type `Booking`
   - Click the **+** at the bottom-left to add a new tab → rename it `General`
   - Click **+** again → rename it `Quote`
4. Click each tab and paste the header row below into row 1:

   **Booking tab — paste this in cell A1:**
   ```
   Timestamp	Name	Email	Phone	Event Date	Service	Location	Budget	Message	Page URL
   ```

   **General tab — paste this in cell A1:**
   ```
   Timestamp	Name	Email	Subject	Message	Page URL
   ```

   **Quote tab — paste this in cell A1:**
   ```
   Timestamp	Name	Phone	Service	Event Date	Message	Page URL
   ```

   *(The gaps between words are tab characters. When you paste, each word should land in its own column automatically.)*

### Step 2 — Open Apps Script

1. With the sheet still open, in the top menu click **Extensions → Apps Script**.
2. A new tab opens with a code editor. Delete everything that's there.
3. Copy the entire code block below and paste it into the editor:

```javascript
const TABS = { booking: 'Booking', general: 'General', quote: 'Quote' };

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    const tab = TABS[(d.formType || '').toLowerCase()];
    if (!tab) return out({ ok: false, error: 'Unknown formType' });
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tab);
    const ts = new Date();
    let row;
    if (d.formType === 'booking') {
      row = [ts, d.name, d.email, d.phone, d.event_date,
             d.service, d.location, d.budget, d.message, d.page_url];
    } else if (d.formType === 'general') {
      row = [ts, d.name, d.email, d.subject, d.message, d.page_url];
    } else {
      row = [ts, d.name, d.phone, d.service, d.event_date,
             d.message, d.page_url];
    }
    sh.appendRow(row);
    return out({ ok: true });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  }
}
function doGet() { return out({ ok: true, status: 'live' }); }
function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
                       .setMimeType(ContentService.MimeType.JSON);
}
```

4. Click the **Save** icon (💾) at the top, or press `Ctrl + S` (or `Cmd + S`).
5. When asked, name the project **`DSS Forms`**.

### Step 3 — Deploy as Web App

1. In the top-right of Apps Script, click the blue **Deploy** button → **New deployment**.
2. Click the gear icon ⚙ next to "Select type" → choose **Web app**.
3. Fill in:
   - **Description**: `DSS Forms v1`
   - **Execute as**: `Me (your email)`
   - **Who has access**: **Anyone** ← important!
4. Click **Deploy**.
5. Google will ask for permissions — click **Authorize access** → choose your account → **Allow**. (You may see a "Google hasn't verified this app" warning. Click **Advanced** → **Go to DSS Forms (unsafe)** — it's safe, it's your own script.)
6. After deploying, you'll see a **Web app URL** that looks like this:

   ```
   https://script.google.com/macros/s/AKfycbxXXXXXXXXXXXXXXXXXXXXXXX/exec
   ```

   **Copy this URL.** This is the magic link.

### Step 4 — Paste the URL into your website

1. Open the file **`forms.js`** in the website root folder (in any text editor like Notepad or VS Code).
2. Find this line near the top (around line 22):

   ```js
   const APPS_SCRIPT_URL = "PASTE_YOUR_APPS_SCRIPT_URL_HERE";
   ```

3. Replace `PASTE_YOUR_APPS_SCRIPT_URL_HERE` with your real Web App URL from Step 3:

   ```js
   const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxXXX.../exec";
   ```

4. Save the file. Upload it to your hosting (overwrite the old `forms.js`).

**Done.** From now on every form submission goes to:
- Your email inbox (`chat.dsstudio@gmail.com`)
- Your Google Sheet (correct tab automatically — Booking / General / Quote)

---

## How to test it works

1. Visit any of your forms in a browser.
2. Fill in the fields with your own name + email + phone.
3. Click submit.
4. You should see a green success message: *"Thank you! We received your inquiry…"*
5. Check your Gmail (`chat.dsstudio@gmail.com`) — should arrive within ~30 sec.
6. Check the Google Sheet — a new row should appear in the correct tab.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| First submission asks to "verify" — email never arrives | Check spam folder for FormSubmit verification |
| Form shows "Sorry, something went wrong" | Check that you saved + uploaded `forms.js` after editing |
| Email arrives but Sheet stays empty | The Apps Script URL was pasted wrong, OR you didn't choose **"Anyone"** in Step 3.3 |
| Sheet stops working after you change the script | You must **re-deploy** (Deploy → Manage deployments → edit → New version → Deploy) |

---

## Want to add more emails to receive submissions?

In `forms.js`, change line 18 to receive at multiple addresses (FormSubmit forwards):

```js
const TARGET_EMAIL = "chat.dsstudio@gmail.com,owner@digitalstorystudio.in";
```
