import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Users, UserPlus, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const RightSidebar = () => {
  const { token } = useSelector(state => state.auth); // Removed unused 'user'
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState({});

  // Define fetchSuggestions with useCallback
  const fetchSuggestions = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await axios.get('http://localhost:5002/api/users/suggestions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      toast.error('Failed to load suggestions');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const handleFollow = async (userId) => {
    try {
      await axios.post(`http://localhost:5002/api/users/follow/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFollowing(prev => ({ ...prev, [userId]: true }));
      toast.success('Followed successfully');
      
      // Refresh suggestions
      fetchSuggestions();
    } catch (error) {
      console.error('Follow error:', error);
      toast.error('Failed to follow user');
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      await axios.post(`http://localhost:5002/api/users/unfollow/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFollowing(prev => ({ ...prev, [userId]: false }));
      toast.success('Unfollowed successfully');
      
      // Refresh suggestions
      fetchSuggestions();
    } catch (error) {
      console.error('Unfollow error:', error);
      toast.error('Failed to unfollow user');
    }
  };

  return (
    <div className="w-80 bg-white shadow-lg h-screen sticky top-0 p-4 overflow-y-auto">
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="text-blue-600" size={20} />
          <h2 className="text-lg font-semibold">Suggestions</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : suggestions.length > 0 ? (
          <div className="space-y-3">
            {suggestions.map(suggestion => (
              <div key={suggestion._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <img
                    src={suggestion.avatar?.url || '/default-avatar.png'}
                    alt={suggestion.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold">{suggestion.name}</p>
                    <p className="text-xs text-gray-500">@{suggestion.email?.split('@')[0]}</p>
                  </div>
                </div>
                <button
                  onClick={() => following[suggestion._id] ? 
                    handleUnfollow(suggestion._id) : 
                    handleFollow(suggestion._id)
                  }
                  className={`text-xs px-3 py-1 rounded-full flex items-center space-x-1 transition-colors ${
                    following[suggestion._id]
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {following[suggestion._id] ? (
                    <>
                      <UserCheck size={12} />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={12} />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm text-center py-4">No suggestions available</p>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;