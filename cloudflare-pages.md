# Cloudflare Pages Deployment (FREE for Private Repos)

## Build Settings:
- **Build command:** `npm run build`
- **Build output directory:** `web-build`
- **Root directory:** `/` (or leave empty)
- **Node version:** 18 or 20

## Environment Variables:
Add any required environment variables in Cloudflare Pages dashboard.

## Deployment Steps:
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to Pages → Create a project
3. Connect your Git repository (supports private repos on FREE tier)
4. Configure:
   - Framework preset: None
   - Build command: `npm run build`
   - Build output directory: `web-build`
5. Click "Save and Deploy"

## SPA Routing:
The `_redirects` file in `web-build` will handle client-side routing automatically.

