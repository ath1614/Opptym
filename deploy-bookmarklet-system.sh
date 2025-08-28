#!/bin/bash

# 🚀 OPPTYM Bookmarklet Token System Deployment Script
# This script deploys the complete bookmarklet token system to production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Configuration
ENVIRONMENT=${1:-production}
BACKEND_DIR="backend"
FRONTEND_DIR="."
DATABASE_NAME="opptym"

log_info "🚀 Starting OPPTYM Bookmarklet Token System Deployment"
log_info "Environment: $ENVIRONMENT"
echo ""

# Step 1: Pre-deployment checks
log_info "Step 1: Pre-deployment checks"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    log_error "npm is not installed"
    exit 1
fi

# Check if required files exist
required_files=(
    "$BACKEND_DIR/models/bookmarkletTokenModel.js"
    "$BACKEND_DIR/controllers/bookmarkletController.js"
    "$BACKEND_DIR/routes/bookmarkletRoutes.js"
    "$FRONTEND_DIR/src/services/UniversalFormService.ts"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        log_error "Required file not found: $file"
        exit 1
    fi
done

log_success "All required files found"

# Check if backend server is running
if curl -s http://localhost:3000/api/test-simple > /dev/null 2>&1; then
    log_warning "Backend server is already running on port 3000"
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Deployment cancelled"
        exit 0
    fi
fi

echo ""

# Step 2: Backend deployment
log_info "Step 2: Backend deployment"

cd "$BACKEND_DIR"

# Install dependencies
log_info "Installing backend dependencies..."
npm install

# Check for syntax errors
log_info "Checking syntax..."
node -c models/bookmarkletTokenModel.js
node -c controllers/bookmarkletController.js
node -c routes/bookmarkletRoutes.js
log_success "Backend syntax check passed"

# Environment variables check
if [ ! -f ".env" ]; then
    log_warning ".env file not found, creating template..."
    cat > .env << EOF
# OPPTYM Backend Environment Variables
NODE_ENV=$ENVIRONMENT
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/opptym
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRE=30d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password

# Bookmarklet Configuration
BOOKMARKLET_DEFAULT_EXPIRY=24
BOOKMARKLET_DEFAULT_USAGE_LIMIT=10
BOOKMARKLET_RATE_LIMIT=5
EOF
    log_warning "Please update .env file with your actual values"
fi

cd ..

echo ""

# Step 3: Frontend deployment
log_info "Step 3: Frontend deployment"

# Install frontend dependencies
log_info "Installing frontend dependencies..."
npm install

# Check for TypeScript errors
log_info "Checking TypeScript compilation..."
npx tsc --noEmit --skipLibCheck
log_success "Frontend TypeScript check passed"

echo ""

# Step 4: Database migration
log_info "Step 4: Database migration"

# Create migration script
cat > migrate-bookmarklet.js << 'EOF'
const mongoose = require('mongoose');
require('dotenv').config();

async function migrateBookmarkletSystem() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Create BookmarkletToken collection
        const BookmarkletToken = require('./backend/models/bookmarkletTokenModel');
        
        // Create indexes
        console.log('📊 Creating database indexes...');
        await BookmarkletToken.createIndexes();
        console.log('✅ Database indexes created');

        // Verify collection exists
        const collections = await mongoose.connection.db.listCollections().toArray();
        const bookmarkletCollection = collections.find(c => c.name === 'bookmarklettokens');
        
        if (bookmarkletCollection) {
            console.log('✅ BookmarkletToken collection exists');
        } else {
            console.log('⚠️ BookmarkletToken collection not found, will be created on first use');
        }

        console.log('🎉 Database migration completed successfully');
    } catch (error) {
        console.error('❌ Database migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

migrateBookmarkletSystem();
EOF

# Run migration
log_info "Running database migration..."
node migrate-bookmarklet.js
log_success "Database migration completed"

# Clean up migration script
rm migrate-bookmarklet.js

echo ""

# Step 5: Testing
log_info "Step 5: Testing deployment"

# Run the test suite
log_info "Running test suite..."
node test-bookmarklet-system.js

if [ $? -eq 0 ]; then
    log_success "All tests passed"
else
    log_error "Some tests failed"
    read -p "Do you want to continue with deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Deployment cancelled due to test failures"
        exit 1
    fi
fi

echo ""

# Step 6: Start services
log_info "Step 6: Starting services"

# Start backend server
log_info "Starting backend server..."
cd "$BACKEND_DIR"
nohup npm start > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
log_info "Waiting for backend to start..."
sleep 5

# Check if backend is running
if curl -s http://localhost:3000/api/test-simple > /dev/null 2>&1; then
    log_success "Backend server started successfully (PID: $BACKEND_PID)"
else
    log_error "Backend server failed to start"
    exit 1
fi

# Start frontend server
log_info "Starting frontend server..."
nohup npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to start
log_info "Waiting for frontend to start..."
sleep 10

# Check if frontend is running
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    log_success "Frontend server started successfully (PID: $FRONTEND_PID)"
else
    log_error "Frontend server failed to start"
    exit 1
fi

echo ""

# Step 7: Final verification
log_info "Step 7: Final verification"

# Test bookmarklet endpoints
log_info "Testing bookmarklet endpoints..."

# Test token validation endpoint
VALIDATION_RESPONSE=$(curl -s -X POST http://localhost:3000/api/bookmarklet/validate \
    -H "Content-Type: application/json" \
    -d '{"token": "test-token"}')

if echo "$VALIDATION_RESPONSE" | grep -q '"success":false'; then
    log_success "Bookmarklet validation endpoint working"
else
    log_error "Bookmarklet validation endpoint not working"
    exit 1
fi

# Test frontend
FRONTEND_RESPONSE=$(curl -s http://localhost:5173)
if echo "$FRONTEND_RESPONSE" | grep -q "opptym"; then
    log_success "Frontend working correctly"
else
    log_error "Frontend not working correctly"
    exit 1
fi

echo ""

# Step 8: Deployment summary
log_info "Step 8: Deployment summary"

log_success "🎉 OPPTYM Bookmarklet Token System deployed successfully!"
echo ""
echo "📊 Deployment Summary:"
echo "  • Backend Server: http://localhost:3000 (PID: $BACKEND_PID)"
echo "  • Frontend Server: http://localhost:5173 (PID: $FRONTEND_PID)"
echo "  • Database: MongoDB connected"
echo "  • Tests: All passed"
echo ""
echo "🔧 Available Endpoints:"
echo "  • POST /api/bookmarklet/generate - Generate new token"
echo "  • POST /api/bookmarklet/validate - Validate token"
echo "  • GET  /api/bookmarklet/tokens - Get user tokens"
echo "  • DELETE /api/bookmarklet/tokens/:id - Deactivate token"
echo "  • GET  /api/bookmarklet/analytics - Get analytics"
echo ""
echo "📝 Logs:"
echo "  • Backend: backend.log"
echo "  • Frontend: frontend.log"
echo ""
echo "🛠️ Management Commands:"
echo "  • Stop backend: kill $BACKEND_PID"
echo "  • Stop frontend: kill $FRONTEND_PID"
echo "  • View logs: tail -f backend.log frontend.log"
echo "  • Run tests: node test-bookmarklet-system.js"
echo ""

# Save PIDs for later use
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid

log_success "Deployment completed successfully!"
log_info "The bookmarklet token system is now protecting your revenue streams! 🚀"
