#!/bin/bash

# 🚀 OPPTYM Deployment Script
# This script helps automate the deployment process

set -e  # Exit on any error

echo "🚀 Starting OPPTYM Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    
    print_success "All requirements met!"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install frontend dependencies
    print_status "Installing frontend dependencies..."
    npm install
    
    # Install backend dependencies
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    
    print_success "Dependencies installed successfully!"
}

# Build frontend
build_frontend() {
    print_status "Building frontend..."
    npm run build
    print_success "Frontend built successfully!"
}

# Deploy to Railway
deploy_backend() {
    print_status "Deploying backend to Railway..."
    
    if ! command -v railway &> /dev/null; then
        print_warning "Railway CLI not found. Installing..."
        npm install -g @railway/cli
    fi
    
    cd backend
    
    # Check if already logged in
    if ! railway whoami &> /dev/null; then
        print_status "Please login to Railway..."
        railway login
    fi
    
    print_status "Deploying to Railway..."
    railway up
    
    cd ..
    print_success "Backend deployed to Railway!"
}

# Deploy to Vercel
deploy_frontend() {
    print_status "Deploying frontend to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    # Check if already logged in
    if ! vercel whoami &> /dev/null; then
        print_status "Please login to Vercel..."
        vercel login
    fi
    
    print_status "Deploying to Vercel..."
    vercel --prod
    
    print_success "Frontend deployed to Vercel!"
}

# Main deployment function
main() {
    echo "🎯 OPPTYM Deployment Script"
    echo "=========================="
    
    # Check requirements
    check_requirements
    
    # Install dependencies
    install_dependencies
    
    # Build frontend
    build_frontend
    
    # Ask user which deployment they want
    echo ""
    echo "Choose deployment option:"
    echo "1) Deploy Backend to Railway"
    echo "2) Deploy Frontend to Vercel"
    echo "3) Deploy Both"
    echo "4) Exit"
    echo ""
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            deploy_backend
            ;;
        2)
            deploy_frontend
            ;;
        3)
            deploy_backend
            deploy_frontend
            ;;
        4)
            print_status "Exiting..."
            exit 0
            ;;
        *)
            print_error "Invalid choice. Please run the script again."
            exit 1
            ;;
    esac
    
    echo ""
    print_success "Deployment completed successfully!"
    echo ""
    echo "🎉 Next steps:"
    echo "1. Set up MongoDB Atlas database"
    echo "2. Configure environment variables in Railway and Vercel"
    echo "3. Test your deployed application"
    echo ""
    echo "📖 For detailed instructions, see: DEPLOYMENT_GUIDE.md"
}

# Run main function
main "$@" 