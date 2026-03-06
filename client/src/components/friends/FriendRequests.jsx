import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Check, X, UserPlus, Users } from 'lucide-react';
import { 
  fetchReceivedRequests, 
  acceptFriendRequest, 
  rejectFriendRequest,
  addReceivedRequest
} from '../../store/slices/friendSlice';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const FriendRequests = () => {
  const dispatch = useDispatch();
  const { receivedRequests, loading } = useSelector(state => state.friends);
  const { token } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(fetchReceivedRequests());

    // Socket connection for real-time requests
    const newSocket = io('http://localhost:5002', {
      auth: { token }
    });

    newSocket.on('friend-request-received', (data) => {
      toast.success(`Friend request from ${data.from.name}`);
      dispatch(addReceivedRequest(data.from));
    });

    newSocket.on('friend-request-accepted', (data) => {
      toast.success(`${data.by.name} accepted your friend request!`);
      // Refresh friends list
      dispatch(fetchReceivedRequests());
    });

    return () => {
      newSocket.disconnect();
    };
  }, [dispatch, token]);

  const handleAccept = async (userId) => {
    try {
      await dispatch(acceptFriendRequest(userId)).unwrap();
      toast.success('Friend request accepted');
    } catch (error) {
      toast.error(error.message || 'Failed to accept request');
    }
  };

  const handleReject = async (userId) => {
    try {
      await dispatch(rejectFriendRequest(userId)).unwrap();
      toast.success('Friend request rejected');
    } catch (error) {
      toast.error(error.message || 'Failed to reject request');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (receivedRequests.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Users size={48} className="mx-auto mb-3 text-gray-400" />
        <p>No friend requests</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <UserPlus size={20} className="mr-2 text-blue-600" />
        Friend Requests ({receivedRequests.length})
      </h3>
      <div className="space-y-3">
        {receivedRequests.map((request) => (
          <div key={request._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <img
                src={request.avatar?.url || '/default-avatar.png'}
                alt={request.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold">{request.name}</p>
                <p className="text-sm text-gray-500">@{request.email?.split('@')[0]}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleAccept(request._id)}
                className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                title="Accept"
              >
                <Check size={18} />
              </button>
              <button
                onClick={() => handleReject(request._id)}
                className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                title="Reject"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendRequests;