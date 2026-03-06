import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import Post from '../models/Post.js';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Log Cloudinary config (remove in production)
console.log('✅ Cloudinary configured for cloud:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('✅ Cloudinary API Key exists:', !!process.env.CLOUDINARY_API_KEY);
console.log('✅ Cloudinary API Secret exists:', !!process.env.CLOUDINARY_API_SECRET);

// Use memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Helper function to upload buffer to cloudinary
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'social-media/posts',
        resource_type: 'auto',
        ...options
      },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error);
          reject(error);
        } else {
          console.log('✅ Cloudinary upload success:', result.secure_url);
          resolve(result);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// Create a post
router.post('/', verifyToken, upload.array('media', 5), async (req, res) => {
  try {
    const { caption } = req.body;
    
    console.log('\n📝 Creating post for user:', req.user._id);
    console.log('📝 Caption received:', caption || '(empty)');
    console.log('📝 Files received:', req.files?.length || 0);

    if (req.files && req.files.length > 0) {
      console.log('📝 File details:');
      req.files.forEach((file, index) => {
        console.log(`  File ${index + 1}: ${file.originalname} (${file.mimetype}, ${file.size} bytes)`);
      });
    }

    const media = [];

    // Upload each file to Cloudinary
    if (req.files && req.files.length > 0) {
      console.log('📤 Uploading', req.files.length, 'files to Cloudinary...');
      
      for (const file of req.files) {
        try {
          console.log(`📤 Uploading: ${file.originalname}`);
          
          const result = await uploadToCloudinary(file.buffer, {
            public_id: `post_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            resource_type: 'auto'
          });
          
          media.push({
            public_id: result.public_id,
            url: result.secure_url,
            mediaType: file.mimetype.startsWith('image/') ? 'image' : 'video'
          });
          
          console.log(`✅ Uploaded: ${result.secure_url}`);
        } catch (uploadError) {
          console.error('❌ Error uploading file:', uploadError);
          // Continue with other files even if one fails
        }
      }
    }

    const post = new Post({
      user: req.user._id,
      caption: caption || '',
      media
    });

    await post.save();
    console.log('✅ Post saved with ID:', post._id);
    console.log('✅ Media count:', post.media.length);

    await post.populate('user', 'name avatar');

    res.status(201).json(post);
  } catch (error) {
    console.error('❌ Error creating post:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get feed posts - Updated to use friends instead of following
router.get('/feed', verifyToken, async (req, res) => {
  try {
    console.log('📥 Fetching feed for user:', req.user._id);
    
    const currentUser = await User.findById(req.user._id);
    
    // Show posts from user and their friends
    const posts = await Post.find({
      $or: [
        { user: { $in: currentUser.friends } }, // Changed from following to friends
        { user: req.user._id }
      ]
    })
      .populate('user', 'name avatar')
      .populate('comments.user', 'name avatar')
      .sort('-createdAt')
      .limit(20);

    console.log(`✅ Found ${posts.length} posts for feed`);
    res.json(posts);
  } catch (error) {
    console.error('❌ Error fetching feed:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get posts by user ID (for profile page)
router.get('/user/:userId', verifyToken, async (req, res) => {
  try {
    console.log('📥 Fetching posts for user:', req.params.userId);
    
    const posts = await Post.find({ user: req.params.userId })
      .populate('user', 'name avatar')
      .populate('comments.user', 'name avatar')
      .sort('-createdAt');

    console.log(`✅ Found ${posts.length} posts for user ${req.params.userId}`);
    res.json(posts);
  } catch (error) {
    console.error('❌ Error fetching user posts:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single post
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'name avatar')
      .populate('comments.user', 'name avatar');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    console.error('❌ Error fetching post:', error);
    res.status(500).json({ message: error.message });
  }
});

// Like a post
router.post('/:id/like', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(req.user._id);
    if (likeIndex === -1) {
      post.likes.push(req.user._id);
      console.log(`✅ User ${req.user._id} liked post ${req.params.id}`);
    } else {
      post.likes.splice(likeIndex, 1);
      console.log(`✅ User ${req.user._id} unliked post ${req.params.id}`);
    }

    await post.save();
    res.json({ likes: post.likes });
  } catch (error) {
    console.error('❌ Error liking post:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add comment
router.post('/:id/comment', verifyToken, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = {
      user: req.user._id,
      text,
      createdAt: new Date()
    };

    post.comments.push(comment);
    await post.save();

    // Populate user info for the new comment
    const populatedPost = await Post.findById(req.params.id)
      .populate('comments.user', 'name avatar');

    const newComment = populatedPost.comments[populatedPost.comments.length - 1];
    console.log(`✅ User ${req.user._id} commented on post ${req.params.id}`);

    res.status(201).json(newComment);
  } catch (error) {
    console.error('❌ Error adding comment:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete post
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the owner
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    // Delete media from Cloudinary
    if (post.media && post.media.length > 0) {
      console.log(`🗑️ Deleting ${post.media.length} files from Cloudinary...`);
      for (const media of post.media) {
        if (media.public_id) {
          try {
            await cloudinary.uploader.destroy(media.public_id);
            console.log(`✅ Deleted: ${media.public_id}`);
          } catch (err) {
            console.error('❌ Error deleting media from Cloudinary:', err);
          }
        }
      }
    }

    await post.deleteOne();
    console.log(`✅ Post ${req.params.id} deleted successfully`);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting post:', error);
    res.status(500).json({ message: error.message });
  }
});

// Test route to check all posts
router.get('/test/all', verifyToken, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', 'name avatar')
      .sort('-createdAt');
    res.json({ count: posts.length, posts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;