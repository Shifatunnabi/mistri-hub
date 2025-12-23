# MistriHub 🛠️

A modern platform connecting help seekers with trusted local helpers for everyday tasks - plumbing, repairs, furniture assembly, and more. Built with Next.js 14, TypeScript, and MongoDB.

## 🌟 Overview

MistriHub is a comprehensive service marketplace that bridges the gap between people needing help with everyday tasks and skilled local helpers. The platform provides a secure, user-friendly environment for posting jobs, finding helpers, managing tasks, and building trust through reviews and verification.

## ✨ Key Features

### For Help Seekers
- 📋 **Job Posting**: Create detailed job posts with photos, budget, location, and descriptions
- 🔍 **Helper Discovery**: Browse and search verified helpers by skills and ratings
- 💬 **Real-time Communication**: Chat with helpers to discuss job details
- ⭐ **Review System**: Rate and review helpers after job completion
- 📊 **Job Tracking**: Monitor job status from posting to completion
- 📱 **Profile Management**: Manage personal information and view job history

### For Helpers
- 🎯 **Job Applications**: Browse and apply for jobs matching your skills
- ✅ **Verification System**: Get verified with NID and certificates
- 📈 **Performance Tracking**: Monitor ratings, completed jobs, and earnings
- 🔔 **Smart Notifications**: Receive alerts for new jobs and applications
- 👤 **Public Profile**: Showcase skills, experience, and reviews
- 📅 **Schedule Management**: Track assigned, scheduled, and completed jobs

### For Administrators
- 👥 **User Management**: Manage both helpers and help seekers
- ✔️ **Helper Approval**: Review and approve helper applications
- 🛡️ **Verification Control**: Verify helper documents and certificates
- 📢 **Announcements**: Create platform-wide announcements with priority levels
- 🚨 **Moderation**: Review reports and take action against policy violations
- 📊 **Analytics Dashboard**: Real-time statistics on users, jobs, and platform activity
- 🏷️ **Category Management**: Add and manage service categories
- 🚫 **Ban System**: Ban/unban users with proper confirmation dialogs

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: React Hooks
- **Forms**: React Hook Form with Zod validation
- **Notifications**: React Hot Toast & Sonner

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js with Credentials Provider
- **Password Hashing**: bcryptjs
- **File Upload**: Custom upload API with validation

### Additional Tools
- **Icons**: Lucide React
- **Date Handling**: JavaScript Date API
- **Email**: Nodemailer (for password reset)
- **Analytics**: Vercel Analytics

## 📁 Project Structure

```
mistri-hub/
├── app/                          # Next.js 14 App Router
│   ├── api/                      # API Routes
│   │   ├── admin/               # Admin-only endpoints
│   │   ├── auth/                # Authentication endpoints
│   │   ├── helper/              # Helper-specific endpoints
│   │   ├── jobs/                # Job management endpoints
│   │   ├── reviews/             # Review system endpoints
│   │   └── user/                # User management endpoints
│   ├── admin/                   # Admin panel pages
│   │   ├── announcements/       # Announcement management
│   │   ├── categories/          # Category management
│   │   ├── helpers/             # Helper management
│   │   ├── help-seekers/        # Help seeker management
│   │   ├── moderation/          # Moderation & reports
│   │   └── verification/        # Helper verification
│   ├── job-board/               # Job board page
│   ├── jobs/                    # Job detail pages
│   ├── profile/                 # User profile pages
│   ├── register/                # Registration pages
│   └── ...                      # Other pages
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   ├── job-board/               # Job board components
│   ├── profile/                 # Profile components
│   └── ...                      # Shared components
├── lib/                         # Utility functions
│   ├── auth.ts                  # NextAuth configuration
│   ├── mongodb.ts               # Database connection
│   ├── email.ts                 # Email utilities
│   └── utils.ts                 # Helper functions
├── models/                      # Mongoose schemas
│   ├── User.ts                  # User model
│   ├── Job.ts                   # Job model
│   ├── Review.ts                # Review model
│   ├── Application.ts           # Application model
│   ├── Report.ts                # Report model
│   ├── Announcement.ts          # Announcement model
│   └── ...                      # Other models
├── scripts/                     # Utility scripts
│   └── create-admin.js          # Admin creation script
├── public/                      # Static assets
└── types/                       # TypeScript definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB database (local or Atlas)
- npm or pnpm package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mistri-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/mistri-hub
   # or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mistri-hub

   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl

   # Email (for password reset)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password

   # Cloudinary (optional, for image uploads)
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

   Generate NEXTAUTH_SECRET:
   ```bash
   openssl rand -base64 32
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### 👨‍💼 Creating an Admin Account

Run the admin creation script:

```bash
node scripts/create-admin.js
```

**Default Admin Credentials:**
- Email: `admin@mistrihub.com`
- Password: `Admin@123`

After creation:
1. Login at [http://localhost:3000/login](http://localhost:3000/login)
2. Access admin panel at [http://localhost:3000/admin](http://localhost:3000/admin)
3. **Important**: Change your password after first login!

To customize admin credentials, edit `scripts/create-admin.js` before running.

## 📱 User Roles

### Help Seeker
- Post jobs and hire helpers
- Review completed jobs
- Manage job postings
- **Registration**: Open to all users

### Helper
- Apply for jobs
- Complete tasks and earn reviews
- Build reputation through verification
- **Registration**: Requires admin approval

### Admin
- Full platform access
- User and content moderation
- System configuration
- **Creation**: Via script only (see above)

## 🔑 Key Workflows

### Job Lifecycle
1. **Open** - Help seeker posts a job
2. **Assigned** - Helper applies and gets assigned
3. **Scheduled** - Helper schedules the job
4. **In Progress** - Job is being worked on
5. **Pending Review** - Waiting for confirmation
6. **Completed** - Job finished and reviewed

### Helper Verification
1. Helper registers and gets approved
2. Helper submits NID and certificates
3. Admin reviews verification documents
4. Helper gets verified badge on approval

### Report & Moderation
1. User reports inappropriate behavior
2. Report shows in admin moderation panel
3. Admin reviews report and user profile
4. Admin can ban/unban users as needed

## 🎨 Features Highlight

### Dynamic Statistics
- Real-time dashboard with live data from MongoDB
- Total users, active helpers, completed jobs
- Pending approvals with visual indicators

### Search & Filter
- Search help seekers by name/email
- Search helpers by name/email/skills
- Filter jobs by status, category, location

### Notification System
- Real-time notifications for job updates
- Application status changes
- Review notifications
- Priority-based announcements

### Currency & Localization
- BDT (৳) currency support
- Experience display in years
- Date formatting for Bangladesh locale

## 🔒 Security Features

- Password hashing with bcryptjs
- Protected API routes with authentication
- Role-based access control (RBAC)
- Ban system for policy violations
- Secure file upload with validation
- Session management with NextAuth.js

## 🧪 Building for Production

```bash
npm run build
npm start
```

## 📝 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `NEXTAUTH_SECRET` | Secret for session encryption | Yes |
| `EMAIL_USER` | Email for sending notifications | Optional |
| `EMAIL_PASSWORD` | Email password/app password | Optional |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Optional |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Optional |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Optional |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For issues, questions, or suggestions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in `/docs` (if available)

## 🎯 Roadmap

- [ ] Real-time chat system
- [ ] Payment gateway integration
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] SMS notifications
- [ ] Helper availability calendar
- [ ] Advanced search filters
- [ ] Helper badge system
- [ ] Referral program

---

**Built with ❤️ for the MistriHub community**
