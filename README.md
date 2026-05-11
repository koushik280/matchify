Matchify+ – A MERN Dating App with Real‑time Chat & AI Recommendations

Matchify+ is a full‑stack dating platform built with the MERN stack (MongoDB, Express.js, React/Next.js, Node.js) plus TypeScript, Socket.io, Tailwind CSS, and Firebase Cloud Messaging. It offers swipe‑based discovery, real‑time chat, location‑based nearby matching, and a comprehensive admin panel with role‑based access control.

✨ Features
👤 User Panel
Authentication: Email/password login, JWT + refresh tokens (HTTP‑only cookies), auto‑login after registration.

Profile Management: Multi‑step onboarding, photo upload (Cloudinary), bio, age, interests, location (geolocation).

Discovery & Matching: Tinder‑style swipe cards, mutual match detection, “Nearby Users” with distance.

Real‑time Chat: Text messages, typing indicators, read receipts, emoji picker (Socket.io).

Safety: Report user (panic button), admin‑controlled verified badge.

👑 Admin & Super Admin Panel
User Management: List, search, filter, block/unblock, delete, change roles, verify users.

Reports Management: View pending reports, resolve (block user or dismiss).

Audit Logs: Track all admin actions (superadmin only).

Analytics Dashboard: Real stats – total users, blocked users, new today, user growth chart, role distribution, total swipes/matches/messages.

🎨 UI/UX
Glassmorphism design, dark/light mode toggle

Fully responsive (mobile‑first)

Framer Motion animations (swipe, page transitions)

Skeleton loaders, infinite scroll

🧠 Technical Highlights
Strict TypeScript (zero any types)

Clean separation of concerns: API modules, custom hooks, type definitions

WebSocket authentication via token validation

Role‑based access control (RBAC) – user, moderator, admin, superadmin

Production‑ready Axios interceptor with automatic token refresh

🧱 Tech Stack
Frontend

Next.js 14 (App Router) + TypeScript

Tailwind CSS + ShadCN UI + Framer Motion

Zustand (state), TanStack Query (server state)

Socket.io‑client (real‑time chat)

Firebase SDK (push notifications)

Backend

Node.js + Express.js

MongoDB + Mongoose

JWT (access/refresh tokens), bcrypt

Socket.io

Cloudinary (image upload)

Firebase Admin SDK (push notifications)

DevOps & Deployment

GitHub

Render (backend)

Vercel (frontend)

MongoDB Atlas (database)


## 🔮 Future Scope (Planned Enhancements)

The following features are **not yet implemented** but are on the roadmap for upcoming releases:

### Authentication & Security
- Phone (OTP) login, Google OAuth integration
- Two‑Factor Authentication (2FA)
- Device/session management (logout from all devices)
- CAPTCHA for bot protection

### Profile System
- Multi‑step onboarding wizard (improved UX)
- Profile badges (premium, trending)
- Short intro video upload (Reels‑style profile)

### Discovery & Matching
- AI‑based smart recommendations (collaborative filtering)
- “Explore” section (trending profiles)
- Reverse matching (who fits your profile)

### Chat & Interaction
- Voice notes in chat
- GIF picker (GIPHY integration)
- Video / audio calls (WebRTC)

### Gamification
- Daily swipe limit (free users)
- Streak system with rewards
- Coins/points system to unlock features

### Premium Features
- Profile boost (top visibility)
- Incognito mode (browse secretly)
- See who viewed your profile
- Priority matching & advanced filters (height, education, lifestyle)

### Safety & Privacy
- AI‑based fake profile detection
- Blur photos for unverified users
- Screenshot detection alert
- End‑to‑end encrypted chat (optional)

### Admin & Analytics
- Full analytics dashboard (DAU/MAU, retention graphs, heatmaps)
- AI‑assisted content moderation
- Bulk actions (block/delete multiple users)
- Advanced filtering by location/activity

### Developer Experience
- GraphQL layer (optional)
- Redis caching for sessions & messages

### Third‑Party Integrations
- Stripe / Razorpay for premium subscriptions
- SendGrid / Nodemailer for email campaigns
- OpenAI API for conversation starters & moderation

🏗️ Architecture Overview

graph TB
    subgraph Frontend [Next.js on Vercel]
        UI[React Components]
        State[Zustand / TanStack Query]
        SocketClient[Socket.io Client]
    end

    subgraph Backend [Node.js on Render]
        API[REST API]
        SocketServer[Socket.io Server]
        Auth[JWT + RBAC]
        Controllers
    end

    subgraph External
        Mongo[(MongoDB Atlas)]
        Cloudinary
        Firebase[Firebase Cloud Messaging]
    end

    UI -->|HTTP| API
    UI -->|WebSocket| SocketServer
    SocketClient --> SocketServer
    API --> Mongo
    API --> Cloudinary
    API --> Firebase
    SocketServer --> Mongo
    SocketServer --> Firebase

Data Flow

User authenticates → backend sets accessToken & refreshToken as HTTP‑only cookies.

Frontend stores user object in Zustand (in‑memory); API calls include cookies automatically.

Swipe actions → backend updates Swipe collection, creates Match on mutual like.

Chat messages go through Socket.io → stored in Message collection, emitted to recipient.

Admin actions are logged in AuditLog.

Push notifications (if enabled) are sent via Firebase for new matches/messages.

