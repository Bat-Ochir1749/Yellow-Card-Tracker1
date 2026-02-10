# Yellow Card Tracker

A web application to track student yellow cards and automatically manage demerits and email notifications.

## Features

- **Track by Grade**: Filter students by grade level (6-12).
- **Yellow Card System**: 
  - Add yellow cards.
  - 3 Yellow Cards = 1 Demerit (Yellow cards reset to 0, or carry over remainder).
  - 3 Demerits = Automatic Reset (Yellow cards and Demerits reset to 0).
- **Email Notifications**:
  - Manage email recipients per grade.
  - Automatically sends an email when a demerit is issued.
- **Persistence**: Data is stored in a SQLite database.

## Prerequisites

- Node.js installed.

## Setup & Run

### 1. Backend (Server)

```bash
cd yellow-card-tracker/server
npm install
npx prisma db push
node index.js
```

The server will run on `http://localhost:3000`.

### 2. Frontend (Client)

```bash
cd yellow-card-tracker/client
npm install
npm run dev
```

The client will run on `http://localhost:5173`.

## Environment Variables

The server uses a `.env` file for configuration. By default:
- `DATABASE_URL="file:./dev.db"`
- `PORT=3000`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (Defaults to Ethereal Email for testing)

## Testing Email

The system uses Ethereal Email by default. You can see the logs in the server console which will show the preview URL for sent emails if available, or just log the attempt.
