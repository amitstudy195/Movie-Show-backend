# 🎬 Movie Show - Premium MERN Movie Booking Experience

**Movie Show** is a full-stack MERN application that redefines the digital cinema experience. Built with a focus on high-performance architecture and premium aesthetics, it provides a seamless end-to-end journey from discovery to the theater seat.

---

## 🌟 Key Features

### 🔐 Secure Authentication
- **Email OTP System**: Specialized security using Nodemailer for Email verification and cryptographically secure tokens.
- **Resend with Cooldown**: Professional security flow with 30-second cooldown timers to prevent spam and ensure delivery.

### 🗓️ Smart Booking & Date Tracking
- **Live Show Scheduling**: Advanced selection system that captures specific calendar dates for screenings within a 7-day window.
- **Persistent Show Data**: Dedicated database schema to track screening dates independently of transaction timestamps.

### 🖨️ Professional A4 Print Engine
- **Official E-Tickets**: Specialized `@media print` CSS layer that isolates tickets and scales them perfectly for A4 paper.
- **Ink-Efficient Design**: Automatic color reversal for printing (Dark Mode on screen -> High-contrast White for paper).
- **Embedded Billing**: Each ticket serves as an official receipt, including total amount paid and transparent tax info.

### 🛰️ Dynamic Location Services
- **Autonomous Geolocation**: Automatic city detection upon entry to serve localized cinema schedules.
- **Theater Synchronicity**: Real-time filtering of theaters and shows based on the user's active city.

### 📊 Admin Control Center
- **Business Insights**: Real-time analytics dashboard for monitoring sales and venue performance.
- **Inventory Management**: Secure administrative tools for managing theater listings and movie schedules.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose ODM |
| **Security** | JWT, bcrypt.js, Crypto |
| **Notifications** | Nodemailer (Email) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas or Local Instance
- SMTP Credentials (for Email OTP)

### Installation

1. **Clone the repository**
   ```bash
    cd movie-show
    cd backend
    ```

### 🗝️ Test & Admin Credentials
To review the full functionality without creating your own account:
- **Reviewer Account**: `reviewer@guvi.com` / `123456`
- **Admin Panel**: `admin@movieshow.com` / `admin123`

> [!IMPORTANT]
> **Render Cold Start**: This project is hosted on Render's free tier. If the site has not been visited recently, the backend may take **up to 60 seconds** to "wake up" on the first request. Please wait for the first response before testing features.

2. **Backend Setup**
   ```bash
   cd backend
    npm install
    # Create a .env file and copy values from .env.example
    # Set MONGODB_URI and JWT_SECRET
    npm run dev
    ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

---

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
