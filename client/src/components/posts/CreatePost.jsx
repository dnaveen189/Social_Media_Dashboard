import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Image, Video, X, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const CreatePost = ({ onPostCreated }) => {
  const { user, token } = useSelector(state => state.auth);
  const [caption, setCaption] = useState('');
  const [media, setMedia] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types
    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/') || file.type.startsWith('video/');
      if (!isValid) {
        toast.error(`${file.name} is not a valid image or video`);
      }
      return isValid;
    });

    if (validFiles.length === 0) return;

    console.log('Selected files:', validFiles.map(f => ({ name: f.name, type: f.type, size: f.size })));
    
    setMedia(prev => [...prev, ...validFiles]);

    // Create preview URLs
    const previews = validFiles.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 'video',
      name: file.name
    }));
    setMediaPreviews(prev => [...prev, ...previews]);
  };

  const removeMedia = (index) => {
    const newMedia = [...media];
    const newPreviews = [...mediaPreviews];
    
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(newPreviews[index].url);
    
    newMedia.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setMedia(newMedia);
    setMediaPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!caption.trim() && media.length === 0) {
      toast.error('Please add caption or media');
      return;
    }

    setUploading(true);
    
    // Create FormData and append data
    const formData = new FormData();
    
    // Append caption
    formData.append('caption', caption);
    console.log('Appending caption:', caption);
    
    // Append each media file with the field name 'media'
    media.forEach((file, index) => {
      console.log(`Appending file ${index + 1}:`, file.name, 'type:', file.type);
      formData.append('media', file); // Important: field name must be 'media'
    });

    // Log FormData contents for debugging
    console.log('FormData entries:');
    for (let pair of formData.entries()) {
      if (pair[0] === 'media') {
        console.log('  media:', pair[1].name, '(', pair[1].type, ')');
      } else {
        console.log('  ', pair[0] + ':', pair[1]);
      }
    }

    try {
      console.log('Sending post request to server...');
      console.log('Token exists:', !!token);
      
      const response = await axios.post('http://localhost:5002/api/posts', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Post created successfully:', response.data);
      
      toast.success('Post created successfully!');
      
      // Clear form
      setCaption('');
      
      // Clean up preview URLs
      mediaPreviews.forEach(preview => URL.revokeObjectURL(preview.url));
      setMedia([]);
      setMediaPreviews([]);
      
      // Call the callback to update feed
      if (onPostCreated) {
        console.log('Calling onPostCreated with new post');
        onPostCreated(response.data);
      }
    } catch (err) {
      console.error('Error creating post:', err);
      
      if (err.response) {
        // The request was made and the server responded with a status code
        console.error('Server response:', err.response.data);
        toast.error(`Server error: ${err.response.data.message || 'Failed to create post'}`);
      } else if (err.request) {
        // The request was made but no response was received
        console.error('No response from server');
        toast.error('Cannot connect to server. Please check if backend is running.');
      } else {
        // Something happened in setting up the request
        console.error('Request setup error:', err.message);
        toast.error(err.message || 'Failed to create post');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex items-start space-x-3 mb-3">
        <img
          src={user?.avatar?.url || '/default-avatar.png'}
          alt={user?.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <textarea
            placeholder="What's on your mind?"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full border rounded-lg p-3 resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            rows="3"
            disabled={uploading}
          />
        </div>
      </div>

      {/* Media Previews */}
      {mediaPreviews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
          {mediaPreviews.map((preview, index) => (
            <div key={index} className="relative group">
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-100">
                {preview.type === 'image' ? (
                  <img
                    src={preview.url}
                    alt={`Preview ${index}`}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <video
                    src={preview.url}
                    className="w-full h-32 object-cover"
                    controls
                  />
                )}
              </div>
              <button
                onClick={() => removeMedia(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={uploading}
              >
                <X size={16} />
              </button>
              <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                {preview.type === 'image' ? '📷 Photo' : '🎥 Video'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between border-t pt-3">
        <div className="flex space-x-4">
          <label className={`cursor-pointer flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <Image size={20} className="text-blue-600" />
            <span className="text-sm font-medium">Photo</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleMediaChange}
              className="hidden"
              disabled={uploading}
            />
          </label>
          <label className={`cursor-pointer flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <Video size={20} className="text-green-600" />
            <span className="text-sm font-medium">Video</span>
            <input
              type="file"
              accept="video/*"
              multiple
              onChange={handleMediaChange}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={uploading || (!caption.trim() && media.length === 0)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? (
            <>
              <Loader size={18} className="animate-spin" />
              <span>Posting...</span>
            </>
          ) : (
            <span>Post</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default CreatePost;