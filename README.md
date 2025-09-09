# OPPTYM - AI Powered Automation Platform

A comprehensive SEO automation platform that helps businesses submit to directories, analyze SEO performance, and manage projects efficiently.

## 🚀 Features

- **Directory Submissions**: Automated submission to multiple business directories
- **SEO Tools**: Comprehensive SEO analysis and optimization tools
- **Project Management**: Create and manage multiple business projects
- **Subscription Plans**: Free trial with upgrade options for advanced features
- **Admin Panel**: Complete admin interface for managing users and directories
- **Bookmarklet**: One-click form filling for directory submissions

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for API calls
- **React Router** for navigation

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Stripe** for payments
- **Nodemailer** for email
- **Puppeteer** for automation

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Stripe account (for payments)

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp env.example .env

# Start development server
npm run dev

# Start production server
npm start
```

## 🔧 Environment Variables

### Frontend (.env)
```env
VITE_API_URL=https://api.opptym.com
```

### Backend (.env)
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/opptym

# JWT
JWT_SECRET=your-jwt-secret-key

# Email (Hostinger SMTP)
EMAIL_USER=your-email@opptym.com
EMAIL_PASSWORD=your-email-password

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Server
PORT=3000
NODE_ENV=production
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables

### Backend (Coolify/Hostinger VPS)
1. Deploy to your VPS via Coolify panel
2. Set environment variables in Coolify
3. Configure domain: `api.opptym.com`
4. Set up SSL certificates

### Manual Deployment
```bash
# Frontend
npm run build
# Upload dist/ folder to your hosting

# Backend
cd backend
npm install
npm start
```

## 📊 Subscription Plans

- **Free Trial**: 3 days, 5 submissions, 2 projects, 10 SEO tools
- **Starter**: $29/month, 150 submissions, 5 projects, 100 SEO tools
- **Pro**: $79/month, 750 submissions, 15 projects, 500 SEO tools
- **Business**: $199/month, 1500 submissions, 50 projects, 1000 SEO tools
- **Enterprise**: Custom pricing, unlimited usage

## 🔍 Health Check

Check deployment status:
- Frontend: `https://opptym.com`
- Backend: `https://api.opptym.com/api/health`
- Version: `https://api.opptym.com/api/health/version`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Projects
- `GET /api/projects` - List user projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Submissions
- `GET /api/submissions` - List submissions
- `POST /api/submissions` - Create submission
- `GET /api/submissions/:id` - Get submission details

### SEO Tools
- `POST /api/tools/:projectId/run-meta` - Meta tag analysis
- `POST /api/tools/:projectId/run-keyword-density` - Keyword analysis
- `POST /api/tools/:projectId/run-backlinks` - Backlink analysis

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/directories` - List directories
- `POST /api/admin/directories` - Add directory

## 🔐 Security

- JWT authentication for all protected routes
- Rate limiting on API endpoints
- CORS configured for production domains
- Input validation and sanitization
- Helmet.js for security headers

## 📈 Monitoring

- Health check endpoints for uptime monitoring
- Error logging and monitoring
- Performance metrics tracking
- User activity analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Email: support@opptym.com
- Documentation: https://docs.opptym.com
- Issues: GitHub Issues

---

**OPPTYM** - Making SEO automation simple and effective.
# Deployment trigger Tue Sep  9 09:39:18 IST 2025
