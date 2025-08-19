# OPPTYM Coolify Deployment Guide

## 🚀 **Deployment Overview**

Your OPPTYM application is hosted on a VPS through Coolify with:
- **Frontend**: `opptym-frontend`
- **Backend**: `opptym-backend`

## 📋 **Pre-Deployment Checklist**

### **Backend (opptym-backend)**

1. **Update Code**
   - Apply all the authentication fixes I provided
   - Ensure all files are committed to your repository

2. **Environment Variables** (Set in Coolify Panel)
   ```env
   # Required Environment Variables
   JWT_SECRET=opptym-super-secret-jwt-key-2024-production-ready
   MONGODB_URI=mongodb+srv://lowlife9366:x6TX9HuAvESb3DJD@opptym.tkcz5nx.mongodb.net/?retryWrites=true&w=majority&appName=opptym
   NODE_ENV=production
   PORT=5050
   
   # Email Configuration (Optional - for OTP emails)
   EMAIL_USER=your-email@opptym.com
   EMAIL_PASSWORD=your-email-password
   
   # Frontend URL
   FRONTEND_URL=https://opptym.com
   
   # API Configuration
   API_BASE_URL=https://api.opptym.com
   ```

3. **Build Configuration**
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Port**: `5050`

### **Frontend (opptym-frontend)**

1. **Update Code**
   - Apply all the frontend fixes I provided
   - Ensure the API URL points to your backend

2. **Environment Variables** (Set in Coolify Panel)
   ```env
   # API Configuration
   VITE_API_URL=https://api.opptym.com
   
   # App Configuration
   VITE_APP_NAME=OPPTYM
   VITE_APP_VERSION=1.0.0
   ```

3. **Build Configuration**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Port**: `80` (or as configured)

## 🔧 **Deployment Steps**

### **Step 1: Update Backend**

1. **Access Coolify Dashboard**
   - Go to your Coolify panel
   - Navigate to `opptym-backend` service

2. **Update Environment Variables**
   - Go to "Environment Variables" section
   - Add/update all required variables listed above
   - **Important**: Ensure `JWT_SECRET` is set correctly

3. **Redeploy Backend**
   - Click "Redeploy" or "Build & Deploy"
   - Monitor the build logs for any errors
   - Wait for deployment to complete

### **Step 2: Update Frontend**

1. **Access Coolify Dashboard**
   - Navigate to `opptym-frontend` service

2. **Update Environment Variables**
   - Set `VITE_API_URL` to your backend URL
   - Ensure all variables are properly configured

3. **Redeploy Frontend**
   - Click "Redeploy" or "Build & Deploy"
   - Monitor the build process
   - Wait for deployment to complete

### **Step 3: Test Deployment**

1. **Run Production Tests**
   ```bash
   # Update the URLs in the test script first
   node backend/scripts/testCoolifyProduction.js
   ```

2. **Manual Testing**
   - Visit your frontend URL
   - Test registration flow
   - Test login flow
   - Verify OTP functionality

## 🧪 **Testing Your Deployment**

### **Automated Testing**

Run the Coolify-specific test script:

```bash
# Navigate to your backend directory
cd backend

# Install dependencies if needed
npm install

# Run the production test
node scripts/testCoolifyProduction.js
```

### **Manual Testing Checklist**

1. **Frontend Accessibility**
   - [ ] Frontend loads without errors
   - [ ] No console errors in browser
   - [ ] All pages are accessible

2. **Authentication Flow**
   - [ ] Registration form works
   - [ ] OTP popup appears after registration
   - [ ] Login form works
   - [ ] OTP popup appears after login
   - [ ] Dashboard loads after successful authentication

3. **Protected Routes**
   - [ ] No 401 errors on dashboard
   - [ ] User data loads correctly
   - [ ] All sections are accessible

4. **Error Handling**
   - [ ] Invalid credentials show proper errors
   - [ ] Network errors are handled gracefully
   - [ ] Token expiration is handled properly

## 🔍 **Troubleshooting Coolify Deployment**

### **Common Issues**

1. **Build Failures**
   ```bash
   # Check build logs in Coolify dashboard
   # Common issues:
   # - Missing environment variables
   # - Dependency installation failures
   # - Port conflicts
   ```

