# CLOUDCOIN Expo App

Welcome to **CLOUDCOIN**, an Expo-based mobile app that demonstrates Google OAuth login, secure JWT token storage, and system integrity monitoring. This project is built with **React Native**, **Expo**, and **Expo Auth Session** and works on **iOS, Android, and Web**.

---

## Features

- **Google Sign-In** using OAuth 2.0 with PKCE.
- **Secure token storage** using Expo SecureStore (or localStorage on web).
- **Automatic login** if a valid token exists.
- **Logout** functionality that clears stored tokens.
- **System Integrity Status**:
  - View the status of AWS and Raspberry Pi systems.
  - Live local time display.
  - Last open time and “time ago” calculation.
  - Color-coded status indicators: Healthy (green), Stale (orange), Down (red).

---

 
## Installation & Setup

1. **Clone the repository**

```bash
git clone https://github.com/your-username/cloudcoin-app.git
cd cloudcoin-app
