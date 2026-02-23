# 🎬 Shared Watchlist App

A collaborative movie and TV show watchlist application that allows friends to create groups, add titles, and keep track of what everyone wants to watch — all in one place.

---

## 🚀 Overview

The Shared Watchlist App is designed to make deciding what to watch with friends easier. Users can create accounts, join groups, and contribute movies or shows to a shared group watchlist.

Each group maintains its own list, so recommendations stay organized and relevant to that specific friend group.

---

## ✨ Features

### 🔐 Authentication
- User registration and login
- Secure authentication
- Persistent user sessions

### 👥 Groups
- Create new groups
- Join existing groups
- View a list of groups you are a member of

### 🎥 Watchlists
- Add movies or TV shows to a group’s watchlist
- View all watchlist items within a group
- See what your friends want to watch

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- Bootstrap (for styling)

### Backend
- Supabase (PostgreSQL database)
- Firebase Authentication

### Database
Relational schema including:
- Users
- Groups
- Group Members
- Movies / TV Shows
- Watchlist Items

---

## 🗄️ Database Structure (High Level)

### Users
- `id`
- `username`
- `email`

### Groups
- `id`
- `name`
- `created_by`
- `created_at`

### Group Members
- `id`
- `group_id`
- `user_id`

### Movies
- `id`
- `title`
- `type` (movie or tv)
- `tmdb_id`
- `poster_path`

### Watchlist Items
- `id`
- `group_id`
- `movie_id`
- `added_by`
- `created_at`

---

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/shared-watchlist.git
cd shared-watchlist
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a `.env` file

Add the following environment variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
```

### 4. Start the development server

```bash
npm run dev
```

---

## 🔮 Future Improvements

- Voting system within groups
- Watch history tracking
- Dark / Light mode toggle
- Group admin permissions
- Mobile/Desktop UI optimization

---

## 🎯 Project Goal

The goal of this project is to simplify group decision-making for movies and TV shows while practicing full-stack development with authentication, relational databases, and group-based permissions.

