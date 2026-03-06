import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { UserPlus, UserCheck, UserX, Clock } from 'lucide-react';
import { sendFriendRequest, acceptFriendRequest, rejectFriendRequest, unfriend } from '../../store/slices/friendSlice';
import toast from 'react-hot-toast';

const FriendButton = ({ userId }) => {
  const dispatch = useDispatch();
  const { token, user } = useSelector(state => state.auth);
  const [status, setStatus] = useState('none'); // none, pending_sent, pending_received, friends
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkFriendStatus = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5002/api/friend-requests/status/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStatus(response.data.status);
      } catch (error) {
        console.error('Error checking friend status:', error);
      } finally {
        setLoading(false);
      }
    };
    checkFriendStatus();
  }, [userId, token]);

  const handleSendRequest = async () => {
    try {
      await dispatch(sendFriendRequest(userId)).unwrap();
      setStatus('pending_sent');
      toast.success('Friend request sent');
    } catch (error) {
      toast.error(error.message || 'Failed to send request');
    }
  };

  const handleAcceptRequest = async () => {
    try {
      await dispatch(acceptFriendRequest(userId)).unwrap();
      setStatus('friends');
      toast.success('Friend request accepted');
    } catch (error) {
      toast.error(error.message || 'Failed to accept request');
    }
  };

  const handleRejectRequest = async () => {
    try {
      await dispatch(rejectFriendRequest(userId)).unwrap();
      setStatus('none');
      toast.success('Friend request rejected');
    } catch (error) {
      toast.error(error.message || 'Failed to reject request');
    }
  };

  const handleUnfriend = async () => {
    if (window.confirm('Are you sure you want to unfriend this person?')) {
      try {
        await dispatch(unfriend(userId)).unwrap();
        setStatus('none');
        toast.success('Unfriended successfully');
      } catch (error) {
        toast.error(error.message || 'Failed to unfriend');
      }
    }
  };

  const handleCancelRequest = async () => {
    try {
      await dispatch(rejectFriendRequest(userId)).unwrap();
      setStatus('none');
      toast.success('Friend request cancelled');
    } catch (error) {
      toast.error(error.message || 'Failed to cancel request');
    }
  };

  if (loading) {
    return (
      <button className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg opacity-50 cursor-wait" disabled>
        Loading...
      </button>
    );
  }

  // Don't show button for own profile
  if (user?.id === userId) {
    return null;
  }

  switch (status) {
    case 'friends':
      return (
        <button
          onClick={handleUnfriend}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <UserX size={18} />
          <span>Unfriend</span>
        </button>
      );

    case 'pending_sent':
      return (
        <button
          onClick={handleCancelRequest}
          className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
        >
          <Clock size={18} />
          <span>Request Sent</span>
        </button>
      );

    case 'pending_received':
      return (
        <div className="flex space-x-2">
          <button
            onClick={handleAcceptRequest}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <UserCheck size={18} />
            <span>Accept</span>
          </button>
          <button
            onClick={handleRejectRequest}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <UserX size={18} />
            <span>Reject</span>
          </button>
        </div>
      );

    default:
      return (
        <button
          onClick={handleSendRequest}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus size={18} />
          <span>Add Friend</span>
        </button>
      );
  }
};

export default FriendButton;