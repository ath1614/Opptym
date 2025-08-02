# 🚀 OPPTYM Deployment Guide

This guide will help you deploy OPPTYM to production while keeping it accessible for development.

## 📋 Prerequisites

- GitHub account
- Railway account (free tier)
- Vercel account (free tier)
- MongoDB Atlas account (free tier)

## 🗄️ Step 1: Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for free tier
   - Create a new cluster

2. **Configure Database**
   - Create a database user with read/write permissions
   - Get your connection string
   - Whitelist your IP (or use 0.0.0.0/0 for all IPs)

3. **Connection String Format**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/opptym?retryWrites=true&w=majority
   ```

## 🔧 Step 2: Backend Deployment (Railway)

1. **Prepare Backend**
   ```bash
   cd backend
   npm install
   ```

2. **Deploy to Railway**
   - Go to [Railway](https://railway.app)
   - Connect your GitHub repository
   - Select the `backend` folder
   - Set environment variables:
     ```
     NODE_ENV=production
     MONGODB_URI=your_mongodb_atlas_connection_string
     JWT_SECRET=your_super_secure_jwt_secret
     PORT=5050
     ```

3. **Get Backend URL**
   - Railway will provide a URL like: `https://opptym-backend.railway.app`
   - Save this URL for frontend configuration

## 🌐 Step 3: Frontend Deployment (Vercel)

1. **Prepare Frontend**
   ```bash
   npm install
   ```

2. **Create Environment File**
   ```bash
   cp env.example .env
   ```
   Edit `.env`:
   ```
   VITE_API_URL=https://opptym-backend.railway.app/api
   ```

3. **Deploy to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Connect your GitHub repository
   - Set build settings:
     - Framework Preset: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Add environment variable:
     ```
     VITE_API_URL=https://opptym-backend.railway.app/api
     ```

## 🔄 Step 4: Development Workflow

### Local Development
```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
npm run dev
```

### Production Updates
1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Update description"
   git push origin main
   ```

2. **Automatic Deployment**
   - Railway will auto-deploy backend changes
   - Vercel will auto-deploy frontend changes

### Environment Variables

#### Backend (Railway)
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
PORT=5050
```

#### Frontend (Vercel)
```
VITE_API_URL=https://opptym-backend.railway.app/api
```

## 🧪 Step 5: Testing Deployment

1. **Test Backend**
   ```bash
   curl https://opptym-backend.railway.app/health
   ```

2. **Test Frontend**
   - Visit your Vercel URL
   - Test login/signup
   - Test all features

3. **Test API Connection**
   - Open browser dev tools
   - Check network requests
   - Verify API calls work

## 🔧 Step 6: Custom Domain (Optional)

### Backend Domain
1. In Railway dashboard
2. Go to Settings → Domains
3. Add custom domain
4. Update CORS settings in `server.js`

### Frontend Domain
1. In Vercel dashboard
2. Go to Settings → Domains
3. Add custom domain
4. Update environment variables

## 🛠️ Step 7: Monitoring & Maintenance

### Railway Monitoring
- View logs in Railway dashboard
- Monitor resource usage
- Set up alerts

### Vercel Monitoring
- View analytics in Vercel dashboard
- Monitor performance
- Check build status

### Database Monitoring
- Monitor MongoDB Atlas dashboard
- Set up alerts for storage/performance
- Regular backups

## 🔒 Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] MongoDB connection is secure
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Environment variables are set
- [ ] HTTPS is enabled
- [ ] Database user has minimal permissions

## 🚨 Troubleshooting

### Backend Issues
```bash
# Check Railway logs
railway logs

# Test database connection
railway run node -e "console.log(process.env.MONGODB_URI)"
```

### Frontend Issues
```bash
# Check build logs in Vercel
# Verify environment variables
# Test API endpoints
```

### Common Issues
1. **CORS Errors**: Check CORS configuration in `server.js`
2. **Database Connection**: Verify MongoDB URI and network access
3. **Build Failures**: Check Node.js version and dependencies
4. **API Errors**: Verify environment variables and endpoints

## 📞 Support

- **Railway**: [Railway Discord](https://discord.gg/railway)
- **Vercel**: [Vercel Support](https://vercel.com/support)
- **MongoDB**: [MongoDB Support](https://www.mongodb.com/support)

## 🎉 Success!

Your OPPTYM application is now deployed and ready for production use while maintaining full development capabilities! 