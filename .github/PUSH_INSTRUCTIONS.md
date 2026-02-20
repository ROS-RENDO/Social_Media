# Push Frontend + Backend to GitHub

## Option A: One repository (recommended)

Use a single GitHub repo that contains both `frontend/` and `backend/` folders.

### 1. Create a new repository on GitHub

- Go to https://github.com/new
- Name it (e.g. `Social_Media` or `social-media-app`)
- Do **not** initialize with README, .gitignore, or license (you already have these)
- Click **Create repository**

### 2. In your project root (folder that contains `frontend` and `backend`)

If `frontend` was created with create-next-app, it may have its own `.git`. Remove it so the root repo tracks everything:

```bash
# From project root (e.g. Social_Media)
rmdir /s /q frontend\.git
```

Then initialize the root repo (if not already) and add the remote:

```bash
git init
git add .
git commit -m "Initial commit: Next.js frontend + Express backend"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your GitHub username and repo name.

### 3. If you already have a root repo and only need to push

```bash
git add .
git commit -m "Add frontend and backend"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

---

## Option B: Two separate repositories

- **Backend repo:** only the `backend/` folder.
- **Frontend repo:** only the `frontend/` folder.

### Backend

```bash
cd backend
git init
git add .
git commit -m "Initial commit: Express + Better Auth + MySQL backend"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/social-media-backend.git
git push -u origin main
```

### Frontend

```bash
cd frontend
git add .
git commit -m "Initial commit: Next.js social media frontend"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/social-media-frontend.git
git push -u origin main
```

---

## Notes

- Never commit `.env` or `.env.local` (they are in `.gitignore`).
- Keep `backend/.env.example` and `frontend/.env.example` in the repo so others know which variables to set.
