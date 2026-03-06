# Social Media Dashboard - MERN Stack Application

A full-stack social media platform with real-time messaging, friend requests, and analytics dashboard.

![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 🚀 Features

### 🔐 Authentication
- User registration and login with JWT
- Password encryption with bcrypt
- Protected routes

### 👤 User Profiles
- Custom profile pictures with Cloudinary upload
- Bio and personal information
- Friend management system

### 📝 Posts
- Create posts with text and media (images/videos)
- Like and comment on posts
- Delete your own posts

### 🤝 Friend System
- Send friend requests to other users
- Accept/reject friend requests
- Real-time notifications via Socket.io
- View friends list
- Unfriend users

### 💬 Real-time Chat
- One-on-one messaging with Socket.io
- Online/offline status
- Typing indicators
- Read receipts
- Message history

### 📊 Analytics Dashboard
- User engagement metrics
- Post performance tracking
- Interactive charts using Chart.js
- Filter by time range (week/month/year)

### 🎨 UI/UX
- Responsive design with Tailwind CSS
- Modern and clean interface
- Loading states and error handling
- Toast notifications

## 🛠️ Tech Stack

### Frontend
- **React.js** (Vite) - UI library
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Socket.io-client** - Real-time communication
- **Tailwind CSS** - Styling
- **Chart.js** - Analytics visualizations
- **Lucide React** - Icons
- **Axios** - HTTP requests
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** with **Mongoose** - Database
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **Cloudinary** - Media storage
- **Multer** - File upload handling
- **Bcrypt** - Password hashing

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (for image uploads)
- Git

## 🔧 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/dnaveen189/social-media-dashboard.git
cd social-media-dashboard