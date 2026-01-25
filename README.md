# 🌐 Immigration Pro - Complete MERN Stack Application

A comprehensive immigration services platform with profile building, assessment tools, and client management system.

## 📁 Project Structure

```
immigration_project/
├── frontend/                    # Frontend Application
│   ├── public/                  # Static Assets
│   │   ├── css/                 # Stylesheets
│   │   └── js/                  # Client-side JavaScript
│   ├── views/                   # HTML Templates
│   │   ├── pages/               # Main Pages
│   │   ├── auth/                # Authentication Pages
│   │   └── dashboard/           # Admin Dashboard Pages
│   ├── server.js                # Frontend Express Server
│   └── package.json             # Frontend Dependencies
├── backend/                     # Backend API
│   ├── controllers/             # Route Controllers
│   ├── models/                  # MongoDB Models
│   ├── routes/                  # API Routes
│   ├── middleware/              # Custom Middleware
│   ├── uploads/                 # File Uploads
│   ├── server.js                # Backend Express Server
│   └── package.json             # Backend Dependencies
├── documentation/               # All Documentation Files
├── tests/                       # Test Files
├── scripts/                     # Utility Scripts
├── .gitignore                   # Git Configuration
├── package.json                 # Root Package Configuration
├── package-lock.json            # Lock File
└── README.md                    # Main Project Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd immigration_project
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**
   ```bash
   cd ../backend
   cp .env.example .env
   # Edit .env with your MongoDB connection string and other settings
   ```

### Running the Application

1. **Start Backend Server** (Terminal 1)
   ```bash
   cd backend
   npm run dev
   ```
   Backend runs on: http://localhost:5000

2. **Start Frontend Server** (Terminal 2)
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs on: http://localhost:3000

## 🌟 Features

### Frontend Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Service Pages**: EB-1A, EB-2 NIW, O-1 Visa information
- **Profile Assessment**: Interactive assessment tool
- **Client Portal**: Secure login and dashboard
- **Admin Dashboard**: Complete admin control panel after login
- **Contact Forms**: Secure contact and appointment scheduling

### Backend Features
- **RESTful API**: Complete CRUD operations
- **Authentication**: JWT-based secure authentication
- **Database**: MongoDB with Mongoose ODM
- **File Uploads**: Secure file handling
- **Form Processing**: Contact, assessment, and appointment forms
- **Security**: CORS, rate limiting, input validation

## 📊 Available Routes

### Frontend Routes
- `/` - Homepage
- `/login` - Client Login
- `/signup` - Client Signup
- `/dashboard` - Client Dashboard
- `/admin` - Admin Dashboard (after admin login)
- `/manager` - Manager Dashboard
- `/crm` - CRM Manager Dashboard
- `/assessment` - Profile Assessment
- `/schedule` - Schedule Appointment
- `/eb1a` - EB-1A Information
- `/eb2-niw` - EB-2 NIW Information
- `/o1-visa` - O-1 Visa Information
- `/profile-building` - Profile Building
- `/attorneys` - Attorney Referrals
- `/faq` - FAQ
- `/pricing` - Pricing

### Backend API Routes
- `POST /api/auth/register` - User Registration
- `POST /api/auth/login` - User Login
- `GET /api/auth/profile` - Get User Profile
- `POST /api/contact` - Contact Form Submission
- `POST /api/assessment` - Profile Assessment
- `POST /api/appointment` - Schedule Appointment
- `GET /api/admin/clients` - Admin: Get All Clients
- `GET /api/admin/assessments` - Admin: Get All Assessments

## 🔧 Development

### Frontend Development
```bash
cd frontend
npm run dev  # Starts with nodemon for auto-reload
```

### Backend Development
```bash
cd backend
npm run dev  # Starts with nodemon for auto-reload
```

### Testing
```bash
# Frontend tests
cd tests/frontend
# Open HTML test files in browser

# Backend tests
cd tests/backend
node test-api-direct.js
```

## 🛡️ Security Features

- **Input Validation**: All forms validated on client and server
- **CSRF Protection**: Cross-site request forgery protection
- **Rate Limiting**: API rate limiting to prevent abuse
- **Secure Headers**: Security headers implemented
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security

## 📱 Responsive Design

- **Mobile-First**: Optimized for mobile devices
- **Tablet Support**: Responsive design for tablets
- **Desktop**: Full desktop experience
- **Cross-Browser**: Compatible with modern browsers

## 🗄️ Database Schema

### Collections
- **users**: Client accounts and profiles
- **assessments**: Profile assessment submissions
- **appointments**: Appointment bookings
- **contacts**: Contact form submissions
- **admins**: Admin user accounts
- **managers**: Manager accounts
- **clients**: Client management data
- **profiles**: Detailed client profiles
- **documents**: Document management
- **notifications**: System notifications
- **audit_logs**: System audit trail
- **settings**: Application settings

## 🚀 Deployment

### Production Setup
1. Set environment variables
2. Build frontend assets
3. Configure reverse proxy (nginx)
4. Set up SSL certificates
5. Configure MongoDB production instance

### Environment Variables
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
PORT=5000
FRONTEND_URL=https://yourdomain.com
```

## 📚 Documentation

All documentation files are organized in the `documentation/` folder:
- API Documentation
- Setup Guides
- Feature Documentation
- Testing Guides
- System Architecture

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the [documentation](documentation/)
- Review [test files](tests/) for examples
- Contact the development team

---

**Status**: ✅ Production Ready
**Last Updated**: January 25, 2026