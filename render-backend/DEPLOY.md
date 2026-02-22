# Render.com Deployment Guide

This backend is ready to deploy to **Render.com** in 5 minutes with zero configuration!

## Quick Deployment Steps

### 1. Prepare Your GitHub Repository
```bash
cd render-backend
git init
git add .
git commit -m "Initial backend setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/haber-site-backend.git
git push -u origin main
```

### 2. Create Render Account & Service
1. Visit [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Select your GitHub repository (haber-site-backend)
5. Configure settings:
   - **Name**: `haber-site-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

### 3. Set Environment Variables
In Render dashboard, go to your service's "Environment" tab and add:

```
PORT=3000
JWT_SECRET=your-very-long-random-secret-key-min-32-chars
NODE_ENV=production
```

**Generate a secure JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Deploy!
- Render will automatically deploy when you push to main
- Wait 2-3 minutes for initial build
- Check "Logs" tab for deployment status

### 5. Test Your Backend
Once deployed, test health check:
```bash
curl https://your-app-name.onrender.com/api/health
```

You should see:
```json
{"status": "ok", "message": "Backend is running"}
```

## Environment Details

| Variable | Purpose | Example |
|----------|---------|---------|
| PORT | Server port (auto-assigned by Render) | 3000 |
| JWT_SECRET | Secret key for JWT tokens | (64-char hex string) |
| NODE_ENV | Environment mode | production |

## Data Storage

- **User data**: Stored in `data/users.json`
- **News articles**: Stored in `data/news.json`
- Files auto-create on first run
- Data persists between restarts

## Available API Endpoints

### Authentication
- `POST /api/kayit` - Register new user
- `POST /api/giris` - Login user
- `GET /api/profil` - Get current user (requires token)

### News
- `GET /api/haberler` - Get all news
- `GET /api/haberler/:id` - Get single news
- `GET /api/haberler/kategori/:category` - Filter by category
- `POST /api/haberler` - Create news (requires token)

### Interactions
- `POST /api/haberler/:id/begen` - Like/unlike article
- `POST /api/haberler/:id/paylas` - Share article
- `POST /api/haberler/:id/yorum` - Add comment
- `GET /api/haberler/:id/yorumlar` - Get comments

### User Follow
- `POST /api/kullanicilar/:userId/takip` - Follow/unfollow user
- `GET /api/kullanicilar/:userId` - Get user profile

### Health
- `GET /api/health` - Check if backend is running

## Example API Calls

### Register
```bash
curl -X POST https://your-app.onrender.com/api/kayit \
  -H "Content-Type: application/json" \
  -d '{
    "ad_soyad": "Ahmet Yılmaz",
    "email": "ahmet@example.com",
    "sifre": "securepassword123"
  }'
```

### Login
```bash
curl -X POST https://your-app.onrender.com/api/giris \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmet@example.com",
    "sifre": "securepassword123"
  }'
```

### Get All News
```bash
curl https://your-app.onrender.com/api/haberler
```

## Troubleshooting

### "Service Crashed"
1. Check Render dashboard "Logs"
2. Verify all environment variables are set
3. Check that JWT_SECRET is at least 32 characters

### "Cannot POST /api/kayit"
- Make sure you're using `https://` not `http://`
- Check that backend is fully deployed (green status in Render)

### "CORS Error"
- Backend already has CORS enabled globally
- Frontend must use `https://` URLs

## Important Notes

⚠️ **First Deployment**: Initial deployment takes 2-3 minutes while Render builds your app

⚠️ **Free Tier**: Service will spin down after 15 minutes of inactivity. Cold start takes ~30 seconds.

✅ **Data Persistence**: JSON files persist on Render during service lifetime

✅ **Auto-Deploy**: Every push to `main` branch triggers automatic redeploy

## Frontend URL

Once backend is deployed, use this URL in your frontend:
```javascript
const API_URL = 'https://your-app-name.onrender.com/api';
```

Render assigns you a permanent URL like: `https://haber-site-backend.onrender.com`

---

Need help? Check Render docs: https://render.com/docs
