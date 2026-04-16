# ZCLAP MDM Estimator — Deployment Guide
# No developer needed. Estimated time: 45–60 minutes.

---

## What you're deploying

A live microsite at estimate.zclap.com that:
- Runs the MDM implementation calculator
- Captures leads through a hard gate
- Emails the prospect a personalised PDF estimate instantly
- Sends your team an internal alert with the full lead profile

---

## Before you start — accounts you need

Create these free accounts if you don't have them already:

1. **Vercel** — vercel.com (free tier is sufficient)
2. **GitHub** — github.com (free, needed to connect to Vercel)
3. **Postmark** — postmarkapp.com (free for first 100 emails/month, then pay-as-you-go)

---

## Step 1 — Set up Postmark (email delivery)

1. Sign up at postmarkapp.com
2. Go to **Servers** → **Create Server** → name it "ZCLAP Estimator"
3. Inside the server, go to **API Tokens** and copy the **Server API Token** — save it, you'll need it shortly
4. Go to **Sender Signatures** → **Add Domain** → enter `zclap.com`
5. Follow the instructions to add the DNS records Postmark provides — this verifies you own the domain and ensures emails don't land in spam. Your domain registrar (e.g. GoDaddy, Cloudflare) is where you add these records. Postmark provides exact copy-paste instructions.

---

## Step 2 — Upload the site files to GitHub

1. Sign in to github.com
2. Click **New repository** (top right, green button)
3. Name it `zclap-estimator`, set it to **Private**, click **Create repository**
4. On the next screen, click **uploading an existing file**
5. Upload ALL files from the `zclap-site` folder you received:
   - `vercel.json`
   - `package.json`
   - `public/index.html`
   - `public/logo.png`
   - `api/submit.js`
6. Click **Commit changes**

---

## Step 3 — Deploy to Vercel

1. Sign in to vercel.com
2. Click **Add New Project**
3. Click **Import Git Repository** and connect your GitHub account when prompted
4. Select the `zclap-estimator` repository
5. Leave all settings as default — Vercel will detect the configuration automatically
6. Click **Deploy**

Vercel will build and deploy the site. After ~60 seconds you'll see a success screen with a temporary URL like `zclap-estimator.vercel.app`. The site is now live at that URL.

---

## Step 4 — Add your environment variables

This is where you connect Postmark and configure the email addresses.

1. In Vercel, go to your project → **Settings** → **Environment Variables**
2. Add each of the following — click **Add** after each one:

| Name | Value |
|------|-------|
| `POSTMARK_SERVER_TOKEN` | The token you copied from Postmark in Step 1 |
| `FROM_EMAIL` | The email address emails will be sent from, e.g. `hello@zclap.com` |
| `FROM_NAME` | The sender name, e.g. your consultant's name or `ZCLAP` |
| `SALES_ALERT_EMAIL` | The internal email address that receives lead alerts |

3. After adding all four, go to **Deployments** → click the three dots on the latest deployment → **Redeploy**

---

## Step 5 — Connect estimate.zclap.com

1. In Vercel, go to your project → **Settings** → **Domains**
2. Type `estimate.zclap.com` and click **Add**
3. Vercel will show you a CNAME record to add. It will look like:

   | Type | Name | Value |
   |------|------|-------|
   | CNAME | estimate | cname.vercel-dns.com |

4. Log in to wherever ZCLAP's domain DNS is managed (ask whoever manages zclap.com — likely GoDaddy, Cloudflare, or similar)
5. Add that CNAME record exactly as shown
6. Back in Vercel, click **Verify** — it may take a few minutes to propagate

Once verified, your site is live at **estimate.zclap.com** with SSL automatically enabled.

---

## Step 6 — Test end-to-end

1. Go to estimate.zclap.com
2. Complete the full calculator with test inputs
3. At the gate, enter a real email address you can check
4. Confirm you receive the prospect email with PDF attached
5. Confirm the internal alert arrives at your sales alert email
6. Check the PDF looks correct

If emails don't arrive, check your Postmark dashboard — the **Activity** tab shows every send attempt and any errors.

---

## You're live. What to do next

- **LinkedIn campaign**: Link all posts and ads to estimate.zclap.com
- **Homepage**: Add a button on zclap.com linking to estimate.zclap.com
- **HubSpot**: When you're ready to connect a CRM, get in touch — the API integration can be added to the submit.js file without changing anything else

---

## Troubleshooting

**Site shows a blank page**
→ Check that all 5 files were uploaded to GitHub in the correct folder structure

**Emails not sending**
→ Check Vercel environment variables are set correctly and you redeployed after adding them
→ Check Postmark Activity log for error details

**PDF not attaching**
→ This is a non-critical failure — the email still sends, just without the attachment. Check Vercel function logs (Project → Functions tab)

**estimate.zclap.com not resolving**
→ DNS propagation can take up to 24 hours, though usually much faster. Check the CNAME record is correctly entered at your DNS provider.

---

## Need help?

If you get stuck on any step, the Vercel and Postmark documentation are both excellent.
Vercel: vercel.com/docs
Postmark: postmarkapp.com/developer
