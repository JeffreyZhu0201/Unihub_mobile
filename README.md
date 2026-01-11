# 📱 UniHub Mobile Client

![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Platform](https://img.shields.io/badge/Platform-Android%20|%20iOS-lightgrey?style=for-the-badge)

A React Native mobile application built with **Expo** for the UniHub Campus Management System. This client is primarily designed for students to manage their campus activities, check-ins, and requests.

---

## ✨ Features

### 🔐 Authentication
- **User Registration**: Student role onboarding.
- **Secure Login**: JWT-based authentication with secure token storage.
- **Session Management**: Auto-refresh and persistent login.

### 📍 Check-ins (Dings)
- **Task List**: Real-time view of pending and completed check-in tasks.
- **Location Verification**: GPS-based fencing for classroom and event attendance.
- **Dorm Checks**: Specific workflows for dormitory presence verification.
- **Status Reporting**: Automatic tracking of On-time, Late, and Missed statuses.

### 🏢 Organization Management
- **Smart Profile**: comprehensive view of student info and organization affiliations.
- **Seamless Joining**: Join Departments and Classes instantly using unique invite codes.

### 📝 Leave Management
- **Easy Application**: Submit Sick or Personal leave requests in seconds.
- **Smart Validation**: Client-side validation for dates and reasons.
- **Status Tracking**: Visual history of requests (Approved ✅, Pending ⏳, Rejected ❌).

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| **[Expo](https://expo.dev)** | React Native Framework & Runtime |
| **[React Native](https://reactnative.dev)** | UI Library |
| **[TypeScript](https://www.typescriptlang.org/)** | Type Safety |
| **[Expo Router](https://docs.expo.dev/router/introduction)** | File-based Navigation |
| **Fetch API** | Network Requests (with Interceptors) |
| **Ionicons** | UI Icons |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (LTS)
- npm or yarn
- **Expo Go** app on your physical device OR Android Studio/Xcode for emulation.

### Installation

1. **Clone & Install**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Update `services/api.ts` to match your backend environment:

   ```typescript
   // services/api.ts
   
   // 🤖 For Android Emulator
   const API_BASE_URL = 'http://10.0.2.2:8080/api/v1'; 
   
   // 🍎 For iOS Simulator
   // const API_BASE_URL = 'http://localhost:8080/api/v1';
   
   // 📱 For Physical Device (Same Wi-Fi)
   // const API_BASE_URL = 'http://<YOUR_LOCAL_IP>:8080/api/v1';
   ```

3. **Run the App**
   ```bash
   npx expo start
   ```
   > Scan the QR code with Expo Go (Android/iOS) or press `a` for Android Emulator.

---

## 📂 Project Structure

```text
app/
├── (tabs)/           # 📑 Main Tab Navigation
│   ├── index.tsx     # Home/Dashboard
│   ├── join.tsx      # Join Org/Class Screen
│   ├── leave.tsx     # Leave Application Form
│   └── profile.tsx   # User Profile
├── auth/             # 🔐 Auth Screens
│   ├── login.tsx
│   └── register.tsx
├── checkin/
│   └── [id].tsx      # 📍 Check-in Detail & Action
└── _layout.tsx       # Root Layout & Providers

services/
└── api.ts            # 🌐 API Client & Endpoints
```

## 📱 Development Config

- **Android Emulator Networking**: The app is pre-configured to communicate with localhost via `10.0.2.2`.
- **Cleartext Traffic**: Enabled in `app.json` to allow HTTP connections for local development (no SSL required).
