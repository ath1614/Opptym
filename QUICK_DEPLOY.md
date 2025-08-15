# ⚡ Quick Deployment Guide

## 🚀 **Deploy OPPTYM in 10 Minutes**

### **Step 1: Install Tools (2 minutes)**
```bash
# Install Vercel CLI
npm install -g vercel

# Install Railway CLI  
npm install -g @railway/cli
```

### **Step 2: Set Up MongoDB Atlas (3 minutes)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free account
3. Create free cluster
4. Add database user (save password!)
5. Allow access from anywhere
6. Copy connection string

### **Step 3: Deploy Backend (2 minutes)**
```bash
cd backend
railway login
railway init
railway variables set MONGODB_URI="your-mongodb-connection-string"
railway variables set JWT_SECRET="your-secret-key"
railway up
railway domain  # Save this URL!
```

### **Step 4: Deploy Frontend (2 minutes)**
```bash
cd ..
vercel login
vercel --prod
# Add environment variable in Vercel dashboard:
# VITE_API_URL = http://zc4ck4k48gwk0wko44gosgs4.77.37.44.119.sslip.io/api
```

### **Step 5: Configure CORS (1 minute)**
```bash
# In Railway dashboard, add:
FRONTEND_URL=https://your-vercel-url.vercel.app
```

## 🎉 **Done! Your app is live!**

**Frontend**: `https://your-project.vercel.app`  
**Backend**: `http://zc4ck4k48gwk0wko44gosgs4.77.37.44.119.sslip.io`

---

## 🔧 **Quick Commands**

```bash
# Run automated deployment script
./deploy.sh

# Check backend health
curl http://zc4ck4k48gwk0wko44gosgs4.77.37.44.119.sslip.io/api/health

# View Railway logs
railway logs

# Redeploy frontend
vercel --prod
```

## 📞 **Need Help?**

- **Full Guide**: See `DEPLOYMENT_GUIDE.md`
- **Troubleshooting**: Check the troubleshooting section in the full guide
- **Common Issues**: CORS errors, environment variables, database connection 