# YouTube AI Agent

An AI-powered YouTube automation project designed to help users create, manage, and analyze YouTube content from a single dashboard.

## Overview

YouTube AI Agent is a web application that combines authentication, YouTube account connection, AI-assisted video creation, and channel analytics.

The project is designed around the following workflow:

1. User creates an account or signs in.
2. User connects their YouTube account.
3. The application obtains the required YouTube permissions through Google OAuth.
4. The dashboard displays YouTube channel information.
5. AI features can be used to create video content.
6. Generated videos can be prepared for YouTube upload.
7. Analytics and feedback can be used to improve future videos.

## Features

- Email and password authentication
- Google authentication
- Apple authentication UI
- Firebase Authentication
- Protected dashboard flow
- Google OAuth for YouTube
- YouTube channel information retrieval
- YouTube Analytics API integration
- Secure server-side OAuth handling
- Environment variable configuration
- Dashboard-ready architecture for AI video automation
- Support for storing user/channel records for future expansion

## Project Structure

```text
YouTube-AI-Agent/
│
├── client/
│   ├── login.html
│   ├── dashboard.html
│   │
│   └── js/
│       ├── auth.js
│       └── firebase.js
│
├── server/
│   ├── server.js
│   ├── youtube.js
│   ├── .env
│   ├── package.json
│   └── ...
│
├── README.md
└── ...
```

> Your actual folder names may differ. Keep the import paths in the HTML/JavaScript consistent with your project structure.

## Technologies

### Frontend

- HTML5
- CSS3
- JavaScript
- Firebase Authentication

### Backend

- Node.js
- Express.js
- googleapis

### Google Services

- Firebase Authentication
- Google Cloud OAuth
- YouTube Data API
- YouTube Analytics API

## Requirements

Install the following before running the project:

- Node.js
- npm
- A Firebase project
- A Google Cloud project
- YouTube Data API enabled
- YouTube Analytics API enabled
- OAuth credentials configured for the server

## Firebase Setup

Create or open your Firebase project and enable Authentication providers that you want to use.

For email authentication:

1. Open Firebase Console.
2. Open your project.
3. Go to Authentication.
4. Open Sign-in method.
5. Enable Email/Password.
6. Enable Google if you want Google login.

Copy the Firebase Web App configuration into:

```text
client/js/firebase.js
```

Example:

```javascript
import { initializeApp } from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import { getAuth } from
"https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
```

Firebase web configuration values are intended to identify the Firebase project. Do not put server-side OAuth client secrets in frontend files.

## Google Cloud / YouTube Setup

Create a Google Cloud project and configure OAuth.

Enable:

```text
YouTube Data API v3
YouTube Analytics API
```

Create OAuth credentials for the backend application.

The server needs:

```text
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI
```

The redirect URI configured in Google Cloud must exactly match the redirect URI used by the application.

For local development, an example can be:

```text
http://localhost:5000/auth/youtube/callback
```

Use the exact callback route implemented by your `server.js`.

## OAuth Test Users

If the Google OAuth consent screen is in testing mode, only accounts added as test users can authorize the application.

In Google Cloud:

```text
Google Auth Platform
        ↓
Audience
        ↓
Test users
        ↓
Add users
```

Add every Google account that you want to use for testing.

If another account receives:

```text
Error 403: access_denied
Access blocked
```

check the OAuth test-user configuration first.

## Environment Variables

Create:

```text
server/.env
```

Example:

```env
PORT=5000

GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/youtube/callback
```

Do not commit the real `.env` file to Git.

Add this to `.gitignore`:

```gitignore
.env
node_modules/
```

## Install Dependencies

Open a terminal inside the server directory:

```bash
cd server
npm install
```

If the project does not have dependencies installed yet, install the main packages:

```bash
npm install express googleapis dotenv cors
```

## Start the Server

From the `server` directory:

```bash
node server.js
```

If your project uses an npm start script:

```bash
npm start
```

The local application may then be available at:

```text
http://localhost:5000/
```

or:

```text
http://localhost:5000/login.html
```

Use the route configured by your `server.js`.

## Login Flow

The login page contains:

- Email login
- Google login
- Apple login UI
- Create account

The frontend authentication code should use the same element IDs:

```text
emailForm
email
password
googleBtn
appleBtn
signup
error
```

After successful Firebase authentication, the application redirects the user to:

```text
dashboard.html
```

## YouTube Connection Flow

The expected YouTube flow is:

