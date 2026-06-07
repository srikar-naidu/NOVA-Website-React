# NOVA Platform

NOVA (Network of Visionary Aspirants) is the official club platform for managing events, registrations, project submissions, and finding teammates.

## Architecture

The platform is split into a React frontend and a modular Node.js/Express backend connected to MongoDB.

### Frontend (`/src`)
- **React + Vite**: Fast, modern frontend framework.
- **Tailwind CSS & Vanilla CSS**: Dynamic styling with global dark theme setup in `index.css`.
- **Framer Motion**: Animations and scroll interactions.
- **Features**: Team Finder, Dynamic Event Book (using React PageFlip), 3D Spline renders (lazy-loaded on desktop).

### Backend (`/backend/src`)
A modular architecture utilizing:
- `routes/`: Express router definitions.
- `controllers/`: Request handling and response formatting.
- `services/`: Business logic, DB operations (MongoDB), and third-party integrations (Resend).
- `models/`: Mongoose schemas (Registration, Submission, TeamPost, etc.).
- `middleware/`: Rate limiting, JWT Admin auth, and Cloudinary upload handling.

## Environment Setup

1. Copy the `.env.example` file in the `backend/` directory to `.env` and fill in your actual credentials (MongoDB URI, Cloudinary keys, Resend API key, JWT Secret).

## Running Locally

**Terminal 1 (Frontend):**
```bash
npm install
npm run dev
```
*(Note: `npm run dev` uses the `--host` flag to expose your local IP, allowing you to easily test the site on your mobile device on the same Wi-Fi network!)*

**Terminal 2 (Backend):**
```bash
cd backend
npm install
npm start
```

## Recent Upgrades
- Migrated from a monolithic `server.js` file to a clean Route/Controller/Service pattern.
- Migrated data layer from Notion API to MongoDB.
- Added automated email notifications using Resend.
- Added "Find a Squad" (Team Finder) feature for students to connect.
- Optimized Spline 3D rendering for mobile performance.
