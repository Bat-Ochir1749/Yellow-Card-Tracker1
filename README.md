# Yellow Card Tracker

A web application to track student yellow cards and automatically issue demerits.

## 🚀 Deployment to Vercel

To deploy this application successfully on Vercel, you must set up a PostgreSQL database and configure environment variables.

### Step 1: Create a Database
Since Vercel is serverless, you cannot use the local `dev.db` (SQLite) file. You need a cloud PostgreSQL database.
Recommended free options:
- **Neon** (https://neon.tech) - Easiest to set up.
- **Supabase** (https://supabase.com)
- **Vercel Postgres** (Available in Vercel Storage tab)

**After creating the database, copy the "Connection String".**
It looks like: `postgres://user:password@host.neondb.tech/neondb...`

### Step 2: Configure Vercel
1. Go to your **Vercel Project Settings**.
2. Navigate to **Environment Variables**.
3. Add the following variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your PostgreSQL connection string (from Step 1) |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_USER` | `yellowcardnotice@gmail.com` |
| `SMTP_PASS` | `ytqp oxao bdml yryk` |
| `SMTP_PORT` | `587` |
| `SMTP_SECURE` | `false` |

### Step 3: Redeploy
After adding the variables, go to the **Deployments** tab in Vercel and **Redeploy** the latest commit.

---

## 💻 Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Environment**
   Create a `.env` file in the root directory (see `.env.example`).
   ```env
   DATABASE_URL="postgresql://..."
   ```

3. **Run Backend & Frontend**
   ```bash
   # Terminal 1: Backend
   npm run api

   # Terminal 2: Frontend
   npm run dev
   ```
