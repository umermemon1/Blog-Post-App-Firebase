# Blog Post App with Firebase Authentication

A full-stack blog application built with vanilla JavaScript and Firebase. Features user authentication (email/password + Google), create/edit/delete blog posts, and a modern dark-themed UI.

## Features

- **User Authentication**
  - Email/Password sign-up and sign-in
  - Google Sign-In (OAuth)
  - Protected routes (only authenticated users can access posts)
- **Blog Management**
  - Create blog posts with title and content
  - Edit your own posts
  - Delete your own posts
  - Timestamps with moment.js formatting
- **Modern UI**
  - Dark theme with gradient accents
  - Responsive design for mobile and desktop
  - Loading states and inline error messages
  - Animated cards and smooth transitions

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES modules)
- **Styling**: Custom CSS with CSS variables
- **Backend**: Firebase (Authentication + Firestore)
- **Libraries**: moment.js (date formatting)

## Setup Instructions

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing: `luminea-38232`)
3. Enable **Authentication**:
   - Go to Build > Authentication
   - Enable **Email/Password** provider
   - Enable **Google** provider
     - Set "Public-facing name" (e.g., "Blog App")
     - Set "Support email"
     - Save
4. Enable **Firestore Database**:
   - Go to Build > Firestore Database
   - Create database (start in test mode or configure security rules)
5. Get your Firebase config:
   - Project Settings > General > Your apps > Web app
   - Copy the `firebaseConfig` object

### 2. Update Firebase Config

Replace the config in `firebase.mjs` with your own:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "G-XXXXXX"
};
```

### 3. Configure OAuth for Google Sign-In (Important!)

For Google Sign-In to work from a local file system (`file://`), you must:

1. In Firebase Console, go to **Authentication > Sign-in method > Google**
2. Click the gear icon (Project settings)
3. Under **Authorized domains**, add:
   - `localhost`
   - Your local IP (e.g., `192.168.1.100`)
4. If deploying, add your production domain as well.

**Note**: If you get `auth/operation-not-allowed` error, ensure Google provider is enabled in the console.

### 4. Run the App

Simply open `index.html` in a browser. Because this uses ES modules, you need to serve it via a local server (not `file://` protocol).

**Using Python (built-in):**
```bash
# Python 3
python -m http.server 8000

# Then open http://localhost:8000
```

**Using Node.js (http-server):**
```bash
npm install -g http-server
http-server -p 8000
```

**Using VS Code Live Server extension:**
- Install "Live Server" extension
- Right-click `index.html` > "Open with Live Server"

### 5. Firestore Security Rules (Optional but Recommended)

In Firebase Console > Firestore > Rules, set:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /posts/{postId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.uid;
    }
  }
}
```

**Note**: The current app stores `email` in posts. To use UID-based rules, you'd need to modify `create_post` to also store `uid: user.uid`.

## Project Structure

```
├── firebase.mjs          # Firebase app initialization + exports (app, auth, googleProvider)
├── main.mjs              # Root page auth check + redirect logic
├── index.html            # Landing page
├── style.css             # Global styles
├── Login/
│   ├── index.html        # Login page
│   └── main.mjs          # Email/Password + Google sign-in handlers
├── SignUp/
│   ├── index.html        # Sign up page
│   └── main.mjs          # Email/Password + Google sign-up handlers
└── Posts/
    ├── index.html        # Posts dashboard (protected)
    └── main.mjs          # CRUD operations + auth state handling
```

## Google Sign-In Flow

1. User clicks "Continue with Google" button
2. `signInWithPopup(auth, googleProvider)` opens Google OAuth popup
3. On success, Firebase sets auth state
4. `onAuthStateChanged` listener triggers → redirects to Posts page
5. User's Google email is available via `user.email`

## Troubleshooting

| Error | Solution |
|-------|----------|
| `auth/operation-not-allowed` | Enable Google provider in Firebase Console |
| `auth/popup-blocked` | Ensure popup not blocked by browser |
| `auth/network-request-failed` | Check internet connection; may need HTTPS for Google OAuth |
| `No Firebase App '[DEFAULT]'` | Ensure `firebase.mjs` loads before `main.mjs` in HTML |
| `moment is not defined` | `moment.js` CDN script must be included in page |

## Development Notes

- Uses Firebase v12.12.1 modular SDK (tree-shakeable)
- ES modules with `type="module"` script tags
- No build step required — runs directly in browser
- All auth state is managed by Firebase (persistent across reloads)

## Future Enhancements

- Add user profile editing
- Implement post categories/tags
- Add rich text editor (e.g., Quill)
- Deploy to Firebase Hosting

---

Made with Firebase & ❤️
