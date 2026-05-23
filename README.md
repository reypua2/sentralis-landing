# Sentralis Landing Page

Cinematic waitlist landing page for Sentralis — deployable to Railway in minutes.

## Project Structure

```
sentralis-landing/
├── server.js          ← Express backend (API + file serving)
├── package.json
├── railway.toml       ← Railway deployment config
├── .gitignore
└── public/
    └── index.html     ← The full landing page
    └── aria.jpg       ← Drop Aria's portrait here (optional)
```

## Deploy to Railway — Step by Step

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Sentralis landing page"
git remote add origin https://github.com/YOUR_USERNAME/sentralis-landing.git
git push -u origin main
```

### Step 2 — Create Railway Project
1. Go to railway.app → New Project
2. Choose "Deploy from GitHub repo"
3. Select your sentralis-landing repo
4. Railway auto-detects Node.js and deploys

### Step 3 — Add PostgreSQL Database
1. In your Railway project → click "+ New"
2. Choose "Database" → "PostgreSQL"
3. Railway automatically sets DATABASE_URL in your environment
4. The app creates the waitlist table on first start

### Step 4 — Set Environment Variables
In Railway → your service → Variables tab, add:
```
ADMIN_SECRET=your_secret_password_here
NODE_ENV=production
```

### Step 5 — Add Custom Domain
1. Railway → your service → Settings → Domains
2. Add your domain (e.g. sentralis.app)
3. Update your domain DNS with the CNAME Railway gives you

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/waitlist | Save email to waitlist |
| GET | /api/waitlist/count | Get total signup count |
| GET | /api/waitlist?secret=YOUR_SECRET | View all signups |

## Adding Aria's Portrait
Drop her image file named `aria.jpg` into the `/public/` folder.
The page automatically shows it when available.

## View Your Leads
Visit: `https://your-domain.com/api/waitlist?secret=YOUR_ADMIN_SECRET`
Returns all emails as JSON — copy and save them anytime.
