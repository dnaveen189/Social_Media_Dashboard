import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';

const PostCard = ({ post, onUpdate }) => {
  const { user, token } = useSelector(state => state.auth);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [liked, setLiked] = useState(post.likes.includes(user?.id));

  const handleLike = async () => {
    try {
      await axios.post(
        `http://localhost:5002/api/posts/${post._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLiked(!liked);
      onUpdate();
    } catch (err) {  // Renamed from 'error' to 'err'
      toast.error('Failed to like post');
      console.error('Like error:', err);  // Use the error variable
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await axios.post(
        `http://localhost:5002/api/posts/${post._id}/comment`,
        { text: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComment('');
      onUpdate();
      toast.success('Comment added');
    } catch (err) {  // Renamed from 'error' to 'err'
      toast.error('Failed to add comment');
      console.error('Comment error:', err);  // Use the error variable
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <img
            src={post.user.avatar?.url || '/default-avatar.png'}
            alt={post.user.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h4 className="font-semibold">{post.user.name}</h4>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        <button className="text-gray-500 hover:text-gray-700">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Post Content */}
      <p className="mb-3">{post.caption}</p>
      
      {post.media.length > 0 && (
        <div className="mb-3 rounded-lg overflow-hidden">
          {post.media[0].mediaType === 'image' ? (
            <img
              src={post.media[0].url}
              alt="Post media"
              className="w-full h-auto max-h-96 object-cover"
            />
          ) : (
            <video src={post.media[0].url} controls className="w-full" />
          )}
        </div>
      )}

      {/* Post Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
        <span>{post.likes.length} likes</span>
        <button 
          onClick={() => setShowComments(!showComments)}
          className="hover:text-gray-700"
        >
          {post.comments.length} comments
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-around border-t border-b py-2">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-2 px-4 py-2 rounded hover:bg-gray-100 ${
            liked ? 'text-red-600' : 'text-gray-700'
          }`}
        >
          <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
          <span>Like</span>
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 px-4 py-2 rounded hover:bg-gray-100 text-gray-700"
        >
          <MessageCircle size={20} />
          <span>Comment</span>
        </button>
        <button className="flex items-center space-x-2 px-4 py-2 rounded hover:bg-gray-100 text-gray-700">
          <Share2 size={20} />
          <span>Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-3">
          {post.comments.map(comment => (
            <div key={comment._id} className="flex items-start space-x-2 mb-2">
              <img
                src={comment.user.avatar?.url || '/default-avatar.png'}
                alt={comment.user.name}
                className="w-6 h-6 rounded-full object-cover"
              />
              <div className="flex-1 bg-gray-100 rounded-lg p-2">
                <p className="text-sm font-semibold">{comment.user.name}</p>
                <p className="text-sm">{comment.text}</p>
              </div>
            </div>
          ))}

          <form onSubmit={handleComment} className="flex items-center space-x-2 mt-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!comment.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm disabled:opacity-50"
            >
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;