2. **Environment Variable Issues**
   ```bash
   # Verify all required variables are set
   # Check for typos in variable names
   # Ensure values are properly quoted
   ```

3. **Network Connectivity**
   ```bash
   # Test backend connectivity
   curl https://api.opptym.com/api/health
   
   # Test frontend connectivity
   curl https://opptym.com
   ```

4. **CORS Issues**
   ```bash
   # Check CORS configuration
   curl -H "Origin: https://opptym.com" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS https://api.opptym.com/api/otp/signup/generate
   ```

### **Coolify-Specific Debugging**

1. **Check Service Logs**
   - Go to Coolify dashboard
   - Navigate to your service
   - Click on "Logs" tab
   - Look for error messages

2. **Check Resource Usage**
   - Monitor CPU and memory usage
   - Ensure sufficient resources are allocated

3. **Check Network Configuration**
   - Verify ports are correctly configured
   - Check firewall settings
   - Ensure proper domain routing

## 📊 **Monitoring Your Deployment**

### **Health Checks**

1. **Backend Health**
   ```bash
   curl https://api.opptym.com/api/health
   ```

2. **Frontend Health**
   ```bash
   curl https://opptym.com
   ```

3. **Authentication Health**
   ```bash
   # Test OTP generation
   curl -X POST https://api.opptym.com/api/otp/signup/generate \
        -H "Content-Type: application/json" \
        -d '{"email":"test@example.com"}'
   ```

### **Performance Monitoring**

1. **Response Times**
   - Monitor API response times
   - Check frontend load times
   - Track authentication flow performance

2. **Error Rates**
   - Monitor 401/403 errors
   - Track OTP verification failures
   - Check for token validation errors

## 🚨 **Emergency Procedures**

### **If Authentication Breaks**

1. **Check Environment Variables**
   ```bash
   # Verify JWT_SECRET is set
   # Check MONGODB_URI is correct
   # Ensure EMAIL configuration is valid
   ```

2. **Restart Services**
   - Restart backend service in Coolify
   - Restart frontend service if needed
   - Clear any cached data

3. **Rollback if Necessary**
   - Use Coolify's rollback feature
   - Revert to previous working version
   - Investigate what caused the issue

### **If OTP Not Working**

1. **Check Email Configuration**
   ```bash
   # Test email configuration
   curl https://api.opptym.com/api/test-email-config
   
   # Test SMTP connection
   curl https://api.opptym.com/api/test-smtp
   ```

2. **Check OTP Routes**
   ```bash
   # Test OTP generation
   curl -X POST https://api.opptym.com/api/otp/signup/generate \
        -H "Content-Type: application/json" \
        -d '{"email":"test@example.com"}'
   ```

### **If Frontend Can't Connect to Backend**

1. **Check API URL**
   - Verify `VITE_API_URL` is correct
   - Ensure backend is accessible
   - Check CORS configuration

2. **Check Network**
   - Verify DNS resolution
   - Check firewall rules
   - Ensure proper routing

## ✅ **Post-Deployment Verification**

### **Final Checklist**

- [ ] Backend is accessible and responding
- [ ] Frontend loads without errors
- [ ] Registration flow works end-to-end
- [ ] Login flow works end-to-end
- [ ] OTP verification is functional
- [ ] Protected routes are accessible
- [ ] No 401 errors in console
- [ ] All environment variables are set
- [ ] Production tests pass
- [ ] Error handling works properly

### **Success Indicators**

1. **Console Logs**
   - No authentication errors
   - Successful OTP generation
   - Proper token validation
   - Clean API responses

2. **User Experience**
   - Smooth registration process
   - Quick login flow
   - Responsive dashboard
   - No unexpected errors

## 📈 **Next Steps**

1. **Monitor Performance**
   - Track authentication success rates
   - Monitor API response times
   - Check error logs regularly

2. **User Testing**
   - Test with real users
   - Gather feedback on authentication flow
   - Monitor for any issues

3. **Security Review**
   - Regular security audits
   - Monitor for suspicious activity
   - Keep dependencies updated

Your OPPTYM application should now be fully functional with robust authentication on your Coolify VPS deployment!
