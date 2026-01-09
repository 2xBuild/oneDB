# oneDB

A community-driven platform for discovering and sharing ideas, projects, people, apps, and resources. Think of it as a curated, community-validated database where everyone can contribute.

## What is oneDB?

oneDB has two main sections:

### 🏟️ Arena
Share your projects and ideas with the world. No approval needed—just hit publish and you're live.

- **Ideas**: Raw thoughts, concepts, or pitches you want feedback on
- **Projects**: Built something? Show it off with links, images, and descriptions
- **Likes & Dislikes**: Show appreciation for projects and ideas with simple like or dislike buttons
- **Threaded comments**: Unlimited nesting for in-depth discussions
- **Weekly browse**: Navigate ideas and projects week by week

### 📚 Database
A curated collection of useful things, validated by the community before going live.

- **People**: Creators, influencers, experts across platforms (Twitter, LinkedIn, YouTube, etc.)
- **Apps**: Useful tools sorted by category (Productivity, Design, Development, etc.)
- **Resources**: Tutorials, documentation, templates, articles

Everything submitted to the database goes through community voting. Hit the threshold? You're in. It's quality control by the people who actually use it.

## Tech Stack

This is a Next.js application with API routes, running on Bun.

### Frontend & Backend (Unified Next.js App)
- **Next.js 16** with App Router and API Routes
- **React 19**
- **NextAuth v5** for OAuth (GitHub + Google)
- **Drizzle ORM** with PostgreSQL
- **Tailwind CSS 4**
- **Framer Motion** for animations
- **Lucide** icons
- **Zod** for validation

### UI Components
- All UI components are in `components/ui/`
- Built with Radix UI primitives
- Includes: buttons, dialogs, dropdowns, star ratings, etc.

### Type Definitions
- Type definitions are located in `lib/types/index.ts`

## Getting Started

### Prerequisites
- [Bun](https://bun.sh) 1.3+ or Node.js 18+
- [PostgreSQL](https://postgresql.org) database
- GitHub and/or Google OAuth app credentials

### 1. Install dependencies

```bash
npm install
# or
bun install
```

### 2. Set up environment variables

Create `.env.local` in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/onedb

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-at-least-32-chars

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

### 3. Set up the database

```bash
# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate
```

### 4. Run the dev server

```bash
npm run dev
```

This starts the Next.js app on `http://localhost:3000` with both frontend and API routes.

## Project Structure

```
onedb/
├── app/
│   ├── api/              # API routes (Next.js API Routes)
│   │   ├── auth/         # NextAuth routes
│   │   ├── projects/     # Projects endpoints
│   │   ├── ideas/        # Ideas endpoints
│   │   ├── comments/     # Comments endpoints
│   │   └── db/           # Database endpoints
│   └── (public)/         # Public pages
│       ├── arena/        # Ideas & Projects
│       ├── db/           # Database (People, Apps, Resources)
│       ├── submit/       # Submission forms
│       └── signin/       # Auth page
├── components/
│   └── ui/               # UI components
├── lib/
│   ├── db/               # Database schema & config
│   ├── services/         # Business logic
│   ├── middleware/       # Auth middleware
│   ├── utils/            # Helpers
│   └── zod/              # Validation schemas
├── contexts/             # React contexts (auth)
└── packages/
    ├── types/            # Shared TypeScript types
    ├── eslint-config/    # ESLint configs
    └── typescript-config/ # TypeScript configs
```

## How It Works

### Arena Flow
1. Sign in with GitHub or Google
2. Go to `/submit` and pick "Project" or "Idea"
3. Fill in the details and submit
4. Your submission goes live immediately in the Arena
5. Community rates it with likes/dislikes and leaves comments

### Database Flow
1. Sign in with GitHub or Google
2. Go to `/submit` and pick "Person", "App", or "Resource"
3. Fill in the details and submit
4. Your submission goes to `/db/voting` for community review
5. Other users upvote or downvote
6. Once it hits the approval threshold (10+ upvotes with 70%+ positive), it gets added to the main database

## API Endpoints

### Auth
- `GET/POST /api/auth/[...nextauth]` — NextAuth handler
- `GET /api/auth/me` — Get current user

### Arena
- `GET /api/projects` — List projects
- `POST /api/projects` — Create project
- `GET /api/projects/:id` — Get project
- `PUT /api/projects/:id` — Update project
- `DELETE /api/projects/:id` — Delete project
- `GET /api/projects/:id/likes` — Get like aggregation
- `POST /api/projects/:id/like` — Like/dislike project
- `GET /api/ideas` — List ideas
- `POST /api/ideas` — Create idea
- `GET /api/ideas/:id` — Get idea
- `PUT /api/ideas/:id` — Update idea
- `DELETE /api/ideas/:id` — Delete idea
- `GET /api/ideas/:id/likes` — Get like aggregation
- `POST /api/ideas/:id/like` — Like/dislike idea

### Database
- `GET /api/db/people` — List approved people
- `POST /api/db/people` — Submit person
- `GET /api/db/apps` — List approved apps
- `POST /api/db/apps` — Submit app
- `GET /api/db/resources` — List approved resources
- `POST /api/db/resources` — Submit resource
- `GET /api/db/voting` — Get pending submissions
- `POST /api/db/voting/votes` — Vote on a submission

### Comments
- `GET /api/comments/project/:projectId` — Get comments for project
- `GET /api/comments/idea/:ideaId` — Get comments for idea
- `POST /api/comments` — Add comment
- `PUT /api/comments/:id` — Update comment
- `DELETE /api/comments/:id` — Delete comment

## Scripts

### Root
```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Lint code
```

### Database
```bash
npm run db:generate  # Generate Drizzle migrations
npm run db:migrate   # Run migrations
npm run db:push      # Push schema changes (dev)
npm run db:studio    # Open Drizzle Studio
```

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b feature/cool-thing`)
3. Commit your changes (`git commit -am 'Add cool thing'`)
4. Push to the branch (`git push origin feature/cool-thing`)
5. Open a Pull Request

## License

Apache License 2.0
