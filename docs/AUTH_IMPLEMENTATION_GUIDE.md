# 🔐 Authentication Implementation Guide

## ✅ What's Been Implemented

### **1. Dependencies Added**
```json
{
  "dependencies": {
    "@next-auth/mongodb-adapter": "^1.1.3",
    "bcryptjs": "^2.4.3",
    "mongodb": "^6.3.0",
    "next-auth": "^4.24.5"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6"
  }
}
```

### **2. Files Created**

#### **Database & Auth Core:**
- `lib/mongodb.ts` - MongoDB connection utility
- `pages/api/auth/[...nextauth].ts` - NextAuth configuration
- `pages/api/auth/signup.ts` - User registration endpoint

#### **UI Components:**
- `components/LoginModal.tsx` - Login modal with form
- `components/SignupModal.tsx` - Signup modal with form

#### **Updated Pages:**
- `pages/_app.tsx` - Wrapped with SessionProvider
- `pages/landing.tsx` - Added Login/Signup buttons

#### **Documentation:**
- `frontend/ENV_SETUP.md` - Environment variables guide
- `AUTH_IMPLEMENTATION_GUIDE.md` - This file

### **3. Features Implemented**

✅ **Email/Password Authentication**
- Secure password hashing (bcrypt)
- Email validation
- Password strength requirements (min 8 chars)
- Duplicate email prevention

✅ **Beautiful UI**
- Modal-based login/signup
- Responsive design
- Error handling with user feedback
- Smooth transitions

✅ **Session Management**
- JWT-based sessions
- Auto-login after signup
- Persistent sessions across page refreshes
- Secure session storage

✅ **Landing Page Integration**
- Login/Signup buttons (top right)
- Shows "Dashboard" button when logged in
- Modal toggling between login/signup

## 🚀 Setup Instructions

### **Step 1: Install Dependencies**

```bash
cd frontend
npm install
```

### **Step 2: Setup MongoDB Atlas**

1. **Create Account** → [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. **Create Cluster** → Free M0 tier
3. **Create Database User:**
   - Username: `interviewbot-admin`
   - Password: Generate strong password
4. **Network Access:**
   - Allow access from anywhere (0.0.0.0/0) for development
5. **Get Connection String:**
   ```
   mongodb+srv://interviewbot-admin:<password>@cluster0.xxxxx.mongodb.net/interviewbot?retryWrites=true&w=majority
   ```

### **Step 3: Create Environment File**

Create `frontend/.env.local`:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/interviewbot

# NextAuth
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# Backend
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

Generate secret:
```bash
openssl rand -base64 32
```

### **Step 4: Start Development Server**

```bash
npm run dev
```

Visit: `http://localhost:3000`

### **Step 5: Test Authentication**

1. Click "Sign Up" on landing page
2. Create an account with email/password
3. Auto-login and redirect to `/upload`
4. Check MongoDB Atlas → Collections → `users`

## 📊 Database Schema

### **Users Collection**
```typescript
{
  _id: ObjectId,
  email: string (lowercase, unique),
  password: string (bcrypt hashed),
  name: string,
  createdAt: Date,
  interviewHistory: Array<InterviewHistoryItem>
}
```

### **Sessions Collection** (NextAuth managed)
```typescript
{
  sessionToken: string,
  userId: ObjectId,
  expires: Date
}
```

## 🔄 Authentication Flow

```
1. User clicks "Sign Up" → Opens SignupModal
2. Enter email, password, name → Submit form
3. POST /api/auth/signup
   - Validate input
   - Check if user exists
   - Hash password (bcrypt)
   - Insert user to MongoDB
4. Auto-login via NextAuth signIn()
5. Redirect to /upload
6. Session stored as JWT
```

## 🔒 Security Features

### **Password Security:**
- ✅ Bcrypt hashing (12 rounds)
- ✅ Minimum 8 characters
- ✅ Never stored in plain text

### **Input Validation:**
- ✅ Email format validation
- ✅ Password confirmation
- ✅ Duplicate email prevention
- ✅ SQL injection prevention (MongoDB)

### **Session Security:**
- ✅ JWT tokens (server-side verification)
- ✅ HTTP-only cookies
- ✅ CSRF protection
- ✅ Secure session storage

## 🎯 Next Steps (To Implement)

### **1. Protect Routes**
Add authentication checks to protected pages:

```typescript
// pages/dashboard.tsx
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') return <div>Loading...</div>
  if (!session) {
    router.push('/landing')
    return null
  }

  // Protected content
}
```

### **2. Link Interviews to Users**
Update interview storage to save to user's MongoDB document:

```typescript
// When saving interview results
const updateUserHistory = async (userId: string, interviewData: any) => {
  const client = await clientPromise
  const db = client.db('interviewbot')
  
  await db.collection('users').updateOne(
    { _id: new ObjectId(userId) },
    { 
      $push: { 
        interviewHistory: {
          id: generateId(),
          date: new Date(),
          ...interviewData
        }
      }
    }
  )
}
```

### **3. Dashboard Data from MongoDB**
Load interview history from user's document instead of localStorage:

```typescript
// pages/dashboard.tsx
const loadInterviewHistory = async () => {
  const response = await fetch('/api/user/interviews')
  const data = await response.json()
  setInterviewHistory(data.interviews)
}
```

### **4. Add Password Reset**
- Forgot password link
- Email verification
- Password reset tokens

### **5. Add OAuth (Optional)**
- Google Sign-In
- GitHub Sign-In
- LinkedIn Sign-In

## 📝 Code Examples

### **Check if User is Logged In (Client-Side)**
```typescript
import { useSession } from 'next-auth/react'

function MyComponent() {
  const { data: session } = useSession()
  
  if (session) {
    return <div>Welcome {session.user?.email}</div>
  }
  return <div>Please log in</div>
}
```

### **Logout**
```typescript
import { signOut } from 'next-auth/react'

<button onClick={() => signOut()}>Logout</button>
```

### **Get User Info (Server-Side)**
```typescript
import { getServerSession } from 'next-auth/next'
import { authOptions } from './api/auth/[...nextauth]'

export async function getServerSideProps(context) {
  const session = await getServerSession(
    context.req,
    context.res,
    authOptions
  )
  
  if (!session) {
    return {
      redirect: {
        destination: '/landing',
        permanent: false,
      },
    }
  }
  
  return {
    props: { session }
  }
}
```

## 🐛 Troubleshooting

### **"Cannot connect to MongoDB"**
- Check `MONGODB_URI` in `.env.local`
- Verify IP whitelist in MongoDB Atlas
- Ensure database user credentials are correct

### **"Invalid session"**
- Verify `NEXTAUTH_SECRET` is set
- Clear browser cookies
- Restart dev server

### **"User already exists"**
- Email is case-insensitive and unique
- Check MongoDB for existing user
- Use different email or login instead

## 🎨 UI Customization

### **Modal Styling**
Modals use scoped CSS (JSX style tags). Customize colors:

```jsx
.submit-button {
  background: linear-gradient(135deg, #YOUR_COLOR_1, #YOUR_COLOR_2);
}
```

### **Landing Page Buttons**
Update in `pages/landing.tsx`:

```jsx
.login-button {
  background: YOUR_STYLE;
}
```

## 📚 Additional Resources

- [NextAuth.js Docs](https://next-auth.js.org/)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)
- [Bcrypt Security](https://github.com/kelektiv/node.bcrypt.js)
- [JWT Best Practices](https://jwt.io/introduction)

---

**🎉 Authentication is now fully implemented and ready to use!**

After setting up `.env.local` and running `npm install`, you can start testing the authentication flow immediately.

