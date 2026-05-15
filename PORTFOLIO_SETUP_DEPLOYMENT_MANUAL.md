# 🚀 Portfolio Setup, Editing, Deployment, and Operations Manual

> This manual is intentionally long-form and comprehensive so anyone can fork this repository and run it end-to-end without guesswork.

## 📚 Table of Contents (Quick Links)

- [Section 1: What this repository is](#section-1--what-this-repository-is)
- [Section 2: Prerequisites](#section-2--prerequisites)
- [Section 3: Local setup](#section-3--local-setup)
- [Section 4: Environment variables](#section-4--environment-variables)
- [Section 5: How to edit content](#section-5--how-to-edit-content)
- [Section 6: How to edit UI](#section-6--how-to-edit-ui)
- [Section 7: How to edit APIs](#section-7--how-to-edit-apis)
- [Section 8: Deployment strategy](#section-8--deployment-strategy)
- [Section 9: Hosting provider runbooks](#section-9--hosting-provider-runbooks)
- [Section 10: Monitoring and maintenance](#section-10--monitoring-and-maintenance)
- [Section 11: Backup and restore](#section-11--backup-and-restore)
- [Section 12: Troubleshooting matrix](#section-12--troubleshooting-matrix)
- [Section 13: Extended FAQ](#section-13--extended-faq)
- [Section 14: Live page specific notes](#section-14--live-page-specific-notes)
- [Section 15: Final launch checklist](#section-15--final-launch-checklist)

---

## Section 1 — What this repository is

This project is a React + TypeScript + Vite portfolio with API routes under `api/`.
The `/api/live` route powers the live page video feed.
The frontend route `/live` displays stream/video/short tabs with pagination.

## Section 2 — Prerequisites

1. Node.js 20+ (or latest LTS).
2. npm 9+.
3. A GitHub account.
4. Optional: MongoDB Atlas for CMS-backed features.
5. Optional: YouTube API key for richer stats/comments in live page.

## Section 3 — Local Setup

1. Clone repository.
2. Run `npm ci`.
3. Run `npm run dev`.
4. Run `npm run lint`.
5. Run `npm run build`.

## Section 4 — Environment Variables

Create `.env.local` for local testing.
Never commit secrets.

Required for full features:
- `MONGODB_URI`
- `SPACE_PASSWORD`

Optional for live page enrichment:
- `YOUTUBE_API_KEY` (or `GOOGLE_API_KEY`)
- Without key: live page still loads via web+RSS fallback.

### Section 4.1 — 🔎 Where to Find Each API Key / ENV Value

Use this table when you are setting up your own copy of the project.

| ENV variable | Required? | Where to find it | Example format | Where to set it |
| :--- | :---: | :--- | :--- | :--- |
| `MONGODB_URI` | Yes (for CMS/dynamic data) | MongoDB Atlas dashboard → **Database** → **Connect** → **Drivers** | `mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/portfolio` | Local: `.env.local` · Hosting: project environment variables |
| `SPACE_PASSWORD` | Yes (for image upload proxy) | Your storage/CDN provider account secret used by `/api/upload-image` (in this project: static.qlynk upload secret) | `your_space_password_here` | Local: `.env.local` · Hosting: project environment variables |
| `GOOGLE_CLIENT_ID` | Optional (recommended for stricter token audience checks) | Google Cloud Console → **APIs & Services** → **Credentials** → OAuth 2.0 Client ID | `1234567890-abc123xyz.apps.googleusercontent.com` | Local: `.env.local` · Hosting: project environment variables |
| `YOUTUBE_API_KEY` (or `GOOGLE_API_KEY`) | Optional | Google Cloud Console → **APIs & Services** → **Credentials** → API key | `AIza...` | Local: `.env.local` · Hosting: project environment variables |

### Section 4.2 — 🎥 How to Create YouTube API Key (Optional)

1. Go to Google Cloud Console.
2. Create a project (or select an existing one).
3. Open **APIs & Services** → **Library**.
4. Search and enable **YouTube Data API v3**.
5. Open **APIs & Services** → **Credentials**.
6. Click **Create Credentials** → **API key**.
7. Copy the generated key and add it as `YOUTUBE_API_KEY` (or `GOOGLE_API_KEY`).
8. (Recommended) Restrict the key by API and by allowed usage settings.

### Section 4.3 — 🧪 Copy/Paste `.env.local` Template

```env
# Required for dynamic CMS features
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/portfolio
SPACE_PASSWORD=your_space_password_here

# Optional but recommended
GOOGLE_CLIENT_ID=your_google_oauth_client_id

# Optional: richer YouTube stats/comments for /live
YOUTUBE_API_KEY=your_youtube_data_api_v3_key
# OR
# GOOGLE_API_KEY=your_youtube_data_api_v3_key
```

### Section 4.4 — ✅ Exactly What to Write for YouTube API in `.env.local`

Copy one of these exact lines and replace only the key value:

```env
YOUTUBE_API_KEY=AIzaSy-your-real-youtube-data-api-v3-key
```

or

```env
GOOGLE_API_KEY=AIzaSy-your-real-youtube-data-api-v3-key
```

> Tip: use only one of the two variable names, not both.

## Section 5 — How to Edit Content

Edit static content files:
- `src/data/projectsData.ts`
- `src/data/linksData.ts`
- `src/data/faqData.ts`
- `src/data/timelineData.ts`
- `src/data/nowData.ts`

Edit branding/media:
- `public/assets/images/*`
- `public/assets/docs/*`

## Section 6 — How to Edit UI

Key route files:
- `src/pages/Home.tsx`
- `src/pages/About.tsx`
- `src/pages/Live.tsx`
- `src/pages/Dashboard.tsx`

Global components:
- `src/components/Header.tsx`
- `src/components/Footer.tsx`
- `src/components/SEO.tsx` — injects per-route `<head>` tags via `react-helmet-async`:
  - Open Graph: `og:type`, `og:url`, `og:title`, `og:description`, `og:image`, `og:image:alt`, `og:site_name`, `og:locale`
  - Twitter Card: `twitter:card`, `twitter:url`, `twitter:title`, `twitter:description`, `twitter:image`, `twitter:image:alt`
  - JSON-LD structured data (optional `schema` prop)
  - Use this component in every page for correct social-preview metadata.
- `index.html` — static baseline with the same complete OG + Twitter Card tag set for crawlers that read the shell before JS runs. Update here when changing global site name, domain, or default share image.

## Section 7 — How to Edit APIs

API files are in `/api`.
For live page logic, use:
- `api/live.js`

Validation after API edits:
1. `npm run lint`
2. `npm run build`

## Section 8 — Deployment Strategy

Deployment patterns:
- Static hosting + external API service
- Full-stack platform with serverless functions
- Containerized deployment

Preferred path for this repository: Vercel.

## Section 9 — Hosting Provider Runbooks

Each provider below includes account setup, project linking, build configuration, environment variables, custom domain, and rollback notes.

### Provider 1: Vercel

**When to choose Vercel:** Best fit for this repository (native serverless `/api/*`).

#### A. Prepare Repository
1. Fork this repository.
2. Update branding/content files.
3. Commit and push to your branch.
4. Ensure `npm run lint` and `npm run build` pass locally.

#### B. Create Project
1. Sign in to Vercel dashboard.
2. Create a new app/site/project.
3. Connect Git provider and select repository.
4. Select the default branch for production.
5. Enable preview deployments for pull requests if available.

#### C. Build and Runtime Settings
1. Build command: `npm run build`.
2. Output directory: `dist` for static hosts.
3. Node version: 20+.
4. Install command: `npm ci`.
5. For serverless routes, ensure `/api` routing is configured.

#### D. Environment Variables
Add these in provider secret manager:
- `MONGODB_URI`
- `SPACE_PASSWORD`
- `GOOGLE_CLIENT_ID` (optional)
- `YOUTUBE_API_KEY` (optional; richer YouTube stats/comments)

#### E. Routing and Rewrites
1. SPA fallback to `index.html` for client routes.
2. Preserve `/api/*` as backend route when supported.
3. Confirm `/live`, `/journal`, `/status` all resolve on refresh.

#### F. Domain and SSL
1. Add custom domain.
2. Configure DNS records exactly as provider instructs.
3. Enforce HTTPS.
4. Verify SSL certificate issuance.

#### G. Post-deploy Verification
1. Open homepage and major routes.
2. Test `/api/live` and `/live` page loading.
3. Validate forms and dashboard auth if enabled.
4. Re-run lighthouse/performance checks.

#### H. Rollback Plan
1. Keep last known good deployment tagged.
2. Use provider rollback/restore control.
3. Re-check environment variables after rollback.
4. Record incident notes in your project changelog.

### Provider 2: Netlify

**When to choose Netlify:** Good for static + serverless functions with routing adjustments.

#### A. Prepare Repository
1. Fork this repository.
2. Update branding/content files.
3. Commit and push to your branch.
4. Ensure `npm run lint` and `npm run build` pass locally.

#### B. Create Project
1. Sign in to Netlify dashboard.
2. Create a new app/site/project.
3. Connect Git provider and select repository.
4. Select the default branch for production.
5. Enable preview deployments for pull requests if available.

#### C. Build and Runtime Settings
1. Build command: `npm run build`.
2. Output directory: `dist` for static hosts.
3. Node version: 20+.
4. Install command: `npm ci`.
5. For serverless routes, ensure `/api` routing is configured.

#### D. Environment Variables
Add these in provider secret manager:
- `MONGODB_URI`
- `SPACE_PASSWORD`
- `GOOGLE_CLIENT_ID` (optional)
- `YOUTUBE_API_KEY` (optional; richer YouTube stats/comments)

#### E. Routing and Rewrites
1. SPA fallback to `index.html` for client routes.
2. Preserve `/api/*` as backend route when supported.
3. Confirm `/live`, `/journal`, `/status` all resolve on refresh.

#### F. Domain and SSL
1. Add custom domain.
2. Configure DNS records exactly as provider instructs.
3. Enforce HTTPS.
4. Verify SSL certificate issuance.

#### G. Post-deploy Verification
1. Open homepage and major routes.
2. Test `/api/live` and `/live` page loading.
3. Validate forms and dashboard auth if enabled.
4. Re-run lighthouse/performance checks.

#### H. Rollback Plan
1. Keep last known good deployment tagged.
2. Use provider rollback/restore control.
3. Re-check environment variables after rollback.
4. Record incident notes in your project changelog.

### Provider 3: Cloudflare Pages

**When to choose Cloudflare Pages:** Fast global edge hosting with Workers integration.

#### A. Prepare Repository
1. Fork this repository.
2. Update branding/content files.
3. Commit and push to your branch.
4. Ensure `npm run lint` and `npm run build` pass locally.

#### B. Create Project
1. Sign in to Cloudflare Pages dashboard.
2. Create a new app/site/project.
3. Connect Git provider and select repository.
4. Select the default branch for production.
5. Enable preview deployments for pull requests if available.

#### C. Build and Runtime Settings
1. Build command: `npm run build`.
2. Output directory: `dist` for static hosts.
3. Node version: 20+.
4. Install command: `npm ci`.
5. For serverless routes, ensure `/api` routing is configured.

#### D. Environment Variables
Add these in provider secret manager:
- `MONGODB_URI`
- `SPACE_PASSWORD`
- `GOOGLE_CLIENT_ID` (optional)
- `YOUTUBE_API_KEY` (optional; richer YouTube stats/comments)

#### E. Routing and Rewrites
1. SPA fallback to `index.html` for client routes.
2. Preserve `/api/*` as backend route when supported.
3. Confirm `/live`, `/journal`, `/status` all resolve on refresh.

#### F. Domain and SSL
1. Add custom domain.
2. Configure DNS records exactly as provider instructs.
3. Enforce HTTPS.
4. Verify SSL certificate issuance.

#### G. Post-deploy Verification
1. Open homepage and major routes.
2. Test `/api/live` and `/live` page loading.
3. Validate forms and dashboard auth if enabled.
4. Re-run lighthouse/performance checks.

#### H. Rollback Plan
1. Keep last known good deployment tagged.
2. Use provider rollback/restore control.
3. Re-check environment variables after rollback.
4. Record incident notes in your project changelog.

### Provider 4: GitHub Pages

**When to choose GitHub Pages:** Static-only hosting; use separate backend for APIs.

#### A. Prepare Repository
1. Fork this repository.
2. Update branding/content files.
3. Commit and push to your branch.
4. Ensure `npm run lint` and `npm run build` pass locally.

#### B. Create Project
1. Sign in to GitHub Pages dashboard.
2. Create a new app/site/project.
3. Connect Git provider and select repository.
4. Select the default branch for production.
5. Enable preview deployments for pull requests if available.

#### C. Build and Runtime Settings
1. Build command: `npm run build`.
2. Output directory: `dist` for static hosts.
3. Node version: 20+.
4. Install command: `npm ci`.
5. For serverless routes, ensure `/api` routing is configured.

#### D. Environment Variables
Add these in provider secret manager:
- `MONGODB_URI`
- `SPACE_PASSWORD`
- `GOOGLE_CLIENT_ID` (optional)
- `YOUTUBE_API_KEY` (optional; richer YouTube stats/comments)

#### E. Routing and Rewrites
1. SPA fallback to `index.html` for client routes.
2. Preserve `/api/*` as backend route when supported.
3. Confirm `/live`, `/journal`, `/status` all resolve on refresh.

#### F. Domain and SSL
1. Add custom domain.
2. Configure DNS records exactly as provider instructs.
3. Enforce HTTPS.
4. Verify SSL certificate issuance.

#### G. Post-deploy Verification
1. Open homepage and major routes.
2. Test `/api/live` and `/live` page loading.
3. Validate forms and dashboard auth if enabled.
4. Re-run lighthouse/performance checks.

#### H. Rollback Plan
1. Keep last known good deployment tagged.
2. Use provider rollback/restore control.
3. Re-check environment variables after rollback.
4. Record incident notes in your project changelog.

### Provider 5: GitLab Pages

**When to choose GitLab Pages:** Static hosting via GitLab CI.

#### A. Prepare Repository
1. Fork this repository.
2. Update branding/content files.
3. Commit and push to your branch.
4. Ensure `npm run lint` and `npm run build` pass locally.

#### B. Create Project
1. Sign in to GitLab Pages dashboard.
2. Create a new app/site/project.
3. Connect Git provider and select repository.
4. Select the default branch for production.
5. Enable preview deployments for pull requests if available.

#### C. Build and Runtime Settings
1. Build command: `npm run build`.
2. Output directory: `dist` for static hosts.
3. Node version: 20+.
4. Install command: `npm ci`.
5. For serverless routes, ensure `/api` routing is configured.

#### D. Environment Variables
Add these in provider secret manager:
- `MONGODB_URI`
- `SPACE_PASSWORD`
- `GOOGLE_CLIENT_ID` (optional)
- `YOUTUBE_API_KEY` (optional; richer YouTube stats/comments)

#### E. Routing and Rewrites
1. SPA fallback to `index.html` for client routes.
2. Preserve `/api/*` as backend route when supported.
3. Confirm `/live`, `/journal`, `/status` all resolve on refresh.

#### F. Domain and SSL
1. Add custom domain.
2. Configure DNS records exactly as provider instructs.
3. Enforce HTTPS.
4. Verify SSL certificate issuance.

#### G. Post-deploy Verification
1. Open homepage and major routes.
2. Test `/api/live` and `/live` page loading.
3. Validate forms and dashboard auth if enabled.
4. Re-run lighthouse/performance checks.

#### H. Rollback Plan
1. Keep last known good deployment tagged.
2. Use provider rollback/restore control.
3. Re-check environment variables after rollback.
4. Record incident notes in your project changelog.

### Provider 6: AWS Amplify

**When to choose AWS Amplify:** Managed frontend hosting with branch previews.

#### A. Prepare Repository
1. Fork this repository.
2. Update branding/content files.
3. Commit and push to your branch.
4. Ensure `npm run lint` and `npm run build` pass locally.

#### B. Create Project
1. Sign in to AWS Amplify dashboard.
2. Create a new app/site/project.
3. Connect Git provider and select repository.
4. Select the default branch for production.
5. Enable preview deployments for pull requests if available.

#### C. Build and Runtime Settings
1. Build command: `npm run build`.
2. Output directory: `dist` for static hosts.
3. Node version: 20+.
4. Install command: `npm ci`.
5. For serverless routes, ensure `/api` routing is configured.

#### D. Environment Variables
Add these in provider secret manager:
- `MONGODB_URI`
- `SPACE_PASSWORD`
- `GOOGLE_CLIENT_ID` (optional)
- `YOUTUBE_API_KEY` (optional; richer YouTube stats/comments)

#### E. Routing and Rewrites
1. SPA fallback to `index.html` for client routes.
2. Preserve `/api/*` as backend route when supported.
3. Confirm `/live`, `/journal`, `/status` all resolve on refresh.

#### F. Domain and SSL
1. Add custom domain.
2. Configure DNS records exactly as provider instructs.
3. Enforce HTTPS.
4. Verify SSL certificate issuance.

#### G. Post-deploy Verification
1. Open homepage and major routes.
2. Test `/api/live` and `/live` page loading.
3. Validate forms and dashboard auth if enabled.
4. Re-run lighthouse/performance checks.

#### H. Rollback Plan
1. Keep last known good deployment tagged.
2. Use provider rollback/restore control.
3. Re-check environment variables after rollback.
4. Record incident notes in your project changelog.

### Provider 7: AWS S3 + CloudFront

**When to choose AWS S3 + CloudFront:** Static hosting with CDN and custom domains.

#### A. Prepare Repository
1. Fork this repository.
2. Update branding/content files.
3. Commit and push to your branch.
4. Ensure `npm run lint` and `npm run build` pass locally.

#### B. Create Project
1. Sign in to AWS S3 + CloudFront dashboard.
2. Create a new app/site/project.
3. Connect Git provider and select repository.
4. Select the default branch for production.
5. Enable preview deployments for pull requests if available.

#### C. Build and Runtime Settings
1. Build command: `npm run build`.
2. Output directory: `dist` for static hosts.
3. Node version: 20+.
4. Install command: `npm ci`.
5. For serverless routes, ensure `/api` routing is configured.

#### D. Environment Variables
Add these in provider secret manager:
- `MONGODB_URI`
- `SPACE_PASSWORD`
- `GOOGLE_CLIENT_ID` (optional)
- `YOUTUBE_API_KEY` (optional; richer YouTube stats/comments)

#### E. Routing and Rewrites
1. SPA fallback to `index.html` for client routes.
2. Preserve `/api/*` as backend route when supported.
3. Confirm `/live`, `/journal`, `/status` all resolve on refresh.

#### F. Domain and SSL
1. Add custom domain.
2. Configure DNS records exactly as provider instructs.
3. Enforce HTTPS.
4. Verify SSL certificate issuance.

#### G. Post-deploy Verification
1. Open homepage and major routes.
2. Test `/api/live` and `/live` page loading.
3. Validate forms and dashboard auth if enabled.
4. Re-run lighthouse/performance checks.

#### H. Rollback Plan
1. Keep last known good deployment tagged.
2. Use provider rollback/restore control.
3. Re-check environment variables after rollback.
4. Record incident notes in your project changelog.

### Provider 8: AWS Elastic Beanstalk

**When to choose AWS Elastic Beanstalk:** Full Node app deployment option.

#### A. Prepare Repository
1. Fork this repository.
2. Update branding/content files.
3. Commit and push to your branch.
4. Ensure `npm run lint` and `npm run build` pass locally.

#### B. Create Project
1. Sign in to AWS Elastic Beanstalk dashboard.
2. Create a new app/site/project.
3. Connect Git provider and select repository.
4. Select the default branch for production.
5. Enable preview deployments for pull requests if available.

#### C. Build and Runtime Settings
1. Build command: `npm run build`.
2. Output directory: `dist` for static hosts.
3. Node version: 20+.
4. Install command: `npm ci`.
5. For serverless routes, ensure `/api` routing is configured.

#### D. Environment Variables
Add these in provider secret manager:
- `MONGODB_URI`
- `SPACE_PASSWORD`
- `GOOGLE_CLIENT_ID` (optional)
- `YOUTUBE_API_KEY` (optional; richer YouTube stats/comments)

#### E. Routing and Rewrites
1. SPA fallback to `index.html` for client routes.
2. Preserve `/api/*` as backend route when supported.
3. Confirm `/live`, `/journal`, `/status` all resolve on refresh.

#### F. Domain and SSL
1. Add custom domain.
2. Configure DNS records exactly as provider instructs.
3. Enforce HTTPS.
4. Verify SSL certificate issuance.

#### G. Post-deploy Verification
1. Open homepage and major routes.
2. Test `/api/live` and `/live` page loading.
3. Validate forms and dashboard auth if enabled.
4. Re-run lighthouse/performance checks.

#### H. Rollback Plan
1. Keep last known good deployment tagged.
2. Use provider rollback/restore control.
3. Re-check environment variables after rollback.
4. Record incident notes in your project changelog.

### Provider 9: Google Firebase Hosting

**When to choose Google Firebase Hosting:** Global CDN static hosting with optional Functions backend.

#### A. Prepare Repository
1. Fork this repository.
2. Update branding/content files.
3. Commit and push to your branch.
4. Ensure `npm run lint` and `npm run build` pass locally.

#### B. Create Project
1. Sign in to Google Firebase Hosting dashboard.
2. Create a new app/site/project.
3. Connect Git provider and select repository.
4. Select the default branch for production.
5. Enable preview deployments for pull requests if available.

#### C. Build and Runtime Settings
1. Build command: `npm run build`.
2. Output directory: `dist` for static hosts.
3. Node version: 20+.
4. Install command: `npm ci`.
5. For serverless routes, ensure `/api` routing is configured.

#### D. Environment Variables
Add these in provider secret manager:
- `MONGODB_URI`
- `SPACE_PASSWORD`
- `GOOGLE_CLIENT_ID` (optional)
- `YOUTUBE_API_KEY` (optional; richer YouTube stats/comments)

#### E. Routing and Rewrites
1. SPA fallback to `index.html` for client routes.
2. Preserve `/api/*` as backend route when supported.
3. Confirm `/live`, `/journal`, `/status` all resolve on refresh.

#### F. Domain and SSL
1. Add custom domain.
2. Configure DNS records exactly as provider instructs.
3. Enforce HTTPS.
4. Verify SSL certificate issuance.

#### G. Post-deploy Verification
1. Open homepage and major routes.
2. Test `/api/live` and `/live` page loading.
3. Validate forms and dashboard auth if enabled.
4. Re-run lighthouse/performance checks.

#### H. Rollback Plan
1. Keep last known good deployment tagged.
2. Use provider rollback/restore control.
3. Re-check environment variables after rollback.
4. Record incident notes in your project changelog.

### Provider 10: Google Cloud Run

**When to choose Google Cloud Run:** Containerized full-stack deployment path.

#### A. Prepare Repository
1. Fork this repository.
2. Update branding/content files.
3. Commit and push to your branch.
4. Ensure `npm run lint` and `npm run build` pass locally.

#### B. Create Project
1. Sign in to Google Cloud Run dashboard.
2. Create a new app/site/project.
3. Connect Git provider and select repository.
4. Select the default branch for production.
5. Enable preview deployments for pull requests if available.

#### C. Build and Runtime Settings
1. Build command: `npm run build`.
2. Output directory: `dist` for static hosts.
3. Node version: 20+.
4. Install command: `npm ci`.
5. For serverless routes, ensure `/api` routing is configured.

#### D. Environment Variables
Add these in provider secret manager:
- `MONGODB_URI`
- `SPACE_PASSWORD`
- `GOOGLE_CLIENT_ID` (optional)
- `YOUTUBE_API_KEY` (optional; richer YouTube stats/comments)

#### E. Routing and Rewrites
1. SPA fallback to `index.html` for client routes.
2. Preserve `/api/*` as backend route when supported.
3. Confirm `/live`, `/journal`, `/status` all resolve on refresh.

#### F. Domain and SSL
1. Add custom domain.
2. Configure DNS records exactly as provider instructs.
3. Enforce HTTPS.
4. Verify SSL certificate issuance.

#### G. Post-deploy Verification
1. Open homepage and major routes.
2. Test `/api/live` and `/live` page loading.
3. Validate forms and dashboard auth if enabled.
4. Re-run lighthouse/performance checks.

#### H. Rollback Plan
1. Keep last known good deployment tagged.
2. Use provider rollback/restore control.
3. Re-check environment variables after rollback.
4. Record incident notes in your project changelog.

### Provider 11: Azure Static Web Apps

**When to choose Azure Static Web Apps:** Static + serverless Azure Functions workflow.

#### A. Prepare Repository
1. Fork this repository.
2. Update branding/content files.
3. Commit and push to your branch.
4. Ensure `npm run lint` and `npm run build` pass locally.

#### B. Create Project
1. Sign in to Azure Static Web Apps dashboard.
2. Create a new app/site/project.
3. Connect Git provider and select repository.
4. Select the default branch for production.
5. Enable preview deployments for pull requests if available.

#### C. Build and Runtime Settings
1. Build command: `npm run build`.
2. Output directory: `dist` for static hosts.
3. Node version: 20+.
4. Install command: `npm ci`.
5. For serverless routes, ensure `/api` routing is configured.

#### D. Environment Variables
Add these in provider secret manager:
- `MONGODB_URI`
- `SPACE_PASSWORD`
- `GOOGLE_CLIENT_ID` (optional)
- `YOUTUBE_API_KEY` (optional; richer YouTube stats/comments)

#### E. Routing and Rewrites
1. SPA fallback to `index.html` for client routes.
2. Preserve `/api/*` as backend route when supported.
3. Confirm `/live`, `/journal`, `/status` all resolve on refresh.

#### F. Domain and SSL
1. Add custom domain.
2. Configure DNS records exactly as provider instructs.
3. Enforce HTTPS.
4. Verify SSL certificate issuance.

#### G. Post-deploy Verification
1. Open homepage and major routes.
2. Test `/api/live` and `/live` page loading.
3. Validate forms and dashboard auth if enabled.
4. Re-run lighthouse/performance checks.

#### H. Rollback Plan
1. Keep last known good deployment tagged.
2. Use provider rollback/restore control.
3. Re-check environment variables after rollback.
4. Record incident notes in your project changelog.

### Provider 12: Azure App Service

**When to choose Azure App Service:** Managed Node hosting with deployment slots.

#### A. Prepare Repository
1. Fork this repository.
2. Update branding/content files.
3. Commit and push to your branch.
4. Ensure `npm run lint` and `npm run build` pass locally.

#### B. Create Project
1. Sign in to Azure App Service dashboard.
2. Create a new app/site/project.
3. Connect Git provider and select repository.
4. Select the default branch for production.
5. Enable preview deployments for pull requests if available.

#### C. Build and Runtime Settings
1. Build command: `npm run build`.
2. Output directory: `dist` for static hosts.
3. Node version: 20+.
4. Install command: `npm ci`.
5. For serverless routes, ensure `/api` routing is configured.

#### D. Environment Variables
Add these in provider secret manager:
- `MONGODB_URI`
- `SPACE_PASSWORD`
- `GOOGLE_CLIENT_ID` (optional)
- `YOUTUBE_API_KEY` (optional; richer YouTube stats/comments)

#### E. Routing and Rewrites
1. SPA fallback to `index.html` for client routes.
2. Preserve `/api/*` as backend route when supported.
3. Confirm `/live`, `/journal`, `/status` all resolve on refresh.

#### F. Domain and SSL
1. Add custom domain.
2. Configure DNS records exactly as provider instructs.
3. Enforce HTTPS.
4. Verify SSL certificate issuance.

#### G. Post-deploy Verification
1. Open homepage and major routes.
2. Test `/api/live` and `/live` page loading.
3. Validate forms and dashboard auth if enabled.
4. Re-run lighthouse/performance checks.

#### H. Rollback Plan
1. Keep last known good deployment tagged.
2. Use provider rollback/restore control.
3. Re-check environment variables after rollback.
4. Record incident notes in your project changelog.

### Provider 13: DigitalOcean App Platform

**When to choose DigitalOcean App Platform:** Simple full-stack deployment from Git.

#### A. Prepare Repository
1. Fork this repository.
2. Update branding/content files.
3. Commit and push to your branch.
4. Ensure `npm run lint` and `npm run build` pass locally.

#### B. Create Project
1. Sign in to DigitalOcean App Platform dashboard.
2. Create a new app/site/project.
3. Connect Git provider and select repository.
4. Select the default branch for production.
5. Enable preview deployments for pull requests if available.

#### C. Build and Runtime Settings
1. Build command: `npm run build`.
2. Output directory: `dist` for static hosts.
3. Node version: 20+.
4. Install command: `npm ci`.
5. For serverless routes, ensure `/api` routing is configured.

#### D. Environment Variables
Add these in provider secret manager:
- `MONGODB_URI`
- `SPACE_PASSWORD`
- `GOOGLE_CLIENT_ID` (optional)
- `YOUTUBE_API_KEY` (optional; richer YouTube stats/comments)

#### E. Routing and Rewrites
1. SPA fallback to `index.html` for client routes.
2. Preserve `/api/*` as backend route when supported.
3. Confirm `/live`, `/journal`, `/status` all resolve on refresh.

#### F. Domain and SSL
1. Add custom domain.
2. Configure DNS records exactly as provider instructs.
3. Enforce HTTPS.
4. Verify SSL certificate issuance.

#### G. Post-deploy Verification
1. Open homepage and major routes.
2. Test `/api/live` and `/live` page loading.
3. Validate forms and dashboard auth if enabled.
4. Re-run lighthouse/performance checks.

#### H. Rollback Plan
1. Keep last known good deployment tagged.
2. Use provider rollback/restore control.
3. Re-check environment variables after rollback.
4. Record incident notes in your project changelog.

### Provider 14: Render

**When to choose Render:** Managed static and web services with environment UI.

#### A. Prepare Repository
1. Fork this repository.
2. Update branding/content files.
3. Commit and push to your branch.
4. Ensure `npm run lint` and `npm run build` pass locally.

#### B. Create Project
1. Sign in to Render dashboard.
2. Create a new app/site/project.
3. Connect Git provider and select repository.
4. Select the default branch for production.
5. Enable preview deployments for pull requests if available.

#### C. Build and Runtime Settings
1. Build command: `npm run build`.
2. Output directory: `dist` for static hosts.
3. Node version: 20+.
4. Install command: `npm ci`.
5. For serverless routes, ensure `/api` routing is configured.

#### D. Environment Variables
Add these in provider secret manager:
- `MONGODB_URI`
- `SPACE_PASSWORD`
- `GOOGLE_CLIENT_ID` (optional)
- `YOUTUBE_API_KEY` (optional; richer YouTube stats/comments)

#### E. Routing and Rewrites
1. SPA fallback to `index.html` for client routes.
2. Preserve `/api/*` as backend route when supported.
3. Confirm `/live`, `/journal`, `/status` all resolve on refresh.

#### F. Domain and SSL
1. Add custom domain.
2. Configure DNS records exactly as provider instructs.
3. Enforce HTTPS.
4. Verify SSL certificate issuance.

#### G. Post-deploy Verification
1. Open homepage and major routes.
2. Test `/api/live` and `/live` page loading.
3. Validate forms and dashboard auth if enabled.
4. Re-run lighthouse/performance checks.

#### H. Rollback Plan
1. Keep last known good deployment tagged.
2. Use provider rollback/restore control.
3. Re-check environment variables after rollback.
4. Record incident notes in your project changelog.

### Provider 15: Railway

**When to choose Railway:** Developer-friendly full-stack deployment with secrets manager.

#### A. Prepare Repository
1. Fork this repository.
2. Update branding/content files.
3. Commit and push to your branch.
4. Ensure `npm run lint` and `npm run build` pass locally.

#### B. Create Project
1. Sign in to Railway dashboard.
2. Create a new app/site/project.
3. Connect Git provider and select repository.
4. Select the default branch for production.
5. Enable preview deployments for pull requests if available.

#### C. Build and Runtime Settings
1. Build command: `npm run build`.
2. Output directory: `dist` for static hosts.
3. Node version: 20+.
4. Install command: `npm ci`.
5. For serverless routes, ensure `/api` routing is configured.

#### D. Environment Variables
Add these in provider secret manager:
- `MONGODB_URI`
- `SPACE_PASSWORD`
- `GOOGLE_CLIENT_ID` (optional)
- `YOUTUBE_API_KEY` (optional; richer YouTube stats/comments)

#### E. Routing and Rewrites
1. SPA fallback to `index.html` for client routes.
2. Preserve `/api/*` as backend route when supported.
3. Confirm `/live`, `/journal`, `/status` all resolve on refresh.

#### F. Domain and SSL
1. Add custom domain.
2. Configure DNS records exactly as provider instructs.
3. Enforce HTTPS.
4. Verify SSL certificate issuance.

#### G. Post-deploy Verification
1. Open homepage and major routes.
2. Test `/api/live` and `/live` page loading.
3. Validate forms and dashboard auth if enabled.
4. Re-run lighthouse/performance checks.

#### H. Rollback Plan
1. Keep last known good deployment tagged.
2. Use provider rollback/restore control.
3. Re-check environment variables after rollback.
4. Record incident notes in your project changelog.

### Provider 16: Fly.io

**When to choose Fly.io:** Global app hosting via containers.

#### A. Prepare Repository
1. Fork this repository.
2. Update branding/content files.
3. Commit and push to your branch.
4. Ensure `npm run lint` and `npm run build` pass locally.

#### B. Create Project
1. Sign in to Fly.io dashboard.
2. Create a new app/site/project.
3. Connect Git provider and select repository.
4. Select the default branch for production.
5. Enable preview deployments for pull requests if available.

#### C. Build and Runtime Settings
1. Build command: `npm run build`.
2. Output directory: `dist` for static hosts.
3. Node version: 20+.
4. Install command: `npm ci`.
5. For serverless routes, ensure `/api` routing is configured.

#### D. Environment Variables
Add these in provider secret manager:
- `MONGODB_URI`
- `SPACE_PASSWORD`
- `GOOGLE_CLIENT_ID` (optional)
- `YOUTUBE_API_KEY` (optional; richer YouTube stats/comments)

#### E. Routing and Rewrites
1. SPA fallback to `index.html` for client routes.
2. Preserve `/api/*` as backend route when supported.
3. Confirm `/live`, `/journal`, `/status` all resolve on refresh.

#### F. Domain and SSL
1. Add custom domain.
2. Configure DNS records exactly as provider instructs.
3. Enforce HTTPS.
4. Verify SSL certificate issuance.

#### G. Post-deploy Verification
1. Open homepage and major routes.
2. Test `/api/live` and `/live` page loading.
3. Validate forms and dashboard auth if enabled.
4. Re-run lighthouse/performance checks.

#### H. Rollback Plan
1. Keep last known good deployment tagged.
2. Use provider rollback/restore control.
3. Re-check environment variables after rollback.
4. Record incident notes in your project changelog.

### Provider 17: Koyeb

**When to choose Koyeb:** Container and Git deployment with global edge routing.

#### A. Prepare Repository
1. Fork this repository.
2. Update branding/content files.
3. Commit and push to your branch.
4. Ensure `npm run lint` and `npm run build` pass locally.

#### B. Create Project
1. Sign in to Koyeb dashboard.
2. Create a new app/site/project.
3. Connect Git provider and select repository.
4. Select the default branch for production.
5. Enable preview deployments for pull requests if available.

#### C. Build and Runtime Settings
1. Build command: `npm run build`.
2. Output directory: `dist` for static hosts.
3. Node version: 20+.
4. Install command: `npm ci`.
5. For serverless routes, ensure `/api` routing is configured.

#### D. Environment Variables
Add these in provider secret manager:
- `MONGODB_URI`
- `SPACE_PASSWORD`
- `GOOGLE_CLIENT_ID` (optional)
- `YOUTUBE_API_KEY` (optional; richer YouTube stats/comments)

#### E. Routing and Rewrites
1. SPA fallback to `index.html` for client routes.
2. Preserve `/api/*` as backend route when supported.
3. Confirm `/live`, `/journal`, `/status` all resolve on refresh.

#### F. Domain and SSL
1. Add custom domain.
2. Configure DNS records exactly as provider instructs.
3. Enforce HTTPS.
4. Verify SSL certificate issuance.

#### G. Post-deploy Verification
1. Open homepage and major routes.
2. Test `/api/live` and `/live` page loading.
3. Validate forms and dashboard auth if enabled.
4. Re-run lighthouse/performance checks.

#### H. Rollback Plan
1. Keep last known good deployment tagged.
2. Use provider rollback/restore control.
3. Re-check environment variables after rollback.
4. Record incident notes in your project changelog.

### Provider 18: Heroku

**When to choose Heroku:** Classic PaaS deployment using buildpacks.

#### A. Prepare Repository
1. Fork this repository.
2. Update branding/content files.
3. Commit and push to your branch.
4. Ensure `npm run lint` and `npm run build` pass locally.

#### B. Create Project
1. Sign in to Heroku dashboard.
2. Create a new app/site/project.
3. Connect Git provider and select repository.
4. Select the default branch for production.
5. Enable preview deployments for pull requests if available.

#### C. Build and Runtime Settings
1. Build command: `npm run build`.
2. Output directory: `dist` for static hosts.
3. Node version: 20+.
4. Install command: `npm ci`.
5. For serverless routes, ensure `/api` routing is configured.

#### D. Environment Variables
Add these in provider secret manager:
- `MONGODB_URI`
- `SPACE_PASSWORD`
- `GOOGLE_CLIENT_ID` (optional)
- `YOUTUBE_API_KEY` (optional; richer YouTube stats/comments)

#### E. Routing and Rewrites
1. SPA fallback to `index.html` for client routes.
2. Preserve `/api/*` as backend route when supported.
3. Confirm `/live`, `/journal`, `/status` all resolve on refresh.

#### F. Domain and SSL
1. Add custom domain.
2. Configure DNS records exactly as provider instructs.
3. Enforce HTTPS.
4. Verify SSL certificate issuance.

#### G. Post-deploy Verification
1. Open homepage and major routes.
2. Test `/api/live` and `/live` page loading.
3. Validate forms and dashboard auth if enabled.
4. Re-run lighthouse/performance checks.

#### H. Rollback Plan
1. Keep last known good deployment tagged.
2. Use provider rollback/restore control.
3. Re-check environment variables after rollback.
4. Record incident notes in your project changelog.

### Provider 19: Surge

**When to choose Surge:** Fast static site publishing.

#### A. Prepare Repository
1. Fork this repository.
2. Update branding/content files.
3. Commit and push to your branch.
4. Ensure `npm run lint` and `npm run build` pass locally.

#### B. Create Project
1. Sign in to Surge dashboard.
2. Create a new app/site/project.
3. Connect Git provider and select repository.
4. Select the default branch for production.
5. Enable preview deployments for pull requests if available.

#### C. Build and Runtime Settings
1. Build command: `npm run build`.
2. Output directory: `dist` for static hosts.
3. Node version: 20+.
4. Install command: `npm ci`.
5. For serverless routes, ensure `/api` routing is configured.

#### D. Environment Variables
Add these in provider secret manager:
- `MONGODB_URI`
- `SPACE_PASSWORD`
- `GOOGLE_CLIENT_ID` (optional)
- `YOUTUBE_API_KEY` (optional; richer YouTube stats/comments)

#### E. Routing and Rewrites
1. SPA fallback to `index.html` for client routes.
2. Preserve `/api/*` as backend route when supported.
3. Confirm `/live`, `/journal`, `/status` all resolve on refresh.

#### F. Domain and SSL
1. Add custom domain.
2. Configure DNS records exactly as provider instructs.
3. Enforce HTTPS.
4. Verify SSL certificate issuance.

#### G. Post-deploy Verification
1. Open homepage and major routes.
2. Test `/api/live` and `/live` page loading.
3. Validate forms and dashboard auth if enabled.
4. Re-run lighthouse/performance checks.

#### H. Rollback Plan
1. Keep last known good deployment tagged.
2. Use provider rollback/restore control.
3. Re-check environment variables after rollback.
4. Record incident notes in your project changelog.

### Provider 20: Firebase App Hosting

**When to choose Firebase App Hosting:** Integrated with modern frameworks and GCP tooling.

#### A. Prepare Repository
1. Fork this repository.
2. Update branding/content files.
3. Commit and push to your branch.
4. Ensure `npm run lint` and `npm run build` pass locally.

#### B. Create Project
1. Sign in to Firebase App Hosting dashboard.
2. Create a new app/site/project.
3. Connect Git provider and select repository.
4. Select the default branch for production.
5. Enable preview deployments for pull requests if available.

#### C. Build and Runtime Settings
1. Build command: `npm run build`.
2. Output directory: `dist` for static hosts.
3. Node version: 20+.
4. Install command: `npm ci`.
5. For serverless routes, ensure `/api` routing is configured.

#### D. Environment Variables
Add these in provider secret manager:
- `MONGODB_URI`
- `SPACE_PASSWORD`
- `GOOGLE_CLIENT_ID` (optional)
- `YOUTUBE_API_KEY` (optional; richer YouTube stats/comments)

#### E. Routing and Rewrites
1. SPA fallback to `index.html` for client routes.
2. Preserve `/api/*` as backend route when supported.
3. Confirm `/live`, `/journal`, `/status` all resolve on refresh.

#### F. Domain and SSL
1. Add custom domain.
2. Configure DNS records exactly as provider instructs.
3. Enforce HTTPS.
4. Verify SSL certificate issuance.

#### G. Post-deploy Verification
1. Open homepage and major routes.
2. Test `/api/live` and `/live` page loading.
3. Validate forms and dashboard auth if enabled.
4. Re-run lighthouse/performance checks.

#### H. Rollback Plan
1. Keep last known good deployment tagged.
2. Use provider rollback/restore control.
3. Re-check environment variables after rollback.
4. Record incident notes in your project changelog.

### Provider 21: Cloud66

**When to choose Cloud66:** Managed deployment over your own cloud instances.

#### A. Prepare Repository
1. Fork this repository.
2. Update branding/content files.
3. Commit and push to your branch.
4. Ensure `npm run lint` and `npm run build` pass locally.

#### B. Create Project
1. Sign in to Cloud66 dashboard.
2. Create a new app/site/project.
3. Connect Git provider and select repository.
4. Select the default branch for production.
5. Enable preview deployments for pull requests if available.

#### C. Build and Runtime Settings
1. Build command: `npm run build`.
2. Output directory: `dist` for static hosts.
3. Node version: 20+.
4. Install command: `npm ci`.
5. For serverless routes, ensure `/api` routing is configured.

#### D. Environment Variables
Add these in provider secret manager:
- `MONGODB_URI`
- `SPACE_PASSWORD`
- `GOOGLE_CLIENT_ID` (optional)
- `YOUTUBE_API_KEY` (optional; richer YouTube stats/comments)

#### E. Routing and Rewrites
1. SPA fallback to `index.html` for client routes.
2. Preserve `/api/*` as backend route when supported.
3. Confirm `/live`, `/journal`, `/status` all resolve on refresh.

#### F. Domain and SSL
1. Add custom domain.
2. Configure DNS records exactly as provider instructs.
3. Enforce HTTPS.
4. Verify SSL certificate issuance.

#### G. Post-deploy Verification
1. Open homepage and major routes.
2. Test `/api/live` and `/live` page loading.
3. Validate forms and dashboard auth if enabled.
4. Re-run lighthouse/performance checks.

#### H. Rollback Plan
1. Keep last known good deployment tagged.
2. Use provider rollback/restore control.
3. Re-check environment variables after rollback.
4. Record incident notes in your project changelog.

### Provider 22: Coolify (Self-hosted)

**When to choose Coolify (Self-hosted):** Self-hosted PaaS for Docker-based deploys.

#### A. Prepare Repository
1. Fork this repository.
2. Update branding/content files.
3. Commit and push to your branch.
4. Ensure `npm run lint` and `npm run build` pass locally.

#### B. Create Project
1. Sign in to Coolify (Self-hosted) dashboard.
2. Create a new app/site/project.
3. Connect Git provider and select repository.
4. Select the default branch for production.
5. Enable preview deployments for pull requests if available.

#### C. Build and Runtime Settings
1. Build command: `npm run build`.
2. Output directory: `dist` for static hosts.
3. Node version: 20+.
4. Install command: `npm ci`.
5. For serverless routes, ensure `/api` routing is configured.

#### D. Environment Variables
Add these in provider secret manager:
- `MONGODB_URI`
- `SPACE_PASSWORD`
- `GOOGLE_CLIENT_ID` (optional)
- `YOUTUBE_API_KEY` (optional; richer YouTube stats/comments)

#### E. Routing and Rewrites
1. SPA fallback to `index.html` for client routes.
2. Preserve `/api/*` as backend route when supported.
3. Confirm `/live`, `/journal`, `/status` all resolve on refresh.

#### F. Domain and SSL
1. Add custom domain.
2. Configure DNS records exactly as provider instructs.
3. Enforce HTTPS.
4. Verify SSL certificate issuance.

#### G. Post-deploy Verification
1. Open homepage and major routes.
2. Test `/api/live` and `/live` page loading.
3. Validate forms and dashboard auth if enabled.
4. Re-run lighthouse/performance checks.

#### H. Rollback Plan
1. Keep last known good deployment tagged.
2. Use provider rollback/restore control.
3. Re-check environment variables after rollback.
4. Record incident notes in your project changelog.

### Provider 23: Dokku (Self-hosted)

**When to choose Dokku (Self-hosted):** Heroku-like deployment on your own VPS.

#### A. Prepare Repository
1. Fork this repository.
2. Update branding/content files.
3. Commit and push to your branch.
4. Ensure `npm run lint` and `npm run build` pass locally.

#### B. Create Project
1. Sign in to Dokku (Self-hosted) dashboard.
2. Create a new app/site/project.
3. Connect Git provider and select repository.
4. Select the default branch for production.
5. Enable preview deployments for pull requests if available.

#### C. Build and Runtime Settings
1. Build command: `npm run build`.
2. Output directory: `dist` for static hosts.
3. Node version: 20+.
4. Install command: `npm ci`.
5. For serverless routes, ensure `/api` routing is configured.

#### D. Environment Variables
Add these in provider secret manager:
- `MONGODB_URI`
- `SPACE_PASSWORD`
- `GOOGLE_CLIENT_ID` (optional)
- `YOUTUBE_API_KEY` (optional; richer YouTube stats/comments)

#### E. Routing and Rewrites
1. SPA fallback to `index.html` for client routes.
2. Preserve `/api/*` as backend route when supported.
3. Confirm `/live`, `/journal`, `/status` all resolve on refresh.

#### F. Domain and SSL
1. Add custom domain.
2. Configure DNS records exactly as provider instructs.
3. Enforce HTTPS.
4. Verify SSL certificate issuance.

#### G. Post-deploy Verification
1. Open homepage and major routes.
2. Test `/api/live` and `/live` page loading.
3. Validate forms and dashboard auth if enabled.
4. Re-run lighthouse/performance checks.

#### H. Rollback Plan
1. Keep last known good deployment tagged.
2. Use provider rollback/restore control.
3. Re-check environment variables after rollback.
4. Record incident notes in your project changelog.

### Provider 24: Kubernetes (Self-managed)

**When to choose Kubernetes (Self-managed):** Advanced scalable deployment with ingress and secrets.

#### A. Prepare Repository
1. Fork this repository.
2. Update branding/content files.
3. Commit and push to your branch.
4. Ensure `npm run lint` and `npm run build` pass locally.

#### B. Create Project
1. Sign in to Kubernetes (Self-managed) dashboard.
2. Create a new app/site/project.
3. Connect Git provider and select repository.
4. Select the default branch for production.
5. Enable preview deployments for pull requests if available.

#### C. Build and Runtime Settings
1. Build command: `npm run build`.
2. Output directory: `dist` for static hosts.
3. Node version: 20+.
4. Install command: `npm ci`.
5. For serverless routes, ensure `/api` routing is configured.

#### D. Environment Variables
Add these in provider secret manager:
- `MONGODB_URI`
- `SPACE_PASSWORD`
- `GOOGLE_CLIENT_ID` (optional)
- `YOUTUBE_API_KEY` (optional; richer YouTube stats/comments)

#### E. Routing and Rewrites
1. SPA fallback to `index.html` for client routes.
2. Preserve `/api/*` as backend route when supported.
3. Confirm `/live`, `/journal`, `/status` all resolve on refresh.

#### F. Domain and SSL
1. Add custom domain.
2. Configure DNS records exactly as provider instructs.
3. Enforce HTTPS.
4. Verify SSL certificate issuance.

#### G. Post-deploy Verification
1. Open homepage and major routes.
2. Test `/api/live` and `/live` page loading.
3. Validate forms and dashboard auth if enabled.
4. Re-run lighthouse/performance checks.

#### H. Rollback Plan
1. Keep last known good deployment tagged.
2. Use provider rollback/restore control.
3. Re-check environment variables after rollback.
4. Record incident notes in your project changelog.

## Section 10 — Monitoring and Maintenance

Monitor:
- Uptime and latency
- API errors
- Bundle size
- Build failures

Maintenance schedule:
1. Weekly dependency review.
2. Monthly security scan.
3. Quarterly content refresh.
4. Biannual full deploy rehearsal.

## Section 11 — Backup and Restore

Back up:
- Source code (Git remote + local mirror)
- Environment variable inventory (without plaintext secrets in Git)
- Database dumps
- Static assets

Restore drill:
1. Clone backup repo snapshot.
2. Restore env variables.
3. Restore database.
4. Build and deploy to staging.
5. Validate critical routes and APIs.

## Section 12 — Troubleshooting Matrix

### Troubleshooting Case 1
- Symptom: Case 1 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 2
- Symptom: Case 2 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 3
- Symptom: Case 3 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 4
- Symptom: Case 4 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 5
- Symptom: Case 5 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 6
- Symptom: Case 6 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 7
- Symptom: Case 7 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 8
- Symptom: Case 8 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 9
- Symptom: Case 9 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 10
- Symptom: Case 10 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 11
- Symptom: Case 11 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 12
- Symptom: Case 12 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 13
- Symptom: Case 13 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 14
- Symptom: Case 14 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 15
- Symptom: Case 15 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 16
- Symptom: Case 16 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 17
- Symptom: Case 17 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 18
- Symptom: Case 18 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 19
- Symptom: Case 19 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 20
- Symptom: Case 20 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 21
- Symptom: Case 21 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 22
- Symptom: Case 22 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 23
- Symptom: Case 23 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 24
- Symptom: Case 24 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 25
- Symptom: Case 25 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 26
- Symptom: Case 26 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 27
- Symptom: Case 27 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 28
- Symptom: Case 28 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 29
- Symptom: Case 29 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 30
- Symptom: Case 30 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 31
- Symptom: Case 31 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 32
- Symptom: Case 32 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 33
- Symptom: Case 33 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 34
- Symptom: Case 34 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 35
- Symptom: Case 35 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 36
- Symptom: Case 36 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 37
- Symptom: Case 37 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 38
- Symptom: Case 38 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 39
- Symptom: Case 39 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 40
- Symptom: Case 40 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 41
- Symptom: Case 41 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 42
- Symptom: Case 42 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 43
- Symptom: Case 43 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 44
- Symptom: Case 44 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 45
- Symptom: Case 45 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 46
- Symptom: Case 46 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 47
- Symptom: Case 47 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 48
- Symptom: Case 48 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 49
- Symptom: Case 49 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 50
- Symptom: Case 50 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 51
- Symptom: Case 51 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 52
- Symptom: Case 52 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 53
- Symptom: Case 53 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 54
- Symptom: Case 54 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 55
- Symptom: Case 55 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 56
- Symptom: Case 56 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 57
- Symptom: Case 57 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 58
- Symptom: Case 58 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 59
- Symptom: Case 59 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 60
- Symptom: Case 60 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 61
- Symptom: Case 61 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 62
- Symptom: Case 62 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 63
- Symptom: Case 63 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 64
- Symptom: Case 64 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 65
- Symptom: Case 65 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 66
- Symptom: Case 66 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 67
- Symptom: Case 67 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 68
- Symptom: Case 68 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 69
- Symptom: Case 69 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 70
- Symptom: Case 70 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 71
- Symptom: Case 71 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 72
- Symptom: Case 72 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 73
- Symptom: Case 73 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 74
- Symptom: Case 74 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 75
- Symptom: Case 75 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 76
- Symptom: Case 76 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 77
- Symptom: Case 77 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 78
- Symptom: Case 78 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 79
- Symptom: Case 79 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 80
- Symptom: Case 80 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 81
- Symptom: Case 81 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 82
- Symptom: Case 82 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 83
- Symptom: Case 83 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 84
- Symptom: Case 84 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 85
- Symptom: Case 85 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 86
- Symptom: Case 86 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 87
- Symptom: Case 87 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 88
- Symptom: Case 88 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 89
- Symptom: Case 89 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 90
- Symptom: Case 90 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 91
- Symptom: Case 91 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 92
- Symptom: Case 92 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 93
- Symptom: Case 93 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 94
- Symptom: Case 94 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 95
- Symptom: Case 95 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 96
- Symptom: Case 96 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 97
- Symptom: Case 97 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 98
- Symptom: Case 98 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 99
- Symptom: Case 99 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 100
- Symptom: Case 100 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 101
- Symptom: Case 101 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 102
- Symptom: Case 102 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 103
- Symptom: Case 103 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 104
- Symptom: Case 104 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 105
- Symptom: Case 105 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 106
- Symptom: Case 106 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 107
- Symptom: Case 107 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 108
- Symptom: Case 108 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 109
- Symptom: Case 109 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 110
- Symptom: Case 110 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 111
- Symptom: Case 111 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 112
- Symptom: Case 112 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 113
- Symptom: Case 113 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 114
- Symptom: Case 114 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 115
- Symptom: Case 115 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 116
- Symptom: Case 116 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 117
- Symptom: Case 117 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 118
- Symptom: Case 118 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 119
- Symptom: Case 119 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 120
- Symptom: Case 120 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 121
- Symptom: Case 121 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 122
- Symptom: Case 122 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 123
- Symptom: Case 123 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 124
- Symptom: Case 124 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 125
- Symptom: Case 125 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 126
- Symptom: Case 126 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 127
- Symptom: Case 127 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 128
- Symptom: Case 128 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 129
- Symptom: Case 129 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 130
- Symptom: Case 130 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 131
- Symptom: Case 131 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 132
- Symptom: Case 132 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 133
- Symptom: Case 133 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 134
- Symptom: Case 134 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 135
- Symptom: Case 135 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 136
- Symptom: Case 136 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 137
- Symptom: Case 137 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 138
- Symptom: Case 138 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 139
- Symptom: Case 139 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 140
- Symptom: Case 140 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 141
- Symptom: Case 141 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 142
- Symptom: Case 142 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 143
- Symptom: Case 143 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 144
- Symptom: Case 144 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 145
- Symptom: Case 145 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 146
- Symptom: Case 146 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 147
- Symptom: Case 147 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 148
- Symptom: Case 148 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 149
- Symptom: Case 149 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 150
- Symptom: Case 150 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 151
- Symptom: Case 151 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 152
- Symptom: Case 152 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 153
- Symptom: Case 153 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 154
- Symptom: Case 154 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 155
- Symptom: Case 155 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 156
- Symptom: Case 156 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 157
- Symptom: Case 157 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 158
- Symptom: Case 158 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 159
- Symptom: Case 159 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 160
- Symptom: Case 160 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 161
- Symptom: Case 161 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 162
- Symptom: Case 162 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 163
- Symptom: Case 163 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 164
- Symptom: Case 164 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 165
- Symptom: Case 165 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 166
- Symptom: Case 166 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 167
- Symptom: Case 167 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 168
- Symptom: Case 168 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 169
- Symptom: Case 169 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 170
- Symptom: Case 170 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 171
- Symptom: Case 171 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 172
- Symptom: Case 172 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 173
- Symptom: Case 173 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 174
- Symptom: Case 174 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 175
- Symptom: Case 175 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 176
- Symptom: Case 176 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 177
- Symptom: Case 177 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 178
- Symptom: Case 178 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 179
- Symptom: Case 179 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 180
- Symptom: Case 180 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 181
- Symptom: Case 181 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 182
- Symptom: Case 182 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 183
- Symptom: Case 183 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 184
- Symptom: Case 184 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 185
- Symptom: Case 185 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 186
- Symptom: Case 186 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 187
- Symptom: Case 187 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 188
- Symptom: Case 188 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 189
- Symptom: Case 189 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 190
- Symptom: Case 190 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 191
- Symptom: Case 191 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 192
- Symptom: Case 192 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 193
- Symptom: Case 193 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 194
- Symptom: Case 194 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 195
- Symptom: Case 195 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 196
- Symptom: Case 196 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 197
- Symptom: Case 197 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 198
- Symptom: Case 198 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 199
- Symptom: Case 199 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 200
- Symptom: Case 200 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 201
- Symptom: Case 201 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 202
- Symptom: Case 202 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 203
- Symptom: Case 203 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 204
- Symptom: Case 204 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 205
- Symptom: Case 205 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 206
- Symptom: Case 206 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 207
- Symptom: Case 207 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 208
- Symptom: Case 208 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 209
- Symptom: Case 209 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 210
- Symptom: Case 210 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 211
- Symptom: Case 211 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 212
- Symptom: Case 212 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 213
- Symptom: Case 213 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 214
- Symptom: Case 214 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 215
- Symptom: Case 215 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 216
- Symptom: Case 216 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 217
- Symptom: Case 217 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 218
- Symptom: Case 218 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 219
- Symptom: Case 219 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 220
- Symptom: Case 220 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 221
- Symptom: Case 221 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 222
- Symptom: Case 222 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 223
- Symptom: Case 223 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 224
- Symptom: Case 224 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 225
- Symptom: Case 225 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 226
- Symptom: Case 226 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 227
- Symptom: Case 227 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 228
- Symptom: Case 228 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 229
- Symptom: Case 229 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 230
- Symptom: Case 230 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 231
- Symptom: Case 231 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 232
- Symptom: Case 232 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 233
- Symptom: Case 233 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 234
- Symptom: Case 234 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 235
- Symptom: Case 235 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 236
- Symptom: Case 236 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 237
- Symptom: Case 237 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 238
- Symptom: Case 238 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 239
- Symptom: Case 239 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 240
- Symptom: Case 240 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 241
- Symptom: Case 241 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 242
- Symptom: Case 242 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 243
- Symptom: Case 243 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 244
- Symptom: Case 244 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 245
- Symptom: Case 245 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 246
- Symptom: Case 246 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 247
- Symptom: Case 247 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 248
- Symptom: Case 248 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 249
- Symptom: Case 249 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 250
- Symptom: Case 250 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 251
- Symptom: Case 251 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 252
- Symptom: Case 252 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 253
- Symptom: Case 253 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 254
- Symptom: Case 254 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 255
- Symptom: Case 255 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 256
- Symptom: Case 256 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 257
- Symptom: Case 257 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 258
- Symptom: Case 258 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 259
- Symptom: Case 259 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 260
- Symptom: Case 260 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 261
- Symptom: Case 261 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 262
- Symptom: Case 262 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 263
- Symptom: Case 263 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 264
- Symptom: Case 264 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 265
- Symptom: Case 265 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 266
- Symptom: Case 266 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 267
- Symptom: Case 267 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 268
- Symptom: Case 268 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 269
- Symptom: Case 269 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 270
- Symptom: Case 270 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 271
- Symptom: Case 271 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 272
- Symptom: Case 272 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 273
- Symptom: Case 273 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 274
- Symptom: Case 274 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 275
- Symptom: Case 275 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 276
- Symptom: Case 276 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 277
- Symptom: Case 277 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 278
- Symptom: Case 278 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 279
- Symptom: Case 279 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 280
- Symptom: Case 280 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 281
- Symptom: Case 281 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 282
- Symptom: Case 282 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 283
- Symptom: Case 283 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 284
- Symptom: Case 284 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 285
- Symptom: Case 285 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 286
- Symptom: Case 286 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 287
- Symptom: Case 287 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 288
- Symptom: Case 288 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 289
- Symptom: Case 289 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 290
- Symptom: Case 290 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 291
- Symptom: Case 291 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 292
- Symptom: Case 292 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 293
- Symptom: Case 293 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 294
- Symptom: Case 294 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 295
- Symptom: Case 295 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 296
- Symptom: Case 296 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 297
- Symptom: Case 297 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 298
- Symptom: Case 298 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 299
- Symptom: Case 299 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 300
- Symptom: Case 300 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 301
- Symptom: Case 301 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 302
- Symptom: Case 302 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 303
- Symptom: Case 303 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 304
- Symptom: Case 304 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 305
- Symptom: Case 305 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 306
- Symptom: Case 306 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 307
- Symptom: Case 307 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 308
- Symptom: Case 308 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 309
- Symptom: Case 309 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 310
- Symptom: Case 310 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 311
- Symptom: Case 311 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 312
- Symptom: Case 312 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 313
- Symptom: Case 313 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 314
- Symptom: Case 314 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 315
- Symptom: Case 315 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 316
- Symptom: Case 316 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 317
- Symptom: Case 317 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 318
- Symptom: Case 318 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 319
- Symptom: Case 319 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 320
- Symptom: Case 320 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 321
- Symptom: Case 321 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 322
- Symptom: Case 322 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 323
- Symptom: Case 323 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 324
- Symptom: Case 324 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 325
- Symptom: Case 325 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 326
- Symptom: Case 326 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 327
- Symptom: Case 327 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 328
- Symptom: Case 328 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 329
- Symptom: Case 329 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 330
- Symptom: Case 330 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 331
- Symptom: Case 331 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 332
- Symptom: Case 332 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 333
- Symptom: Case 333 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 334
- Symptom: Case 334 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 335
- Symptom: Case 335 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 336
- Symptom: Case 336 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 337
- Symptom: Case 337 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 338
- Symptom: Case 338 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 339
- Symptom: Case 339 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 340
- Symptom: Case 340 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 341
- Symptom: Case 341 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 342
- Symptom: Case 342 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 343
- Symptom: Case 343 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 344
- Symptom: Case 344 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 345
- Symptom: Case 345 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 346
- Symptom: Case 346 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 347
- Symptom: Case 347 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 348
- Symptom: Case 348 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 349
- Symptom: Case 349 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 350
- Symptom: Case 350 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 351
- Symptom: Case 351 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 352
- Symptom: Case 352 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 353
- Symptom: Case 353 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 354
- Symptom: Case 354 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 355
- Symptom: Case 355 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 356
- Symptom: Case 356 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 357
- Symptom: Case 357 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 358
- Symptom: Case 358 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 359
- Symptom: Case 359 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 360
- Symptom: Case 360 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 361
- Symptom: Case 361 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 362
- Symptom: Case 362 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 363
- Symptom: Case 363 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 364
- Symptom: Case 364 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 365
- Symptom: Case 365 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 366
- Symptom: Case 366 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 367
- Symptom: Case 367 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 368
- Symptom: Case 368 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 369
- Symptom: Case 369 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 370
- Symptom: Case 370 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 371
- Symptom: Case 371 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 372
- Symptom: Case 372 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 373
- Symptom: Case 373 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 374
- Symptom: Case 374 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 375
- Symptom: Case 375 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 376
- Symptom: Case 376 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 377
- Symptom: Case 377 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 378
- Symptom: Case 378 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 379
- Symptom: Case 379 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 380
- Symptom: Case 380 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 381
- Symptom: Case 381 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 382
- Symptom: Case 382 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 383
- Symptom: Case 383 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 384
- Symptom: Case 384 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 385
- Symptom: Case 385 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 386
- Symptom: Case 386 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 387
- Symptom: Case 387 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 388
- Symptom: Case 388 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 389
- Symptom: Case 389 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 390
- Symptom: Case 390 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 391
- Symptom: Case 391 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 392
- Symptom: Case 392 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 393
- Symptom: Case 393 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 394
- Symptom: Case 394 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 395
- Symptom: Case 395 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 396
- Symptom: Case 396 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 397
- Symptom: Case 397 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 398
- Symptom: Case 398 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 399
- Symptom: Case 399 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

### Troubleshooting Case 400
- Symptom: Case 400 service behavior mismatch.
- Likely causes: environment variable mismatch, provider routing, stale cache, dependency drift.
- Fix step 1: run `npm ci` then `npm run lint` and `npm run build`.
- Fix step 2: verify provider build logs and runtime logs.
- Fix step 3: clear CDN cache and redeploy if needed.
- Fix step 4: validate `/api/live` JSON output and frontend network panel.

## Section 13 — Extended FAQ

### FAQ 1
**Q:** How do I handle setup question 1?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 2
**Q:** How do I handle setup question 2?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 3
**Q:** How do I handle setup question 3?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 4
**Q:** How do I handle setup question 4?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 5
**Q:** How do I handle setup question 5?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 6
**Q:** How do I handle setup question 6?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 7
**Q:** How do I handle setup question 7?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 8
**Q:** How do I handle setup question 8?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 9
**Q:** How do I handle setup question 9?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 10
**Q:** How do I handle setup question 10?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 11
**Q:** How do I handle setup question 11?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 12
**Q:** How do I handle setup question 12?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 13
**Q:** How do I handle setup question 13?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 14
**Q:** How do I handle setup question 14?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 15
**Q:** How do I handle setup question 15?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 16
**Q:** How do I handle setup question 16?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 17
**Q:** How do I handle setup question 17?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 18
**Q:** How do I handle setup question 18?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 19
**Q:** How do I handle setup question 19?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 20
**Q:** How do I handle setup question 20?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 21
**Q:** How do I handle setup question 21?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 22
**Q:** How do I handle setup question 22?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 23
**Q:** How do I handle setup question 23?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 24
**Q:** How do I handle setup question 24?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 25
**Q:** How do I handle setup question 25?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 26
**Q:** How do I handle setup question 26?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 27
**Q:** How do I handle setup question 27?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 28
**Q:** How do I handle setup question 28?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 29
**Q:** How do I handle setup question 29?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 30
**Q:** How do I handle setup question 30?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 31
**Q:** How do I handle setup question 31?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 32
**Q:** How do I handle setup question 32?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 33
**Q:** How do I handle setup question 33?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 34
**Q:** How do I handle setup question 34?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 35
**Q:** How do I handle setup question 35?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 36
**Q:** How do I handle setup question 36?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 37
**Q:** How do I handle setup question 37?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 38
**Q:** How do I handle setup question 38?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 39
**Q:** How do I handle setup question 39?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 40
**Q:** How do I handle setup question 40?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 41
**Q:** How do I handle setup question 41?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 42
**Q:** How do I handle setup question 42?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 43
**Q:** How do I handle setup question 43?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 44
**Q:** How do I handle setup question 44?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 45
**Q:** How do I handle setup question 45?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 46
**Q:** How do I handle setup question 46?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 47
**Q:** How do I handle setup question 47?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 48
**Q:** How do I handle setup question 48?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 49
**Q:** How do I handle setup question 49?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 50
**Q:** How do I handle setup question 50?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 51
**Q:** How do I handle setup question 51?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 52
**Q:** How do I handle setup question 52?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 53
**Q:** How do I handle setup question 53?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 54
**Q:** How do I handle setup question 54?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 55
**Q:** How do I handle setup question 55?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 56
**Q:** How do I handle setup question 56?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 57
**Q:** How do I handle setup question 57?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 58
**Q:** How do I handle setup question 58?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 59
**Q:** How do I handle setup question 59?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 60
**Q:** How do I handle setup question 60?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 61
**Q:** How do I handle setup question 61?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 62
**Q:** How do I handle setup question 62?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 63
**Q:** How do I handle setup question 63?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 64
**Q:** How do I handle setup question 64?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 65
**Q:** How do I handle setup question 65?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 66
**Q:** How do I handle setup question 66?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 67
**Q:** How do I handle setup question 67?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 68
**Q:** How do I handle setup question 68?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 69
**Q:** How do I handle setup question 69?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 70
**Q:** How do I handle setup question 70?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 71
**Q:** How do I handle setup question 71?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 72
**Q:** How do I handle setup question 72?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 73
**Q:** How do I handle setup question 73?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 74
**Q:** How do I handle setup question 74?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 75
**Q:** How do I handle setup question 75?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 76
**Q:** How do I handle setup question 76?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 77
**Q:** How do I handle setup question 77?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 78
**Q:** How do I handle setup question 78?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 79
**Q:** How do I handle setup question 79?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 80
**Q:** How do I handle setup question 80?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 81
**Q:** How do I handle setup question 81?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 82
**Q:** How do I handle setup question 82?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 83
**Q:** How do I handle setup question 83?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 84
**Q:** How do I handle setup question 84?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 85
**Q:** How do I handle setup question 85?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 86
**Q:** How do I handle setup question 86?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 87
**Q:** How do I handle setup question 87?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 88
**Q:** How do I handle setup question 88?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 89
**Q:** How do I handle setup question 89?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 90
**Q:** How do I handle setup question 90?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 91
**Q:** How do I handle setup question 91?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 92
**Q:** How do I handle setup question 92?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 93
**Q:** How do I handle setup question 93?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 94
**Q:** How do I handle setup question 94?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 95
**Q:** How do I handle setup question 95?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 96
**Q:** How do I handle setup question 96?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 97
**Q:** How do I handle setup question 97?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 98
**Q:** How do I handle setup question 98?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 99
**Q:** How do I handle setup question 99?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 100
**Q:** How do I handle setup question 100?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 101
**Q:** How do I handle setup question 101?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 102
**Q:** How do I handle setup question 102?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 103
**Q:** How do I handle setup question 103?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 104
**Q:** How do I handle setup question 104?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 105
**Q:** How do I handle setup question 105?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 106
**Q:** How do I handle setup question 106?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 107
**Q:** How do I handle setup question 107?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 108
**Q:** How do I handle setup question 108?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 109
**Q:** How do I handle setup question 109?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 110
**Q:** How do I handle setup question 110?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 111
**Q:** How do I handle setup question 111?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 112
**Q:** How do I handle setup question 112?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 113
**Q:** How do I handle setup question 113?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 114
**Q:** How do I handle setup question 114?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 115
**Q:** How do I handle setup question 115?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 116
**Q:** How do I handle setup question 116?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 117
**Q:** How do I handle setup question 117?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 118
**Q:** How do I handle setup question 118?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 119
**Q:** How do I handle setup question 119?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 120
**Q:** How do I handle setup question 120?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 121
**Q:** How do I handle setup question 121?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 122
**Q:** How do I handle setup question 122?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 123
**Q:** How do I handle setup question 123?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 124
**Q:** How do I handle setup question 124?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 125
**Q:** How do I handle setup question 125?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 126
**Q:** How do I handle setup question 126?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 127
**Q:** How do I handle setup question 127?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 128
**Q:** How do I handle setup question 128?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 129
**Q:** How do I handle setup question 129?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 130
**Q:** How do I handle setup question 130?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 131
**Q:** How do I handle setup question 131?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 132
**Q:** How do I handle setup question 132?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 133
**Q:** How do I handle setup question 133?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 134
**Q:** How do I handle setup question 134?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 135
**Q:** How do I handle setup question 135?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 136
**Q:** How do I handle setup question 136?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 137
**Q:** How do I handle setup question 137?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 138
**Q:** How do I handle setup question 138?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 139
**Q:** How do I handle setup question 139?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 140
**Q:** How do I handle setup question 140?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 141
**Q:** How do I handle setup question 141?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 142
**Q:** How do I handle setup question 142?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 143
**Q:** How do I handle setup question 143?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 144
**Q:** How do I handle setup question 144?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 145
**Q:** How do I handle setup question 145?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 146
**Q:** How do I handle setup question 146?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 147
**Q:** How do I handle setup question 147?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 148
**Q:** How do I handle setup question 148?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 149
**Q:** How do I handle setup question 149?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 150
**Q:** How do I handle setup question 150?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 151
**Q:** How do I handle setup question 151?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 152
**Q:** How do I handle setup question 152?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 153
**Q:** How do I handle setup question 153?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 154
**Q:** How do I handle setup question 154?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 155
**Q:** How do I handle setup question 155?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 156
**Q:** How do I handle setup question 156?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 157
**Q:** How do I handle setup question 157?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 158
**Q:** How do I handle setup question 158?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 159
**Q:** How do I handle setup question 159?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 160
**Q:** How do I handle setup question 160?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 161
**Q:** How do I handle setup question 161?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 162
**Q:** How do I handle setup question 162?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 163
**Q:** How do I handle setup question 163?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 164
**Q:** How do I handle setup question 164?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 165
**Q:** How do I handle setup question 165?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 166
**Q:** How do I handle setup question 166?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 167
**Q:** How do I handle setup question 167?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 168
**Q:** How do I handle setup question 168?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 169
**Q:** How do I handle setup question 169?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 170
**Q:** How do I handle setup question 170?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 171
**Q:** How do I handle setup question 171?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 172
**Q:** How do I handle setup question 172?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 173
**Q:** How do I handle setup question 173?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 174
**Q:** How do I handle setup question 174?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 175
**Q:** How do I handle setup question 175?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 176
**Q:** How do I handle setup question 176?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 177
**Q:** How do I handle setup question 177?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 178
**Q:** How do I handle setup question 178?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 179
**Q:** How do I handle setup question 179?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 180
**Q:** How do I handle setup question 180?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 181
**Q:** How do I handle setup question 181?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 182
**Q:** How do I handle setup question 182?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 183
**Q:** How do I handle setup question 183?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 184
**Q:** How do I handle setup question 184?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 185
**Q:** How do I handle setup question 185?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 186
**Q:** How do I handle setup question 186?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 187
**Q:** How do I handle setup question 187?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 188
**Q:** How do I handle setup question 188?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 189
**Q:** How do I handle setup question 189?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 190
**Q:** How do I handle setup question 190?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 191
**Q:** How do I handle setup question 191?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 192
**Q:** How do I handle setup question 192?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 193
**Q:** How do I handle setup question 193?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 194
**Q:** How do I handle setup question 194?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 195
**Q:** How do I handle setup question 195?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 196
**Q:** How do I handle setup question 196?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 197
**Q:** How do I handle setup question 197?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 198
**Q:** How do I handle setup question 198?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 199
**Q:** How do I handle setup question 199?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

### FAQ 200
**Q:** How do I handle setup question 200?
**A:** Follow this order: local validation, environment validation, deployment validation, post-deploy route checks, then provider-specific logs.

## Section 14 — Live Page Specific Notes

- `/api/live` supports richer stats/comments when `YOUTUBE_API_KEY` is present.
- Without API key, no-key web+RSS fallback still loads videos/streams/shorts list.
- Live page list is paginated with 15 items per page and next/prev controls.

## Section 15 — Final Launch Checklist

1. Branding replaced.
2. Legal pages updated.
3. SEO metadata updated.
4. Environment variables set.
5. Build and lint passing.
6. Deployment smoke-tested.
7. Custom domain + HTTPS validated.
8. Backup/restore rehearsal complete.

---

End of manual.
