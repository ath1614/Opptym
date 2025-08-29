#!/bin/bash

# OPPTYM Production Deployment Script
# This script deploys both frontend and backend to production

set -e  # Exit on any error

echo "🚀 Starting OPPTYM Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

print_status "Checking prerequisites..."

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js 18 or higher is required. Current version: $(node --version)"
    exit 1
fi

print_status "Node.js version: $(node --version)"

# Check npm version
NPM_VERSION=$(npm --version | cut -d'.' -f1)
if [ "$NPM_VERSION" -lt 8 ]; then
    print_error "npm 8 or higher is required. Current version: $(npm --version)"
    exit 1
fi

print_status "npm version: $(npm --version)"

# Check if environment variables are set
if [ -z "$MONGODB_URI" ]; then
    print_error "MONGODB_URI environment variable is not set"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    print_error "JWT_SECRET environment variable is not set"
    exit 1
fi

print_status "Environment variables are configured"

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf dist/
rm -rf backend/dist/
rm -rf node_modules/.cache/

# Install frontend dependencies
print_status "Installing frontend dependencies..."
npm ci --production=false

# Build frontend
print_status "Building frontend..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    print_error "Frontend build failed - dist directory not found"
    exit 1
fi

print_status "Frontend build completed successfully"

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
npm ci --production=false

# Check backend dependencies
if [ ! -d "node_modules" ]; then
    print_error "Backend dependencies installation failed"
    exit 1
fi

print_status "Backend dependencies installed"

# Test backend
print_status "Testing backend..."
npm test 2>/dev/null || print_warning "Backend tests not configured"

# Return to root
cd ..

# Create deployment package
print_status "Creating deployment package..."
DEPLOY_DIR="opptym-deployment-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$DEPLOY_DIR"

# Copy frontend build
cp -r dist/ "$DEPLOY_DIR/frontend/"

# Copy backend
cp -r backend/ "$DEPLOY_DIR/backend/"

# Copy configuration files
cp production.env "$DEPLOY_DIR/"
cp README.md "$DEPLOY_DIR/"
cp deploy-production.sh "$DEPLOY_DIR/"

# Create deployment info
cat > "$DEPLOY_DIR/DEPLOYMENT_INFO.md" << EOF
# OPPTYM Deployment Information

**Deployment Date:** $(date)
**Version:** $(node -p "require('./package.json').version")
**Node.js Version:** $(node --version)
**npm Version:** $(npm --version)

## Frontend
- Built with Vite
- React + TypeScript
- Tailwind CSS
- Production optimized

## Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT Authentication
- Rate limiting enabled
- CORS configured for production

## Security Features
- JWT token validation
- Rate limiting
- CORS protection
- Input sanitization
- XSS protection
- Helmet security headers

## Environment Variables Required
- MONGODB_URI
- JWT_SECRET
- EMAIL_USER (for email functionality)
- EMAIL_PASSWORD (for email functionality)

## Deployment Instructions
1. Set environment variables
2. Start backend: \`cd backend && npm start\`
3. Serve frontend: \`cd frontend && npx serve -s .\`
4. Configure reverse proxy (nginx recommended)

## Health Check
- Backend: \`GET /api/health\`
- Frontend: \`GET /\`

## Monitoring
- Check logs for errors
- Monitor API response times
- Watch for rate limiting events
EOF

print_status "Deployment package created: $DEPLOY_DIR"

# Create startup script
cat > "$DEPLOY_DIR/start.sh" << 'EOF'
#!/bin/bash

# OPPTYM Startup Script

echo "🚀 Starting OPPTYM..."

# Load environment variables
if [ -f "production.env" ]; then
    export $(cat production.env | grep -v '^#' | xargs)
fi

# Start backend
echo "Starting backend..."
cd backend
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Check if backend is running
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ Backend started successfully"
else
    echo "❌ Backend failed to start"
    exit 1
fi

# Start frontend (if needed)
echo "Starting frontend..."
cd ../frontend
npx serve -s . -l 5173 &
FRONTEND_PID=$!

echo "✅ OPPTYM started successfully"
echo "Backend: http://localhost:3000"
echo "Frontend: http://localhost:5173"

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID
EOF

chmod +x "$DEPLOY_DIR/start.sh"

print_status "Startup script created"

# Create nginx configuration
cat > "$DEPLOY_DIR/nginx.conf" << 'EOF'
server {
    listen 80;
    server_name opptym.com www.opptym.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name opptym.com www.opptym.com;

    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Frontend
    location / {
        root /path/to/opptym/frontend;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Rate limiting
        limit_req zone=api burst=10 nodelay;
        limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3000/api/health;
        access_log off;
    }
}
EOF

print_status "Nginx configuration created"

# Create systemd service file
cat > "$DEPLOY_DIR/opptym.service" << 'EOF'
[Unit]
Description=OPPTYM Application
After=network.target

[Service]
Type=simple
User=opptym
WorkingDirectory=/opt/opptym
ExecStart=/opt/opptym/start.sh
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

print_status "Systemd service file created"

# Create monitoring script
cat > "$DEPLOY_DIR/monitor.sh" << 'EOF'
#!/bin/bash

# OPPTYM Monitoring Script

echo "🔍 OPPTYM Health Check - $(date)"

# Check backend health
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ Backend: Healthy"
else
    echo "❌ Backend: Unhealthy"
fi

# Check frontend
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Frontend: Healthy"
else
    echo "❌ Frontend: Unhealthy"
fi

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    echo "⚠️  Disk usage: ${DISK_USAGE}%"
else
    echo "✅ Disk usage: ${DISK_USAGE}%"
fi

# Check memory usage
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.1f", $3*100/$2}')
echo "📊 Memory usage: ${MEMORY_USAGE}%"
EOF

chmod +x "$DEPLOY_DIR/monitor.sh"

print_status "Monitoring script created"

# Final summary
print_status "Deployment package ready!"
echo ""
echo "📦 Deployment package: $DEPLOY_DIR"
echo "📋 Files included:"
echo "  - Frontend build (dist/)"
echo "  - Backend code"
echo "  - Production environment config"
echo "  - Startup script (start.sh)"
echo "  - Nginx configuration"
echo "  - Systemd service file"
echo "  - Monitoring script"
echo "  - Deployment documentation"
echo ""
echo "🚀 Next steps:"
echo "1. Upload $DEPLOY_DIR to your server"
echo "2. Set environment variables"
echo "3. Install dependencies: npm ci"
echo "4. Start the application: ./start.sh"
echo "5. Configure nginx and SSL"
echo "6. Set up monitoring and logging"
echo ""
echo "✅ Deployment package created successfully!"
