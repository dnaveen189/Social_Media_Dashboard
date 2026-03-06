import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns'; // Fixed: was "date-fn" now "date-fns"
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';

const PostCard = ({ post, onUpdate }) => {
  const { user, token } = useSelector(state => state.auth);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [liked, setLiked] = useState(post.likes?.includes(user?.id) || false);
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [comments, setComments] = useState(post.comments || []);
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    // Optimistic update
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikesCount(prev => wasLiked ? prev - 1 : prev + 1);

    try {
      await axios.post(
        `http://localhost:5002/api/posts/${post._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdate();
    } catch (error) {
      // Revert on error
      setLiked(wasLiked);
      setLikesCount(prev => wasLiked ? prev + 1 : prev - 1);
      console.error('Like error:', error);
      toast.error('Failed to like post');
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim() || isCommenting) return;

    setIsCommenting(true);
    const commentText = comment;
    setComment('');

    try {
      const response = await axios.post(
        `http://localhost:5002/api/posts/${post._id}/comment`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setComments(prev => [...prev, response.data]);
      onUpdate();
      toast.success('Comment added');
    } catch (error) {
      console.error('Comment error:', error);
      toast.error('Failed to add comment');
      setComment(commentText); // Restore comment text
    } finally {
      setIsCommenting(false);
    }
  };

  const formatDate = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <img
            src={post.user?.avatar?.url || '/default-avatar.png'}
            alt={post.user?.name || 'User'}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h4 className="font-semibold">{post.user?.name || 'Unknown User'}</h4>
            <p className="text-xs text-gray-500">
              {formatDate(post.createdAt)}
            </p>
          </div>
        </div>
        <button className="text-gray-500 hover:text-gray-700">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Post Content */}
      <p className="mb-3">{post.caption}</p>
      
      {post.media && post.media.length > 0 && (
        <div className="mb-3 rounded-lg overflow-hidden">
          {post.media[0]?.mediaType === 'image' ? (
            <img
              src={post.media[0]?.url}
              alt="Post media"
              className="w-full h-auto max-h-96 object-cover"
            />
          ) : (
            <video 
              src={post.media[0]?.url} 
              controls 
              className="w-full max-h-96"
              controlsList="nodownload"
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      )}

      {/* Post Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
        <span>{likesCount} {likesCount === 1 ? 'like' : 'likes'}</span>
        <button 
          onClick={() => setShowComments(!showComments)}
          className="hover:text-gray-700"
        >
          {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-around border-t border-b py-2">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center space-x-2 px-4 py-2 rounded hover:bg-gray-100 transition-colors ${
            liked ? 'text-red-600' : 'text-gray-700'
          } disabled:opacity-50`}
        >
          <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
          <span>{liked ? 'Liked' : 'Like'}</span>
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
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <div key={comment._id || index} className="flex items-start space-x-2 mb-2">
                <img
                  src={comment.user?.avatar?.url || '/default-avatar.png'}
                  alt={comment.user?.name || 'User'}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <div className="flex-1 bg-gray-100 rounded-lg p-2">
                  <p className="text-sm font-semibold">{comment.user?.name || 'Unknown User'}</p>
                  <p className="text-sm">{comment.text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(comment.createdAt)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-2">No comments yet</p>
          )}

          <form onSubmit={handleComment} className="flex items-center space-x-2 mt-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
              disabled={isCommenting}
            />
            <button
              type="submit"
              disabled={!comment.trim() || isCommenting}
              className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm disabled:opacity-50 hover:bg-blue-700 transition-colors"
            >
              {isCommenting ? 'Posting...' : 'Post'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;