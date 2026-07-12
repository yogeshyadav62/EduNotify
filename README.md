# EduNotify

EduNotify is a modern, premium mobile notification system for educational institutions (schools, colleges, universities). It allows students, parents, and educators to view and post real-time academic reminders, transport alerts, fee notifications, and event details.

## 🚀 Features

- **Multi-Role Authentication**: Log in as a **Student**, **Parent**, or **Educator**.
- **Real-Time Notification Feed**: View notices categorized by *Academic*, *Fees*, *Events*, *Transport*, or *General*.
- **Quick Filters & Search**: Dynamically filter announcements using category chips and instant text search.
- **Announcement Detail Modal**: Expand notifications to review details, event dates, due amounts, and download PDF or image attachments.
- **Educator Broadcast Portal**: Educators (teachers) can post announcements directly in the app, which instantly update the notification feed using Redux state synchronization.
- **Global Alert System**: Custom slide-down Toast banners for action confirmations (e.g. logging out, publishing notices).

---

## 🎨 Theme & Styling

EduNotify is built with a premium design system powered by **NativeWind v4** (Tailwind CSS for React Native) and **React Native Reanimated**:

- **Primary**: `#2563EB` (Blue 600)
- **Secondary**: `#1D4ED8` (Blue 700)
- **Background**: `#F8FAFC` (Slate 50)
- **Card**: `#FFFFFF`
- **Border**: `#E2E8F0` (Slate 200)
- **Success**: `#16A34A` (Green 600)
- **Warning**: `#F59E0B` (Amber 600)
- **Error**: `#DC2626` (Red 600)
- **Text**: `#0F172A` (Slate 900)
- **Sub Text**: `#64748B` (Slate 500)

---

## 📂 Project Structure

```
EduNotify/
├── app/                      # Expo Router Navigation App Layer
│   ├── _layout.tsx           # Global Providers & Slide Toast Layout
│   ├── index.tsx             # Animated Splash / Auth Routing Gate
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   └── login.tsx         # Sign-in Screen & Dev Quick Logins
│   ├── (tabs)/
│   │   ├── _layout.tsx       # Bottom Tab Navigator with Badge
│   │   ├── home.tsx          # Analytics Stats & Category Overview
│   │   ├── notifications.tsx # Notices Feed, Details Sheet & Teacher FAB
│   │   └── profile.tsx       # Preferences settings & Logout button
│   └── +not-found.tsx        # 404 Fallback
│
├── src/                      # Core Codebase
│   ├── components/           # Reusable Component Library
│   │   ├── common/           # Custom inputs, buttons, loaders, empty state
│   │   ├── notification/     # Filter chips, cards, headers
│   │   └── profile/          # Profile widgets
│   ├── data/                 # Local Mock Database (notifications.json)
│   ├── hooks/                # Custom React Hooks (useNotifications, useLogin)
│   ├── lib/                  # Library Configs (queryClient, storage)
│   ├── redux/                # Redux Toolkit State Management
│   ├── services/             # API and Notification Synchronization Service
│   ├── theme/                # Global Design Tokens (colors, spacing, typography)
│   ├── types/                # TypeScript Interfaces
│   └── utils/                # Date helpers, formatters, and constants
│
├── tailwind.config.js        # Tailwind / NativeWind presets
├── babel.config.js           # Babel preset settings
└── metro.config.js           # Metro bundler compilation wrapper
```

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Metro Bundler
Start the project with a clean cache (highly recommended due to NativeWind & Reanimated build config changes):
```bash
npx expo start -c
```

### 3. Run on Emulators
- **Android**: Press `a` in the terminal or run `npx expo start --android`
- **iOS**: Press `i` in the terminal or run `npx expo start --ios`

---

## 🔑 Developer Quick Logins

For easy testing, you can use the **Quick Login** cards at the bottom of the sign-in screen, or type these credentials:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Student** | `student@edunotify.com` | `password` |
| **Parent** | `parent@edunotify.com` | `password` |
| **Educator (Teacher)** | `teacher@edunotify.com` | `password` |
