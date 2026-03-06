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
git clone https://github.com/dnaveen189/Social_Media_Dashboard.git
cd Social_Media_Dashboard
```

### 2. Setup Backend

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend server:

```bash
npm run dev
```

### 3. Setup Frontend

Open a new terminal and navigate to the client directory:

```bash
cd client
npm install
```

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

Start the frontend development server:

```bash
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📁 Project Structure

```
Social_Media_Dashboard/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Redux store
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
├── server/                 # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── server.js          # Entry point
│   └── package.json
├── backup/                # Backup files
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create post
- `DELETE /api/posts/:id` - Delete post
- `PUT /api/posts/:id/like` - Like/unlike post

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/search` - Search users

### Friends
- `POST /api/friends/request` - Send friend request
- `PUT /api/friends/accept` - Accept friend request
- `DELETE /api/friends/:id` - Remove friend

### Messages
- `GET /api/messages/:userId` - Get conversation
- `POST /api/messages` - Send message

### Analytics
- `GET /api/analytics/posts` - Post analytics
- `GET /api/analytics/engagement` - Engagement metrics

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

- GitHub: [dnaveen189](https://github.com/dnaveen189)

## 🙏 Acknowledgments

- Thanks to all contributors
- Inspired by various social media platforms

