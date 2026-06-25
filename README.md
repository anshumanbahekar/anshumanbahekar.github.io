# anshumanbahekar.github.io — Portfolio Setup

Live at: **https://anshumanbahekar.github.io**
Proxy at: **https://anshuman-github-proxy.anshumanbahekar.workers.dev**

---

## Architecture

```
Browser → anshumanbahekar.github.io (static HTML, GitHub Pages)
              ↓ fetch()
         anshuman-github-proxy.workers.dev (Cloudflare Worker)
              ↓ Bearer token
         api.github.com/graphql + /rest (real data, private repos included)
```

---

## One-time Setup (do this once)

### Step 1 — Push this repo to GitHub

```bash
git init
git remote add origin https://github.com/anshumanbahekar/anshumanbahekar.github.io.git
git add .
git commit -m "feat: portfolio v3 ghibli edition"
git push -u origin main
```

### Step 2 — Enable GitHub Pages

1. Go to your repo → **Settings → Pages**
2. Source: **GitHub Actions**
3. Save

Your site will auto-deploy on every push to `main`.

---

### Step 3 — Deploy the Cloudflare Worker

```bash
# Install wrangler globally (one time)
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Go to worker folder
cd worker

# Deploy the worker
wrangler deploy

# Set your GitHub token as a secret (never stored in code)
wrangler secret put GITHUB_TOKEN
# → paste your token when prompted, press Enter
```

Your worker will be live at:
`https://anshuman-github-proxy.anshumanbahekar.workers.dev`

---

### Step 4 — Update WORKER_URL in the portfolio

Open `src/index.html` and find this line (near the bottom in the `<script>` tag):

```js
const WORKER_URL = 'https://anshuman-github-proxy.anshumanbahekar.workers.dev';
```

If Cloudflare gave you a different subdomain, update it here.
Then push:

```bash
git add src/index.html
git commit -m "fix: update worker URL"
git push
```

GitHub Actions will auto-redeploy in ~30 seconds.

---

### Step 5 — Verify everything works

Open: `https://anshuman-github-proxy.anshumanbahekar.workers.dev/github/all`

You should see a JSON response with:
- `profile` — your real GitHub stats
- `contributions` — real contribution calendar + streaks
- `events` — recent activity

Then open: `https://anshumanbahekar.github.io`

The live stats section should show real numbers with a green `● Live` badge.

---

## What's Live vs Static

| Data | Source | Updates |
|------|--------|---------|
| GitHub commits | GraphQL API via Worker | Every page load + every 5 min |
| Contribution graph | GraphQL API via Worker | Every page load |
| Language breakdown | REST API via Worker | Every page load |
| Followers / Stars / Forks / Repos | REST API via Worker | Every page load |
| Current streak | GraphQL API via Worker | Every page load |
| Live activity ticker | REST Events API via Worker | Every page load |
| Hackathon countdown | JS Date() | Real-time, every second |
| Clock in nav | JS Date() | Real-time, every second |
| Particles / animations | Pure CSS + Canvas | Always live |

---

## Updating Your Portfolio

Just edit `src/index.html` and push to `main`.
GitHub Actions deploys automatically — no build step needed.

```bash
git add src/index.html
git commit -m "update: added new project"
git push
```

---

## Worker Routes

| Route | Returns |
|-------|---------|
| `/github/all` | Everything in one call (profile + contributions + events) |
| `/github/profile` | User stats + language breakdown + recent repos |
| `/github/contributions` | Full contribution calendar + streaks + totals |
| `/github/events` | Recent activity for the live ticker |

---

## Refreshing the Worker Token

If you ever regenerate your GitHub token:

```bash
cd worker
wrangler secret put GITHUB_TOKEN
# paste new token
```

No redeployment needed — secrets update instantly.
