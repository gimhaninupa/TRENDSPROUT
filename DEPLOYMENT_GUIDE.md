# TRENDSPROUT 100% Free Cloud Deployment Guide

This guide details how to host the complete **TRENDSPROUT** full-stack ecosystem (React Frontend, Node.js/Express Backend, Python Computer Vision Microservice, and MongoDB Database) **100% free with zero credit card required**.

---

## Architecture Overview

| Component | Technology | Free Host | Free Tier Specs |
| :--- | :--- | :--- | :--- |
| **Frontend** | React 18, Vite 6, Tailwind CSS | **Vercel** | Unlimited deploys, global CDN, custom domain support |
| **Backend API** | Node.js, Express, JWT, Mongoose | **Render** | 750 free compute hours/month, automatic HTTPS |
| **Database** | MongoDB | **MongoDB Atlas** | M0 Sandbox (512MB storage, shared RAM, auto-backups) |
| **AI Microservice** | Python 3.10, FastAPI, OpenCV, rembg | **Hugging Face Spaces** | 2 vCPU, 16 GB RAM, 50 GB storage (Docker SDK) |

---

## 1. Database Setup (MongoDB Atlas — Free M0)

1. Sign up for free at [cloud.mongodb.com](https://cloud.mongodb.com/).
2. Click **Create Deployment** → select **M0 Free**.
3. Choose your nearest cloud region (e.g., `AWS / ap-southeast-1` or `eu-central-1`).
4. Set up database access:
   - Go to **Database Access** → **Add New Database User** (create username & secure password).
   - Go to **Network Access** → **Add IP Address** → choose **Allow Access from Anywhere** (`0.0.0.0/0`).
5. Click **Connect** → **Drivers (Node.js)**:
   - Copy connection string: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/trendsprout?retryWrites=true&w=majority`
   - Store this for your backend environment variables.

---

## 2. Python AI Microservice Deployment (Hugging Face Spaces)

The Python service (`python-ai-service/`) handles:
- **AI Image Background Remover** (`/api/cv/remove-bg`)
- **AI 3D Apparel Mockup Generator** (`/api/cv/generate-mockup`)
- **Visual Search with Drop & Crop** (`/api/cv/visual-search`)

### Deployment Steps:
1. Create a free account at [huggingface.co](https://huggingface.co/).
2. Navigate to **Spaces** → **Create new Space**.
   - **Space Name**: `trendsprout-ai-service`
   - **License**: `MIT`
   - **Space SDK**: Select **Docker** (Blank)
   - **Space Hardware**: Free tier (2 vCPU · 16 GB RAM)
3. Push the contents of `python-ai-service/` directly into your Hugging Face Space repository:
   ```bash
   cd python-ai-service
   git init
   git remote add space https://huggingface.co/spaces/<your-hf-username>/trendsprout-ai-service
   git add .
   git commit -m "Deploy TRENDSPROUT CV microservice"
   git push space main
   ```
4. Once built, Hugging Face provides your public HTTPS URL:
   `https://<your-hf-username>-trendsprout-ai-service.hf.space`

---

## 3. Backend Deployment (Render)

1. Push your repository to GitHub.
2. Sign in to [render.com](https://render.com/) with GitHub.
3. Click **New +** → **Web Service**.
4. Connect your GitHub repository.
5. Configure the service:
   - **Name**: `trendsprout-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
6. Under **Environment Variables**, add:
   - `PORT` = `5000`
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = `your_super_secret_jwt_key_2026`
   - `MONGODB_URI` = `your_mongodb_atlas_connection_string`
   - `PYTHON_AI_URL` = `https://<your-hf-username>-trendsprout-ai-service.hf.space`
7. Click **Deploy Web Service**.
   - Your API will be live at `https://trendsprout-backend.onrender.com`.

---

## 4. Frontend Deployment (Vercel)

1. Sign in to [vercel.com](https://vercel.com/) with GitHub.
2. Click **Add New…** → **Project**.
3. Import your GitHub repository.
4. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   - `VITE_API_URL` = `https://trendsprout-backend.onrender.com/api`
6. Click **Deploy**.
   - Your live e-commerce marketplace will be accessible globally via your unique `.vercel.app` domain with instant SSL and CDN caching!

---

## 5. Local Testing Commands

To run all 3 tiers locally:

```bash
# Terminal 1: Node.js Express Backend
cd backend
npm install
npm run dev

# Terminal 2: Python Computer Vision Service
cd python-ai-service
pip install -r requirements.txt
python main.py

# Terminal 3: Vite React Frontend
cd frontend
npm install
npm run dev
```
