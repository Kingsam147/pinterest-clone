# Pinterest Clone

A full-stack image sharing and social platform. Users create pins, organise boards, follow others, comment, and upload images. Includes an analytics system that tracks engagement metrics, device types, and user segmentation in real time.

## Features

- **Pins & boards** — create, save, and organise image pins across named boards
- **Social graph** — follow users, view feeds based on follows
- **Comments** — threaded comments on pins with full CRUD
- **Image uploads** — images uploaded to Cloudinary with automatic resizing and optimisation
- **User profiles** — customisable profiles with bio, location, website, and avatar
- **Analytics tracking** — middleware captures device type, session duration, and engagement per request; users are automatically segmented into `casual`, `power`, `creator`, or `influencer` tiers based on activity score
- **Admin panel** — protected routes for viewing platform-wide analytics
- **Rate limiting** — Redis-backed per-IP rate limiting tiered by endpoint type (auth, read, write, admin)
- **Input validation** — Zod schemas on all write endpoints

## Tech Stack

| Layer | Technologies |
|---|---|
| Backend | Node.js · Express · MongoDB · Mongoose |
| Auth | JWT (jsonwebtoken) · bcryptjs |
| Infrastructure | Redis (rate limiting) · Cloudinary (image storage) |
| Validation | Zod |
| Frontend | React |
| Deployment | Docker · Vercel |

## API Structure

```
/api/auth       — register, login, current user
/api/pins       — CRUD for pins, save/unsave
/api/boards     — CRUD for boards, add/remove pins
/api/comments   — create, read, delete comments on pins
/api/users      — profiles, follow/unfollow, feed
/api/upload     — image upload to Cloudinary
/api/admin      — platform analytics (admin only)
```

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB instance (local or Atlas)
- Redis instance
- Cloudinary account

### Backend setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/pinterest-clone
REDIS_URL=redis://default:<password>@<host>:<port>
JWT_SECRET=replace-with-a-long-random-secret
PORT=5000
CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
ADMIN_SECRET=replace-with-a-long-random-secret
```

```bash
npm run dev
```

### Frontend setup

```bash
cd frontend
npm install
npm start
```

### Docker

```bash
docker-compose up --build
```