```text
Dashboard
   ↓
Connect YouTube
   ↓
Backend generates Google OAuth URL
   ↓
Google consent screen
   ↓
User grants permissions
   ↓
Google redirects to callback
   ↓
Backend exchanges authorization code
   ↓
Access/refresh tokens received
   ↓
YouTube channel information retrieved
   ↓
Dashboard displays connected channel
```

The OAuth client secret must remain on the server.

## YouTube OAuth Scopes

The current server-side OAuth helper uses scopes similar to:

```javascript
const SCOPES = [
  "https://www.googleapis.com/auth/youtube",
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/yt-analytics.readonly"
];
```

These permissions allow the application to request access needed for YouTube management and analytics features.

Only request scopes that are actually required by the application.

## Channel Data

The YouTube helper retrieves channel information such as:

```text
Channel ID
Channel title
Channel description
Channel thumbnail
Subscriber count
View count
Video count
```

This information can be displayed on the dashboard.

## Data Storage

For a production-ready application, user and YouTube connection records should be stored in a database.

A recommended structure is:

```text
users
│
├── userId
├── email
├── displayName
├── createdAt
└── updatedAt

youtube_connections
│
├── userId
├── channelId
├── channelTitle
├── accessToken
├── refreshToken
├── tokenExpiry
├── createdAt
└── updatedAt

videos
│
├── userId
├── videoId
├── title
├── description
├── status
├── createdAt
└── uploadedAt

analytics
│
├── userId
├── videoId
├── views
├── likes
├── comments
├── watchTime
└── recordedAt
```

### Important Security Rule

OAuth access tokens and especially refresh tokens are sensitive credentials.

Do not:

- Store them in `localStorage`
- Put them in HTML
- Put them in frontend JavaScript
- Commit them to GitHub
- Display them in logs
- Send them to the browser unnecessarily

Store them securely on the backend/database with appropriate protection.

## Recommended `.gitignore`

Create a `.gitignore` file:

```gitignore
node_modules/
.env
.env.*
!.env.example

.DS_Store
Thumbs.db

*.log
```

You can provide a safe template for other developers:

```env
PORT=5000

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
```

Save that template as:

```text
server/.env.example
```

## Common Errors

### 403 access_denied

Possible cause:

```text
OAuth application is in testing mode
```

Solution:

Add the Google account under:

```text
Google Auth Platform → Audience → Test users
```

### redirect_uri_mismatch

The redirect URI in Google Cloud does not exactly match the application's redirect URI.

Check:

```text
GOOGLE_REDIRECT_URI
```

and the OAuth client's authorized redirect URI.

### invalid_client

Usually caused by incorrect OAuth credentials or a mismatch between the configured client ID/secret and the Google Cloud project.

Check:

```text
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
```

### GOOGLE_CLIENT_SECRET is missing

Check the server `.env` file:

```env
GOOGLE_CLIENT_SECRET=your_secret_here
```

Then restart the Node.js server.

### Firebase login does not work

Check:

- Firebase project configuration
- Authentication provider settings
- `firebase.js`
- Browser console errors
- Correct frontend file paths

## Development Checklist

Before testing:

```text
[ ] Node.js installed
[ ] npm dependencies installed
[ ] Firebase project created
[ ] Firebase Authentication enabled
[ ] Firebase configuration added
[ ] Google Cloud project configured
[ ] YouTube Data API enabled
[ ] YouTube Analytics API enabled
[ ] OAuth consent screen configured
[ ] Test users added
[ ] OAuth client created
[ ] Redirect URI configured
[ ] .env configured
[ ] Server restarted
[ ] Login tested
[ ] YouTube connection tested
```

## Future Features

The project can be expanded with:

- AI video script generation
- AI video generation
- Automatic YouTube uploads
- AI-generated thumbnails
- Automatic title optimization
- Description and tag generation
- Video scheduling
- YouTube analytics dashboard
- Performance feedback
- Self-optimization based on previous videos
- Automatic improvement of titles, thumbnails and video quality
- Multi-channel management
- Video generation history
- User-specific usage records
- Database-backed project history

## Security

Never publish:

```text
GOOGLE_CLIENT_SECRET
OAuth refresh tokens
OAuth access tokens
Database credentials
Service-account private keys
Other server secrets
```

Frontend Firebase configuration and backend OAuth secrets serve different purposes. Keep server credentials on the server.

## License

Add the project's license here before public distribution.

Example:

```text
MIT License
```

## Project Status

This project is under active development.

The authentication and YouTube OAuth foundation can be used as the base for the larger AI-powered YouTube automation workflow.
