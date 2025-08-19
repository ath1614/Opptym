# OPPTYM Authentication Debug Guide

## Issues Fixed

### 1. Token Decoding Error
**Problem**: `Cannot read properties of undefined (reading 'split')`
**Solution**: 
- Improved token validation in `useAuth.ts`
- Added proper base64url decoding
- Better error handling for malformed tokens

### 2. OTP Verification Not Working
**Problem**: OTP popup not appearing after login
**Solution**:
- Fixed OTP flow in login/register functions
- Added proper error handling and logging
- Improved popup management

### 3. 401 Unauthorized Errors
**Problem**: Multiple API calls failing with 401
**Solution**:
- Enhanced authentication middleware
- Better token validation
- Improved error handling in axios interceptors

### 4. JWT Token Issues
**Problem**: Token validation and decoding problems
**Solution**:
- Added fallback JWT secret
- Improved token format validation
- Better payload validation

## Testing Steps

### 1. Test Authentication Flow
```bash
# Start the backend server
cd backend
npm start

# In another terminal, run the auth test
cd backend
node scripts/testAuth.js
```

### 2. Test Frontend Authentication
1. Open the application in browser
2. Try to register a new account
3. Check if OTP popup appears
4. Verify the OTP flow works
5. Test login with existing account
6. Verify dashboard loads without errors

### 3. Check Console Logs
Look for these log messages:
- `🔐 Login attempt:` - Login process started
- `✅ OTP generated successfully` - OTP sent
- `🔐 Verifying OTP...` - OTP verification in progress
- `✅ OTP verified successfully` - OTP verified
- `✅ Login successful!` - Login completed

### 4. Debug Token Issues
Check browser console for:
- `🔍 Token is null, undefined, or not a string`
- `🔍 Invalid JWT token format`
- `🔍 Token has expired`
- `🔍 Invalid token payload`

## Common Issues and Solutions

### Issue: OTP Not Received
**Check**:
1. Email configuration in `backend/config/emailConfig.js`
2. Environment variables `EMAIL_USER` and `EMAIL_PASSWORD`
3. SMTP settings for Hostinger

**Solution**:
```javascript
// Check email config status
GET /api/test-email-config
GET /api/test-smtp
```

### Issue: Token Decoding Fails
**Check**:
1. JWT secret in environment variables
2. Token format in localStorage
3. Token expiration

**Solution**:
```javascript
// Clear invalid token
localStorage.removeItem('token');
// Refresh page
window.location.reload();
```

### Issue: 401 Errors on Protected Routes
**Check**:
1. Token in Authorization header
2. Token validity
3. User status in database

**Solution**:
```javascript
// Check token format
const token = localStorage.getItem('token');
console.log('Token format:', token?.split('.').length === 3);
```

## Environment Variables

### Backend (.env)
```env
PORT=5050
NODE_ENV=development
MONGODB_URI=mongodb+srv://...
JWT_SECRET=opptym-super-secret-jwt-key-2024-production-ready
FRONTEND_URL=https://opptym.com
EMAIL_USER=your-email@opptym.com
EMAIL_PASSWORD=your-email-password
```

### Frontend (.env)
```env
VITE_API_URL=https://api.opptym.com
```

## API Endpoints

### Authentication
- `POST /api/otp/signup/generate` - Generate signup OTP
- `POST /api/otp/signup/verify` - Verify signup OTP
- `POST /api/otp/login/generate` - Generate login OTP
- `POST /api/otp/login/verify` - Verify login OTP
- `GET /api/auth/profile` - Get user profile (protected)

### Testing
- `GET /api/health` - Health check
- `GET /api/test-jwt` - JWT configuration test
- `GET /api/test-email-config` - Email configuration test
- `GET /api/test-smtp` - SMTP connection test

## Debugging Commands

### Check Server Status
```bash
curl https://api.opptym.com/api/health
```

### Test JWT Configuration
```bash
curl https://api.opptym.com/api/test-jwt
```

### Test Email Configuration
```bash
curl https://api.opptym.com/api/test-email-config
```

### Test SMTP Connection
```bash
curl https://api.opptym.com/api/test-smtp
```

## Manual Testing Steps

1. **Clear Browser Data**
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   window.location.reload();
   ```

2. **Test Registration**
   - Go to registration page
   - Enter valid email and password
   - Check if OTP popup appears
   - Verify OTP (check console for mock email)
   - Confirm account creation

3. **Test Login**
   - Go to login page
   - Enter credentials
   - Check if OTP popup appears
   - Verify OTP
   - Confirm dashboard loads

4. **Test Protected Routes**
   - Navigate to different sections
   - Check for 401 errors
   - Verify user data loads correctly

## Production Checklist

- [ ] JWT_SECRET is properly set
- [ ] Email configuration is working
- [ ] MongoDB connection is stable
- [ ] CORS is configured correctly
- [ ] Rate limiting is appropriate
- [ ] Error handling is comprehensive
- [ ] Logging is sufficient for debugging
- [ ] Token validation is robust
- [ ] OTP flow is working end-to-end
- [ ] Protected routes are secure

## Emergency Fixes

### If Authentication Completely Breaks
1. Clear all browser data
2. Restart backend server
3. Check MongoDB connection
4. Verify environment variables
5. Run authentication tests

### If OTP Not Working
1. Check email configuration
2. Verify SMTP settings
3. Test email sending manually
4. Check OTP routes are loaded

### If Tokens Not Working
1. Verify JWT_SECRET is set
2. Check token format
3. Validate token expiration
4. Test JWT configuration endpoint
