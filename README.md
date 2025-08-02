# 🚀 OPPTYM - AI Powered SEO Automation

OPPTYM is a comprehensive SEO automation platform that helps businesses scale their SEO efforts through intelligent automation, directory submissions, and advanced analytics.

## ✨ Features

- 🤖 **AI-Powered Automation** - Smart form filling and submission automation
- 📊 **SEO Analytics** - Comprehensive SEO tools and reporting
- 📁 **Directory Management** - Automated directory submissions
- 👥 **User Management** - Role-based access control
- 📈 **Real-time Dashboard** - Live analytics and project tracking
- 🔒 **Secure Authentication** - JWT-based security
- 📱 **Responsive Design** - Works on all devices

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Router** for navigation

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Helmet** for security

### Deployment
- **Vercel** for frontend hosting
- **Railway** for backend hosting
- **MongoDB Atlas** for database

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/opptym.git
   cd opptym
   ```

2. **Install dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. **Set up environment variables**
   ```bash
   # Frontend
   cp env.example .env
   
   # Backend
   cd backend
   cp env.example .env
   cd ..
   ```

4. **Start development servers**
   ```bash
   # Terminal 1: Backend
   cd backend
   npm run dev
   
   # Terminal 2: Frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5050

## 🚀 Deployment

### Quick Deployment
```bash
# Run the deployment script
npm run deploy
```

### Manual Deployment
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 📁 Project Structure

```
opptym/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and API
│   ├── utils/             # Helper functions
│   └── App.tsx            # Main app component
├── backend/               # Backend source code
│   ├── controllers/       # Route controllers
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   └── server.js         # Main server file
├── public/               # Static assets
├── dist/                 # Build output
└── docs/                 # Documentation
```

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```env
VITE_API_URL=https://your-backend-url.com/api
VITE_APP_NAME=OPPTYM
```

#### Backend (.env)
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
PORT=5050
```

## 🧪 Testing

### Create Sample Data
1. Login to the application
2. Click "Create Sample Data" button
3. Test all features with sample projects

### API Testing
```bash
# Health check
curl https://your-backend-url.com/health

# Test authentication
curl -X POST https://your-backend-url.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- Helmet security headers
- Input validation

## 📊 Monitoring

- Railway dashboard for backend monitoring
- Vercel dashboard for frontend analytics
- MongoDB Atlas for database monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/opptym/issues)
- **Email**: support@opptym.com

## 🎉 Acknowledgments

- Built with ❤️ by the OPPTYM team
- Powered by modern web technologies
- Deployed on Railway and Vercel

---

**OPPTYM** - Transform your SEO strategy with intelligent automation! 🚀 