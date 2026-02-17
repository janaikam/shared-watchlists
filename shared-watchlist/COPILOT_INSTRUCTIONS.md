# Project: Shared Watchlist App

## 📌 Project Overview

This is a React-based web application that allows groups of friends to:

- Create shared watchlists for movies and TV shows
- Pull media data from TMDB (The Movie Database API)
- Organize watchlists by friend groups
- Vote on which media to watch
- Propose and vote on dates/times to watch
- Track watched items

The application is:
- Frontend: React (Vite)
- Authentication: Firebase Auth
- Database: Supabase (Postgres)
- Media Data: TMDB API
- Hosting: GitHub Pages (static frontend)
- Target users: ~50 max

This is a frontend-only deployment. All business logic should live in:
- Supabase (database rules)
- Firebase Auth (authentication)
- Client-side logic

No custom Node backend.

---

# 🗂️ Recommended File Structure

Use a feature-based folder structure.

```
src/
│
├── app/
│   ├── App.tsx
│   ├── routes.tsx
│
├── components/
│   ├── layout/
│   ├── ui/
│   ├── forms/
│
├── features/
│   ├── auth/
│   │   ├── AuthProvider.tsx
│   │   ├── useAuth.ts
│   │   ├── LoginPage.tsx
│   │
│   ├── groups/
│   │   ├── GroupListPage.tsx
│   │   ├── GroupDetailPage.tsx
│   │   ├── CreateGroupModal.tsx
│   │   ├── groupService.ts
│   │
│   ├── watchlist/
│   │   ├── WatchlistPage.tsx
│   │   ├── AddMediaModal.tsx
│   │   ├── WatchItemCard.tsx
│   │   ├── watchlistService.ts
│   │
│   ├── voting/
│   │   ├── MediaVoting.tsx
│   │   ├── SessionVoting.tsx
│   │   ├── votingService.ts
│   │
│   ├── scheduling/
│   │   ├── ProposeSessionModal.tsx
│   │   ├── schedulingService.ts
│
├── services/
│   ├── firebase.ts
│   ├── supabase.ts
│   ├── tmdb.ts
│
├── hooks/
│   ├── useGroups.ts
│   ├── useWatchlist.ts
│
├── types/
│   ├── database.ts
│   ├── models.ts
│
├── utils/
│   ├── date.ts
│
├── styles/
│
└── main.tsx
```

### Guidelines:
- Keep business logic inside feature folders.
- All Supabase calls go in `*Service.ts` files.
- TMDB calls go in `services/tmdb.ts`.
- Avoid mixing UI with database logic.

---

# 🔐 Authentication Design (Firebase)

- Use Firebase Auth for:
  - Email/password login
  - Google login (optional)
- Store Firebase `uid` in Supabase tables.
- All database rows must reference `firebase_uid`.

Never store passwords in Supabase.

---

# 🗄️ Database Design (Supabase - Postgres)

Use relational tables.

## Tables

### users
- id (uuid, primary key)
- firebase_uid (text, unique)
- email (text)
- display_name (text)
- created_at (timestamp)

---

### groups
- id (uuid)
- name (text)
- created_by (uuid → users.id)
- created_at (timestamp)

---

### group_members
- id (uuid)
- group_id (uuid → groups.id)
- user_id (uuid → users.id)
- role (text: 'member' | 'admin')
- joined_at (timestamp)

Each user can belong to multiple groups.

---

### watchlist_items
- id (uuid)
- group_id (uuid → groups.id)
- tmdb_id (integer)
- media_type ('movie' | 'tv')
- added_by (uuid → users.id)
- status ('pending' | 'watched')
- created_at (timestamp)

We only store:
- TMDB ID
- Media type

All detailed info (genre, runtime, poster, etc.) comes from TMDB API.

---

### media_votes
- id (uuid)
- watchlist_item_id (uuid)
- user_id (uuid)
- vote ('yes' | 'maybe' | 'no')

Unique constraint:
- (watchlist_item_id, user_id)

---

### watch_sessions
- id (uuid)
- watchlist_item_id (uuid)
- proposed_by (uuid)
- proposed_datetime (timestamp)
- created_at (timestamp)

---

### session_votes
- id (uuid)
- session_id (uuid)
- user_id (uuid)
- available (boolean)

Unique constraint:
- (session_id, user_id)

---

# 🔒 Row-Level Security (Required)

Enable RLS on all tables.

Policy rule:
Users can only access data for groups they belong to.

All queries must:
- Filter by group membership
- Validate firebase_uid → users.id mapping

---

# 🎬 TMDB API Integration

All media search must:

1. Call TMDB search endpoint
2. Allow user to select media
3. Store only:
   - tmdb_id
   - media_type

Never duplicate full movie data in Supabase.

Use environment variable:

VITE_TMDB_API_KEY=

API calls must live in:
services/tmdb.ts

---

# 🧠 Business Logic Rules

- A user must belong to a group to:
  - View its watchlist
  - Add media
  - Vote
  - Propose sessions
- Media votes are per user per item.
- Session votes are per user per session.
- Groups are isolated from each other.

---

# 🚀 Deployment Constraints (GitHub Pages)

- App must be static build compatible.
- No server-side code.
- All environment variables must be prefixed with VITE_.
- Use HashRouter OR configure 404 redirect for client routing.

---

# 🎯 UI Design Expectations

- Clean layout
- Simple dashboard after login
- Group selector at top
- Tabs inside group:
  - Watchlist
  - Voting
  - Schedule
- Show vote counts visually
- Show availability count for sessions

---

# 📈 Future Scalability Considerations

The architecture should allow:
- Easy migration from GitHub Pages to Vercel
- Possible addition of serverless functions
- Notification system in the future

---

# 📌 Code Quality Standards

- Use TypeScript
- Strict typing for database models
- Separate UI and data logic
- Avoid deeply nested components
- Reusable UI components in /components/ui

---

# 🚫 Do Not

- Do not store full TMDB movie data in Supabase
- Do not allow cross-group data access
- Do not mix Firebase and Supabase authentication logic
- Do not duplicate vote records

---

# Summary

This is a small-scale shared watchlist platform where:

- Users authenticate with Firebase
- Groups are managed in Supabase
- Media data comes from TMDB
- Hosting is static via GitHub Pages
- Designed for ~50 users
- Clean relational structure
- Group isolation is mandatory
