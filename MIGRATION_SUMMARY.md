# Migration Summary: Express to Next.js

## ✅ Completed Migration

This project has been successfully migrated from a Turborepo monorepo with separate Express backend and Next.js frontend to a unified Next.js application with API routes.

### What Changed

1. **Backend → Frontend Integration**
   - All Express routes converted to Next.js API routes (`app/api/*`)
   - Database schema and services moved to `lib/`
   - All backend functionality now runs within Next.js

2. **Authentication Migration**
   - **Removed**: Passport.js with Google/GitHub strategies
   - **Added**: NextAuth v5 with Google and GitHub providers
   - Authentication now uses NextAuth sessions (cookie-based) instead of JWT tokens

3. **API Routes Created**
   - `/api/auth/[...nextauth]` - NextAuth handler
   - `/api/auth/me` - Get current user
   - `/api/projects/*` - Projects CRUD + likes
   - `/api/ideas/*` - Ideas CRUD + likes
   - `/api/comments/*` - Comments CRUD
   - `/api/db/people/*` - People management + likes
   - `/api/db/resources/*` - Resources management + likes
   - `/api/db/apps/*` - Apps management + likes
   - `/api/db/voting/*` - Voting system

4. **Dependencies Updated**
   - Added: `next-auth@^5.0.0-beta.25`, `drizzle-orm`, `pg`, `zod`
   - Removed: `express`, `passport`, `passport-google-oauth20`, `passport-github2`, `cors`, `jsonwebtoken`, `bcryptjs`

5. **Turborepo Removed**
   - Deleted `turbo.json`
   - Updated root `package.json` scripts to work directly with Next.js app

### Environment Variables Required

Add these to your `.env.local` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://...

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# OAuth - Google
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OAuth - GitHub
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

**Important**: Update your OAuth app callback URLs:
- Google: `http://localhost:3000/api/auth/callback/google`
- GitHub: `http://localhost:3000/api/auth/callback/github`

### File Structure

```
onedb/
├── app/
│   └── api/              # All API routes
│       ├── auth/         # NextAuth routes
│       ├── projects/     # Projects endpoints
│       ├── ideas/        # Ideas endpoints
│       ├── comments/     # Comments endpoints
│       └── db/           # Database section endpoints
│           ├── people/
│           ├── resources/
│           ├── apps/
│           └── voting/
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   ├── db/               # Database schema and config
│   ├── services/         # Business logic services
│   ├── middleware/        # Auth middleware
│   ├── utils/            # Utilities
│   └── zod/              # Validation schemas
└── drizzle.config.ts     # Drizzle ORM config
```

### Running the Application

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

### Next Steps

1. **Update OAuth Callback URLs**: Update your Google and GitHub OAuth app settings with the new callback URLs
2. **Set Environment Variables**: Add all required environment variables to `.env.local`
3. **Test Authentication**: Verify Google and GitHub login flows work correctly
4. **Test API Endpoints**: Test all API routes to ensure they work as expected
5. **Update Frontend Components**: If any frontend components reference the old API URL, they should now work with relative paths

### Breaking Changes

1. **Authentication**: 
   - Frontend should use NextAuth's `useSession` hook instead of storing JWT tokens
   - API client no longer needs to set Authorization headers (NextAuth handles via cookies)

2. **API URLs**: 
   - Changed from `http://localhost:3001/api` to `/api` (relative paths)
   - All API calls now go through Next.js API routes

3. **No Separate Backend Server**: 
   - The Express server in `apps/backend/` is no longer needed
   - All backend functionality is now in Next.js API routes

### Notes

- The old `apps/backend/` directory can be kept for reference or removed
- Database migrations should be run from the root directory using `npm run db:generate` and `npm run db:migrate`
- All services and business logic remain the same, only the HTTP layer changed


