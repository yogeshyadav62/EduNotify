# EduNotify - Educational Notification System

EduNotify is a modern, premium multi-platform notification system designed for educational institutions. It facilitates real-time communication between administrators, educators, and students. Administrators can manage classes, students, and post announcements from a central dashboard, while students receive instant, secure notification alerts on their mobile app via WebSockets.

---

## 📂 Project Architecture

The project is structured as a clean, modular workspace divided into three main service directories:

```
EduNotify/
├── edunotify-backend/      # Express.js REST API & Socket.IO server
├── edunotify-admin/        # React & Vite admin dashboard web app
└── edunotify-mobile-app/   # React Native & Expo mobile application
```

---

## 🚀 Key Improvements & Features Implemented

1. **Clean Directory Reorganization**: Separated the codebases into clean folders for Frontend Admin, Express Backend, and React Native Mobile App to establish clear boundaries.
2. **Real-time Sync (Socket.IO)**: Announcements posted in the Admin Dashboard instantly trigger live notifications on students' mobile feeds without requiring page updates.
3. **Custom Premium UI Modals**: Replaced all native browser `window.confirm()` alerts with custom, high-fidelity Styled Modals for Delete & Logout actions to maintain visual design consistency.
4. **Enhanced Feedback System**: Repositioned toast notifications to the top-right corner of the Admin Panel screen for better visibility and modern design flow.
5. **Secure Targeting Guard**: Backend validation prevents accidental deletion of classes containing active students, preserving database integrity.

---

## 🛠️ Getting Started

Follow these steps to run the complete stack locally:

### 1. Backend Server Setup
Go to the backend directory, install packages, set up configurations, and start:
```bash
cd edunotify-backend
# Make sure to set your MONGODB_URI in .env (we support automatic local fallback SQLite as well if needed)
npm install
npm run dev
```
*The backend server will run on `http://localhost:4500`.*
*The first run will seed the default Admin credentials into the database.*

### 2. Admin Dashboard Setup
Go to the admin web dashboard directory, install packages, and start:
```bash
cd edunotify-admin
npm install
npm run dev
```
*The dashboard will start on `http://localhost:5173` (or the next available port).*

### 3. Mobile App Setup
Go to the Expo mobile app directory, install packages, and start:
```bash
cd edunotify-mobile-app
npm install
# Start metro bundler with clean cache
npx expo start -c
```
*Press `a` for Android Emulator or `i` for iOS Simulator.*
*(Note: If testing on physical devices, change `BASE_URL` in `src/utils/Routes.ts` to your machine's local wireless network IP, e.g. `http://192.168.1.15:4500`)*

---

## 🔑 Login Testing Credentials

### 1. Admin Dashboard Credentials
Use these to log in to the web panel to manage classes, students, and send notifications:
* **Username**: `admin`
* **Password**: `admin123`

### 2. Student Mobile App Credentials
Use these combination of credentials to log in to the mobile feed and test the secure notification filtering logic:

| Student Name | Student ID | Class ID (Password) | Target Filtering Rules |
| :--- | :--- | :--- | :--- |
| **Aarav Sharma** | `STU-101` | `CS-101` | Renders `CS-101` broadcasts & Aarav's personal alerts. |
| **Priyal Patel** | `STU-202` | `CS-202` | Renders `CS-202` broadcasts & Priyal's personal alerts. |
| **Rohan Joshi** | `STU-303` | `BCA-2A` | Renders `BCA-2A` broadcasts & Rohan's personal alerts. |

*(Note: There is no separate password field in the student app. Use the **Student ID** and **Class ID** from the table above to authenticate).*
