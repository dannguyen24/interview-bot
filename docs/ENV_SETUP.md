# Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in the `frontend/` directory with the following variables:

```env
# MongoDB Connection (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/interviewbot?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_SECRET=your-random-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Backend API URLs
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

## Setup Instructions

### 1. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (Free M0 tier available)
4. Create a database user:
   - Database Access → Add New Database User
   - Choose "Password" authentication
   - Save username and password
5. Whitelist your IP:
   - Network Access → Add IP Address
   - Click "Allow Access from Anywhere" (for development)
6. Get connection string:
   - Clusters → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `interviewbot`

### 2. Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Or use Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output and use it as `NEXTAUTH_SECRET`.

### 3. Set URLs

For local development:
- `NEXTAUTH_URL=http://localhost:3000`
- `NEXT_PUBLIC_BACKEND_URL=http://localhost:8000`
- `NEXT_PUBLIC_WS_URL=ws://localhost:8000`

For production (Replit/other):
- Update URLs to match your deployment domains
- Use HTTPS/WSS for production

## MongoDB Collections

The app will automatically create these collections:

- `users` - User accounts
- `sessions` - NextAuth sessions
- `accounts` - OAuth accounts (future)
- `verification_tokens` - Email verification (future)

## Security Notes

- ⚠️ **Never commit `.env.local`** to git (already in .gitignore)
- ⚠️ Use strong passwords for MongoDB users
- ⚠️ Rotate secrets regularly in production
- ⚠️ Use IP whitelisting in production (not "Allow Access from Anywhere")

## Testing the Connection

After setting up `.env.local`, run:

```bash
npm install
npm run dev
```

Visit `http://localhost:3000/landing` and try to sign up. If successful, check MongoDB Atlas → Collections to see your new user!

