# Deployment Guide - FREE Options for Private Repos

## ✅ Cloudflare Pages (RECOMMENDED - FREE for Private Repos)

### Setup:
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Pages** → **Create a project**
3. Connect your **private** Git repository (GitHub/GitLab/Bitbucket)
4. Configure build settings:
   - **Framework preset:** None
   - **Build command:** `npm run build`
   - **Build output directory:** `web-build`
   - **Root directory:** `/` (leave empty)
   - **Node version:** 18 or 20
5. Click **Save and Deploy**

### Features:
- ✅ **FREE** for private repositories
- ✅ Automatic deployments on git push
- ✅ Preview deployments for pull requests
- ✅ Global CDN
- ✅ Custom domains support

---

## Netlify (Paid for Private Repos - $20/month)

If you choose Netlify Pro plan, use the `netlify.toml` configuration file.

### Build Settings:
- **Build command:** `npm run build`
- **Publish directory:** `web-build`

---

## Vercel (Paid for Private Repos - $20/month)

If you choose Vercel Pro plan, use the `vercel.json` configuration file.

### Build Settings:
- **Build command:** `npm run build`
- **Output directory:** `web-build`

---

## Build Commands

All platforms use the same build command:
```bash
npm run build
```

This will:
1. Export the Expo web app to `web-build` directory
2. Copy `_redirects` file for SPA routing support

## Local Testing

Test the build locally:
```bash
npm run build
npx serve web-build
```

Then visit `http://localhost:3000` to test your built app.

## Environment Variables

If your app uses environment variables, add them in the deployment platform's dashboard:
- Cloudflare Pages: Settings → Environment variables
- Netlify: Site settings → Environment variables
- Vercel: Project settings → Environment variables

---

## Summary

| Platform | Private Repo Support | Cost |
|----------|---------------------|------|
| **Cloudflare Pages** | ✅ FREE | $0 |
| Netlify | ❌ Requires Pro | $20/month |
| Vercel | ❌ Requires Pro | $20/month |

**Recommendation:** Use **Cloudflare Pages** for free private repository deployments.

