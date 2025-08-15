# 🚀 OPPTYM Deployment Guide

## 📋 **Overview**
This guide will help you deploy OPPTYM to production using:
- **Frontend**: Vercel (Free tier)
- **Backend**: Railway (Free tier)
- **Database**: MongoDB Atlas (Free tier)

---

## 🎯 **Step 1: Prepare Your Environment**

### **1.1 Install Required Tools**
```bash
# Install Node.js (if not already installed)
# Download from: https://nodejs.org/

# Install Git (if not already installed)
# Download from: https://git-scm.com/

# Install Vercel CLI
npm install -g vercel

# Install Railway CLI
npm install -g @railway/cli
```

### **1.2 Verify Your Setup**
```bash
# Check Node.js version (should be >= 18)
node --version

# Check npm version
npm --version

# Check Git version
git --version

# Check Vercel CLI
vercel --version

# Check Railway CLI
railway --version
```

---

## 🗄️ **Step 2: Set Up MongoDB Atlas (Database)**

### **2.1 Create MongoDB Atlas Account**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" and create an account
3. Choose "Free" tier (M0)
4. Select your preferred cloud provider and region

### **2.2 Create Database Cluster**
1. Click "Build a Database"
2. Choose "FREE" tier
3. Select cloud provider (AWS/Google Cloud/Azure)
4. Choose region (closest to your users)
5. Click "Create"

### **2.3 Set Up Database Access**
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and password (save these!)
5. Select "Read and write to any database"
6. Click "Add User"

### **2.4 Set Up Network Access**
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for deployment)
4. Click "Confirm"

### **2.5 Get Connection String**
1. Go to "Database" in the left sidebar
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password
6. Save this connection string for later

---

## ⚙️ **Step 3: Deploy Backend to Railway**

### **3.1 Create Railway Account**
1. Go to [Railway](https://railway.app/)
2. Sign up with GitHub
3. Complete the setup

### **3.2 Deploy Backend**
```bash
# Navigate to backend directory
cd backend

# Login to Railway
railway login

# Initialize Railway project
railway init

# Add environment variables
railway variables set MONGODB_URI="your-mongodb-atlas-connection-string"
railway variables set JWT_SECRET="your-super-secret-jwt-key"
railway variables set NODE_ENV="production"
railway variables set FRONTEND_URL="https://your-frontend-domain.vercel.app"

# Deploy to Railway
railway up

# Get your deployment URL
railway domain
```

### **3.3 Verify Backend Deployment**
1. Visit your Railway URL + `/api/health`
2. Should see: `{"status":"OK","message":"OPPTYM Backend is running"}`
3. Save this URL for frontend configuration

---

## 🎨 **Step 4: Deploy Frontend to Vercel**

### **4.1 Create Vercel Account**
1. Go to [Vercel](https://vercel.com/)
2. Sign up with GitHub
3. Complete the setup

### **4.2 Deploy Frontend**
```bash
# Navigate to frontend directory (root of project)
cd ..

# Login to Vercel
vercel login

# Deploy to Vercel
vercel --prod

# Follow the prompts:
# - Set up and deploy: Yes
# - Which scope: Select your account
# - Link to existing project: No
# - Project name: opptym-frontend
# - Directory: ./ (current directory)
# - Override settings: No
```

### **4.3 Configure Environment Variables**
1. Go to your Vercel dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add: `VITE_API_URL` = `http://zc4ck4k48gwk0wko44gosgs4.77.37.44.119.sslip.io/api`
5. Redeploy: Go to "Deployments" → "Redeploy"

---

## 🔧 **Step 5: Final Configuration**

### **5.1 Update Backend CORS**
```bash
# Go back to Railway dashboard
# Add environment variable:
FRONTEND_URL=https://your-vercel-frontend-url.vercel.app
```

### **5.2 Test Your Deployment**
1. **Frontend**: Visit your Vercel URL
2. **Backend**: Visit your Railway URL + `/api/health`
3. **Database**: Check MongoDB Atlas dashboard for data

### **5.3 Create Admin User**
```bash
# Run this script to create an admin user
cd backend
node scripts/makeTestUserAdmin.js
```

---

## 🎉 **Step 6: Your Live Application**

### **Frontend URL**: `https://your-project.vercel.app`
### **Backend URL**: `https://your-project.railway.app`
### **Database**: MongoDB Atlas (managed)

---

## 🔍 **Troubleshooting**

### **Common Issues:**

#### **1. Backend Not Starting**
```bash
# Check Railway logs
railway logs

# Verify environment variables
railway variables
```

#### **2. Frontend Can't Connect to Backend**
- Check `VITE_API_URL` in Vercel environment variables
- Verify backend is running (check Railway logs)
- Test backend health endpoint

#### **3. Database Connection Issues**
- Verify MongoDB Atlas connection string
- Check network access settings
- Ensure database user has correct permissions

#### **4. CORS Errors**
- Update `FRONTEND_URL` in Railway environment variables
- Redeploy backend after changes

### **Useful Commands:**
```bash
# Check Railway status
railway status

# View Railway logs
railway logs

# Redeploy backend
railway up

# Check Vercel deployment
vercel ls

# Redeploy frontend
vercel --prod
```

---

## 📞 **Support**

If you encounter issues:
1. Check the troubleshooting section above
2. Review Railway and Vercel documentation
3. Check MongoDB Atlas status page
4. Verify all environment variables are set correctly

---

## 🎯 **Next Steps**

After successful deployment:
1. Set up custom domain (optional)
2. Configure monitoring and alerts
3. Set up automated backups
4. Implement CI/CD pipeline
5. Add SSL certificates (handled by Vercel/Railway)

---

**🎉 Congratulations! Your OPPTYM application is now live!** 