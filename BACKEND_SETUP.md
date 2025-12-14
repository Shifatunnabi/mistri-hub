# MistriHub Backend Setup Guide

## 📦 Installed Packages

### Core Dependencies
- **next-auth@beta** - Authentication system
- **bcryptjs** - Password hashing
- **mongoose** - MongoDB ODM
- **nodemailer** - Email service for password reset
- **socket.io** - Real-time chat server
- **socket.io-client** - Real-time chat client
- **@google/generative-ai** - Gemini AI integration

### Dev Dependencies
- **@types/bcryptjs** - TypeScript types
- **@types/nodemailer** - TypeScript types

---

## 🔑 Environment Variables Setup

### 1. MongoDB Database
**Get MongoDB URI:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get connection string
4. Replace in `.env.local`: `MONGODB_URI`

### 2. NextAuth Secret
**Generate Secret Key:**
```bash
# Run in terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output to `NEXTAUTH_SECRET`

### 3. Cloudinary (Image Upload)
**Setup:**
1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for free account
3. Get Cloud Name, API Key, API Secret from dashboard
4. Add to `.env.local`

### 4. Gmail SMTP (Password Reset Emails)
**Setup App Password:**
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification
3. Go to "App passwords"
4. Generate password for "Mail"
5. Use this password in `SMTP_PASS`

### 5. Google Maps API (Optional)
**Setup:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Maps JavaScript API
3. Create API Key
4. Add to `.env.local`

---

## 🚀 Implementation Phases

### ✅ Phase 0: Setup (COMPLETED)
- [x] Environment variables configured
- [x] Dependencies installed
- [x] Project structure ready

### 🔄 Phase 1: Core Authentication (NEXT)
- [ ] MongoDB connection
- [ ] User model (Help Seeker, Helper, Admin)
- [ ] NextAuth configuration
- [ ] Registration endpoints (with admin approval for Helpers)
- [ ] Login/Logout
- [ ] Password reset with NodeMailer
- [ ] Protected routes

### 📋 Upcoming Phases
- Phase 2: Job Management & AI Integration
- Phase 3: Application & Hiring System
- Phase 4: Helper Verification System
- Phase 5: Real-time Chat (Socket.io)
- Phase 6: Reviews & Ratings
- Phase 7: Admin Dashboard

---

## 🎯 Key Decisions Made

1. **Payment:** Cash on Delivery (COD) - No payment gateway
2. **Password Recovery:** NodeMailer with email OTP
3. **NID Verification:** Manual by admin
4. **Session Management:** Default NextAuth sessions
5. **Chat:** Socket.io for real-time features
6. **Notifications:** Not implemented (future consideration)
7. **Map Links:** Convert Google Maps share links to embedded format

---

## 📂 Folder Structure (To Be Created)

```
app/
  api/
    auth/
    jobs/
    helpers/
    admin/
    upload/
    ai/
lib/
  mongodb.ts
  auth.ts
  validations/
  utils/
models/
  User.ts
  Job.ts
  Application.ts
  Review.ts
  Chat.ts
```

---

## 🔐 Security Considerations

- Passwords hashed with bcryptjs (10 rounds)
- Role-based access control (CLIENT, HELPER, ADMIN)
- Admin approval required for Helper registration
- Manual document verification for Helper badges
- Protected API routes with NextAuth
- Input validation with Zod schemas

---

## 📝 Next Steps

1. Fill in your actual credentials in `.env.local`
2. Test MongoDB connection
3. Start Phase 1 implementation

**Ready to code!** 🚀