🚀 Getting Started (Local Development)
🚀 Getting Started (Local Development)
Prerequisites
Node.js 18+

MongoDB Atlas account (or local MongoDB)

Cloudinary account (free tier)

Firebase project (optional, for push notifications)

1. Clone the repository
bash
git clone https://github.com/koushik280/matchify.git
cd matchify
2. Backend Setup
bash
cd backend
cp .env.example .env   # create .env file
# Fill in your environment variables (see below)
npm install
npm run dev
Required environment variables (.env):

text
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_ACCESS_SECRET=random_secret
JWT_REFRESH_SECRET=another_random_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:3000
3. Frontend Setup
bash
cd frontend
cp .env.local.example .env.local   # or copy your existing .env.local
npm install
npm run dev
Frontend environment variables (.env.local):

text
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
# Firebase web config (if using push notifications)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
...
4. Create Admin User
Run the seed script inside backend:

bash
node createAdmin.js
Default admin: admin@example.com / Admin123!

5. Access the App
Frontend: http://localhost:3000

Backend API: http://localhost:5000/api

📁 Project Structure (Simplified)
text
matchify/
├── backend/
│   ├── src/
│   │   ├── config/          # DB, Cloudinary, Firebase
│   │   ├── controllers/     # Business logic
│   │   ├── middlewares/     # Auth, roles, validation
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API endpoints
│   │   ├── sockets/         # Socket.io handlers
│   │   └── utils/           # Audit logger, etc.
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── api/                 # API call functions
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # Reusable React components
│   ├── hooks/               # Custom hooks (data fetching, auth, etc.)
│   ├── lib/                 # Axios, Firebase, socket client
│   ├── stores/              # Zustand stores
│   ├── types/               # TypeScript interfaces
│   └── public/              # Static assets, service worker
└── README.md

🔌 API Endpoints (Main Examples)
Method	Endpoint	Description
POST	/api/auth/register	Register new user
POST	/api/auth/login	Login, returns accessToken (cookie also set)
POST	/api/auth/refresh	Refresh access token (cookie)
POST	/api/auth/logout	Logout, clear cookies
GET	/api/profile/me	Get full user profile
PATCH	/api/profile/update	Update profile (name, age, bio, interests)
POST	/api/profile/upload-photo	Upload photo (Cloudinary)
GET	/api/discover	Get swipe feed (paginated, excludes already swiped)
POST	/api/swipe	Like/pass, creates match if mutual
GET	/api/matches	List active matches
GET	/api/messages/:matchId	Get chat history
GET	/api/discover/nearby	Get users within radius (geolocation)
GET	/api/admin/users	Admin: list users (with filters)
PATCH	/api/admin/users/:userId/block	Block/unblock user
PATCH	/api/admin/users/:userId/verify	Verify/unverify user (superadmin)
GET	/api/admin/analytics	Dashboard analytics (user growth, role distribution)
GET	/api/superadmin/audit-logs	Audit logs (superadmin only)
Full API documentation (Swagger) is available at /api-docs (if you generate it) or you can import the Postman collection from docs/.

🧪 Code Snippets (Key Parts)
Axios Interceptor (Token Refresh)
typescript
// lib/axios.ts
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {}, { withCredentials: true });
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
Socket Connect & Join Room (Chat)
tsx
// chat/[matchId]/page.tsx
const socket = getSocket(accessToken);
socket.on('connect', () => {
  setIsConnected(true);
  socket.emit('join_match_room', matchId);
});
socket.on('receive_message', (message) => {
  addMessage(matchId, message);
});
Custom Hook for Admin Users
ts
// hooks/useAdminUsers.ts
export function useAdminUsers({ page, search, roleFilter, blockedFilter }) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, roleFilter, blockedFilter],
    queryFn: () => fetchAdminUsers({ page, search, role: roleFilter, isBlocked: blockedFilter }),
  });
  const blockMutation = useMutation({ mutationFn: blockUser });
  return { users: data?.data, blockUser: blockMutation.mutate };
}
Verified Badge Component
tsx
// components/ui/verified-badge.tsx
export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 ml-2 text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
      <CheckCircle className="h-3 w-3" /> Verified
    </span>
  );
}
🌍 Deployment (Render + Vercel)
Backend (Render)
Push code to GitHub.

On Render, create a New Web Service → connect repo.

Root Directory: backend

Build Command: npm install

Start Command: npm start

Add environment variables (same as .env, plus FRONTEND_URL pointing to your Vercel domain).

Deploy.

Frontend (Vercel)
On Vercel, import the same GitHub repo.

Root Directory: frontend

Add environment variables (NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SOCKET_URL, Firebase config, VAPID key).

Deploy.

Important: Cookies must be set with sameSite: 'none'; secure: true in production to work cross‑domain (Vercel → Render).

🤝 Contributing
This is a final project – contributions are not expected. However, feel free to fork and experiment.

📄 License
This project is open‑source for educational purposes. No commercial use without permission.

🙏 Acknowledgements
Tinder for swipe UI inspiration

shadcn/ui for beautiful components

Recharts for admin charts

Firebase for push notifications

Render and Vercel for free hosting

Live Demo: https://matchify-livid.vercel.app/
Backend API: https://matchify-backend-fmre.onrender.com/api
GitHub: https://github.com/koushik280/matchify

Built with by Koushik Karmakar

