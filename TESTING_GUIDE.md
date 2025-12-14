# 🚀 Quick Start Guide - Phase 1 Testing

## Prerequisites Setup

### 1. Install MongoDB (if not already installed)

**Option A: MongoDB Community Edition (Recommended)**
Download from: https://www.mongodb.com/try/download/community

**Option B: MongoDB Compass (GUI + Server)**
Download from: https://www.mongodb.com/try/download/compass

After installation, MongoDB should be running on `localhost:27017`

---

## Step-by-Step Testing

### Step 1: Start Development Server
```bash
cd "F:\Marcopolo Projects\mistri-hub"
npm run dev
```

Server will start at: http://localhost:3000

---

### Step 2: Create Admin User

#### Method 1: MongoDB Compass (Easy)
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Create database: `mistri-hub`
4. Create collection: `users`
5. Insert this document:

```json
{
  "name": "Admin User",
  "email": "admin@mistrihub.com",
  "password": "$2b$10$5gOj6CRT3DVMuNsXNLQ0K.ZbiVnQAtYXtztfGXKYCQtk7kB/aynHa",
  "phone": "01700000000",
  "address": "Dhaka, Bangladesh",
  "role": "ADMIN",
  "isApproved": true,
  "isVerified": false,
  "isBanned": false,
  "profilePhoto": "",
  "createdAt": { "$date": "2025-12-11T04:02:54.670Z" },
  "updatedAt": { "$date": "2025-12-11T04:02:54.670Z" }
}
```

**Admin Login:**
- Email: `admin@mistrihub.com`
- Password: `admin123`

---

### Step 3: Test Help Seeker Registration

1. Go to: http://localhost:3000/register
2. Click **"Register as Help Seeker"**
3. Fill the form:
   ```
   Name: Test User
   Email: test@example.com
   Phone: 01712345678
   Address: Dhaka, Bangladesh
   Password: password123
   Confirm Password: password123
   ```
4. Click "Create Account"
5. ✅ Should see success message
6. ✅ Redirected to login page

---

### Step 4: Test Help Seeker Login

1. Go to: http://localhost:3000/login
2. Enter:
   ```
   Email: test@example.com
   Password: password123
   ```
3. Click "Sign In"
4. ✅ Should log in successfully
5. ✅ Redirected to job board
6. ✅ Navbar shows avatar with "T" initial
7. ✅ Logout button visible

---

### Step 5: Test Helper Registration

1. Logout if logged in
2. Go to: http://localhost:3000/register
3. Click **"Register as Helper"**
4. Fill the form:
   ```
   Name: Helper Mike
   Email: helper@example.com
   Phone: 01798765432
   Address: Chittagong, Bangladesh
   NID Number: 1234567890123
   Password: password123
   Confirm Password: password123
   ```
5. Click "Register as Helper"
6. ✅ Success message: "Pending admin approval"
7. ✅ Redirected to login page

---

### Step 6: Test Helper Login (Should Fail)

1. Go to: http://localhost:3000/login
2. Enter helper credentials:
   ```
   Email: helper@example.com
   Password: password123
   ```
3. Click "Sign In"
4. ❌ Should show error: **"Account pending admin approval"**

---

### Step 7: Admin Approves Helper

#### Method A: Using MongoDB Compass
1. Open `mistri-hub` database
2. Find `users` collection
3. Find helper with email: `helper@example.com`
4. Edit document, change:
   ```json
   "isApproved": true
   ```
5. Save

#### Method B: Using Admin API (After creating admin page)
Will be implemented in admin dashboard

---

### Step 8: Helper Login (Should Success)

1. Go to: http://localhost:3000/login
2. Enter helper credentials:
   ```
   Email: helper@example.com
   Password: password123
   ```
3. ✅ Should log in successfully now!

---

### Step 9: Test Forgot Password

1. Go to: http://localhost:3000/login
2. Click **"Forgot password?"**
3. Enter email: `test@example.com`
4. Click "Send Reset Link"
5. ✅ Success message shown
6. 📧 Check email inbox (if SMTP configured correctly)
7. Click reset link in email
8. Enter new password
9. ✅ Password reset successful
10. Login with new password

---

### Step 10: Test Logout

1. When logged in, click "Logout" in navbar
2. ✅ Toast: "Logged out successfully"
3. ✅ Redirected to home page
4. ✅ Navbar shows Login/Register buttons

---

## 📊 Verify in MongoDB

After testing, check your `mistri-hub` database:

### users collection should have:
- 1 ADMIN user
- 1 HELP_SEEKER user (test@example.com)
- 1 HELPER user (helper@example.com with isApproved: true)

### passwordresets collection:
- May have reset tokens (they auto-expire after 15 min)

---

## 🐛 Troubleshooting

### Issue: Can't connect to MongoDB
```bash
# Check if MongoDB service is running
# Windows:
net start MongoDB

# Or start manually:
# Navigate to MongoDB bin folder and run:
mongod --dbpath "C:\data\db"
```

### Issue: Email not sending
- Check `.env.local` has correct SMTP credentials
- Test SMTP connection manually
- For now, you can skip email testing

### Issue: "Invalid email or password"
- Make sure you're using the correct credentials
- Password is case-sensitive
- Email is stored in lowercase

### Issue: Session not working
- Clear browser cookies
- Restart dev server
- Check if `NEXTAUTH_SECRET` is set in `.env.local`

---

## ✅ Success Checklist

- [ ] MongoDB running locally
- [ ] Dev server running on localhost:3000
- [ ] Admin user created
- [ ] Help Seeker can register
- [ ] Help Seeker can login
- [ ] Helper registration shows "pending approval"
- [ ] Helper can't login before approval
- [ ] Helper can login after approval
- [ ] Forgot password flow works
- [ ] Logout works
- [ ] Navbar shows user info when logged in

---

## 🎯 What's Next?

Once Phase 1 testing is complete, we'll move to:

**Phase 2: Job Management**
- Job posting with Cloudinary images
- AI solution generation with Gemini
- Job board display
- Job filters and search

**Ready to test!** 🚀
