#!/bin/bash

# OPPTYM Development Server Startup Script
echo "🚀 Starting OPPTYM Backend Server..."

# Set environment variables
export MONGODB_URI="mongodb://localhost:27017/opptym"
export JWT_SECRET="opptym-development-jwt-secret-key-2024"
export NODE_ENV="development"
export PORT="3000"
export EMAIL_USER="mock@opptym.com"
export EMAIL_PASSWORD="mock-password"

echo "✅ Environment variables set:"
echo "   MONGODB_URI: $MONGODB_URI"
echo "   NODE_ENV: $NODE_ENV"
echo "   PORT: $PORT"
echo ""

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB doesn't appear to be running."
    echo "   Please start MongoDB with: brew services start mongodb-community@7.0"
    echo ""
fi

# Start the server
echo "🔧 Starting server..."
node server.js
