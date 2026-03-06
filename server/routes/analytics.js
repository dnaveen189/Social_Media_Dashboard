import express from 'express';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Test analytics endpoint
router.get('/', verifyToken, async (req, res) => {
  try {
    // Return mock data for testing
    const mockData = {
      totalUsers: 1250,
      totalPosts: 3420,
      totalLikes: 15678,
      totalMessages: 8923,
      userGrowth: 12,
      postGrowth: 8,
      likeGrowth: 15,
      messageGrowth: 10,
      dailyEngagement: [
        { date: '2024-03-01', posts: 45, likes: 230, comments: 89, messages: 120 },
        { date: '2024-03-02', posts: 52, likes: 278, comments: 95, messages: 145 },
        { date: '2024-03-03', posts: 38, likes: 198, comments: 76, messages: 98 },
        { date: '2024-03-04', posts: 63, likes: 312, comments: 112, messages: 167 },
        { date: '2024-03-05', posts: 41, likes: 245, comments: 83, messages: 134 },
        { date: '2024-03-06', posts: 55, likes: 289, comments: 104, messages: 156 },
        { date: '2024-03-07', posts: 47, likes: 267, comments: 91, messages: 142 }
      ],
      postTypes: [
        { type: 'image', count: 2150 },
        { type: 'video', count: 870 },
        { type: 'text', count: 400 }
      ],
      topPosts: [
        {
          _id: '1',
          caption: 'Amazing sunset view!',
          media: [{ url: 'https://via.placeholder.com/300' }],
          likes: 342,
          comments: 56,
          createdAt: new Date().toISOString(),
          user: { name: 'John Doe', avatar: { url: 'https://via.placeholder.com/50' } }
        },
        {
          _id: '2',
          caption: 'Check out this new feature',
          media: [{ url: 'https://via.placeholder.com/300' }],
          likes: 289,
          comments: 43,
          createdAt: new Date().toISOString(),
          user: { name: 'Jane Smith', avatar: { url: 'https://via.placeholder.com/50' } }
        }
      ]
    };
    
    res.json(mockData);
  } catch (error) {
    console.error('Error in analytics route:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;