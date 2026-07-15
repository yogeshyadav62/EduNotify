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

| **Yogesh Yadav** | `STU-101` | `CS-101` | Receives CS-202 announcements and personal notifications |
| **Tina Pawar** | `STU-104` | `MCA-104` | Receives CS-202 

announcements and personal notifications |


*(Note: There is no separate password field in the student app. Use the **Student ID** and **Class ID** from the table above to authenticate).*

---

## 🗄️ Database Schema Description

The system defines four main database models:

### 1. Class Schema (`Class`)
* **`id` / `_id`** (`String`, Required): Unique ID representing the class code (e.g., `CS-202`).
* **`name`** (`String`, Required): Full human-readable name of the class batch.

### 2. Student Schema (`Student`)
* **`studentId` / `_id`** (`String`, Required): Unique ID representing the student (e.g., `STU-101`).
* **`name`** (`String`, Required): Full name of the student.
* **`classId`** (`String`, Ref: `'Class'`, Required): Linked Class ID code.
* **`email`** (`String`, Optional): Optional email address.
* **`mobile`** (`String`, Optional): Optional mobile number.
* **`fcmToken`** (`String`, Optional): Token for Firebase Cloud Messaging.
* **`profilePicUrl`** (`String`, Optional): Cloudinary avatar image URL.

### 3. Notification Schema (`Notification`)
* **`title`** (`String`, Required): Title of notice (Automatically capitalized).
* **`description`** (`String`, Required): Description paragraph of notice (Automatically capitalized).
* **`facultyName`** (`String`, Required): Name of posting faculty member.
* **`category`** (`String`, Required): Notice category: `academic`, `fees`, `events`, `transport`.
* **`targetType`** (`String`, Required): Notice target audience: `class` or `student`.
* **`classId`** (`String`, Ref: `'Class'`, Optional): Filter target class ID.
* **`studentId`** (`String`, Ref: `'Student'`, Optional): Specific student target receiver ID.
* **`status`** (`String`, Default: `'published'`): Delivery status: `draft` or `published`.
* **`scheduledFor`** (`Date`, Optional): Scheduled timestamp for future automated dispatch.
* **`dateTime`** (`Date`, Default: Now): DateTime notice was published.
* **`attachmentUrl`** (`String`, Optional): Uploaded image/file URL.
* **`attachmentType`** (`String`, Optional): MIME file type of attachment (e.g. `image/jpeg` or `application/pdf`).
* **`isDelivered`** (`Boolean`, Default: `false`): Sync status indicator.
* **`isSeen`** (`Boolean`, Default: `false`): Read/seen indicator.

### 4. Admin Schema (`Admin`)
* **`username`** (`String`, Required, Unique): Admin dashboard login ID.
* **`password`** (`String`, Required): Hashed password string.
* **`name`** (`String`, Required): User profile display name.
* **`role`** (`String`, Default: `'admin'`): User permission role.

---

## 🔌 Backend API Documentation

### 1. Admin Endpoints (`/api/admin`)
* **`POST /auth/login`**: Authenticate administrator dashboard and return JWT.
* **`GET /classes`**: Retrieve list of all classes.
* **`POST /classes`**: Create a new class database record.
* **`PUT /classes/:id`**: Modify class details.
* **`DELETE /classes/:id`**: Securely delete class (fails if active student relationships exist).
* **`GET /students`**: Retrieve list of all registered students.
* **`POST /students`**: Register a new student and assign to Class.
* **`PUT /students/:studentId`**: Edit student profiles.
* **`DELETE /students/:studentId`**: Deregister a student record.
* **`GET /notifications`**: Fetch all notice histories.
* **`POST /notifications`**: Publish or schedule notification (Supports single-file `'attachment'` uploads with image cropping).
* **`PUT /notifications/:id`**: Update notice fields or reschedule.
* **`DELETE /notifications/:id`**: Terminate/delete an announcement entry.

### 2. Student App Endpoints (`/api/student`)
* **`POST /auth/login`**: Validate Student ID & Class ID credentials.
* **`GET /notifications`**: Fetch secure, target-filtered personal & class broadcast notices.
* **`PUT /fcm-token`**: Register/update mobile app FCM push token.
* **`PUT /notifications/:id/delivered`**: Flag notice status as delivered to client device.
* **`PUT /notifications/:id/seen`**: Mark notice status as Read/Seen.
* **`GET /profile`**: Retrieve student avatar & credentials.
* **`PUT /profile`**: Update student profile settings.
* **`PUT /profile/avatar`**: Upload/change student profile picture.

---

## 🐳 Docker Deployment Setup

You can build and launch the backend service containerized using Docker:

### 1. Build and Run Stack
In the root directory, spin up the backend service in detached mode:
```bash
docker-compose up --build -d
```
*The database automatically initializes and runs on port `4500`.*

### 2. View Container Logs
```bash
docker logs -f edunotify-backend-service
```

---

## 🧪 Running Unit Tests
EduNotify utilizes Node's modern native test runner (`node:test`) for dependency-free, ES module compatible unit testing:
```bash
cd edunotify-backend
npm test
```
*Verifies text formatting utilities, regex filters, and student ID constraints successfully.*

