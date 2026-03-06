import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function testCloudinary() {
  console.log('Testing Cloudinary connection...');
  console.log('Cloud name:', process.env.CLOUDINARY_CLOUD_NAME);
  
  try {
    // Try to get account info
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful:', result);
    
    // Try to upload a test image
    const testResult = await cloudinary.uploader.upload('https://res.cloudinary.com/demo/image/upload/sample.jpg', {
      public_id: 'test_connection'
    });
    console.log('✅ Test upload successful:', testResult.secure_url);
    
    // Clean up
    await cloudinary.uploader.destroy('test_connection');
    console.log('✅ Test cleanup successful');
    
  } catch (error) {
    console.error('❌ Cloudinary error:', error.message);
    console.log('\nCurrent .env values:');
    console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✓ Set' : '✗ Missing');
    console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✓ Set' : '✗ Missing');
  }
}

testCloudinary();