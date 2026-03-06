// Test script to check posts in database
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Post from './models/Post.js';
import User from './models/User.js';

dotenv.config();

async function checkPosts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Count total posts
    const totalPosts = await Post.countDocuments();
    console.log(`📊 Total posts in database: ${totalPosts}`);

    if (totalPosts === 0) {
      console.log('❌ No posts found in database');
      
      // Check if there are any users
      const totalUsers = await User.countDocuments();
      console.log(`👤 Total users: ${totalUsers}`);
      
      if (totalUsers === 0) {
        console.log('❌ No users found either. You need to create users first.');
      } else {
        const users = await User.find().select('name email');
        console.log('\nAvailable users:');
        users.forEach((user, i) => {
          console.log(`${i + 1}. ${user.name} (${user.email})`);
        });
      }
    } else {
      // Fetch all posts with user details
      const posts = await Post.find()
        .populate('user', 'name email avatar')
        .sort('-createdAt');

      console.log('\n📝 All Posts:');
      console.log('-------------------');
      
      posts.forEach((post, index) => {
        console.log(`\nPost #${index + 1}:`);
        console.log(`  ID: ${post._id}`);
        console.log(`  User: ${post.user?.name || 'Unknown'} (${post.user?.email || 'No email'})`);
        console.log(`  Caption: ${post.caption || 'No caption'}`);
        console.log(`  Media: ${post.media?.length || 0} files`);
        console.log(`  Likes: ${post.likes?.length || 0}`);
        console.log(`  Comments: ${post.comments?.length || 0}`);
        console.log(`  Created: ${post.createdAt}`);
        console.log(`  Has media: ${post.media && post.media.length > 0 ? '✅' : '❌'}`);
        
        if (post.media && post.media.length > 0) {
          console.log(`  Media URL: ${post.media[0].url}`);
        }
      });
    }

    console.log('\n✅ Database check complete');
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkPosts();