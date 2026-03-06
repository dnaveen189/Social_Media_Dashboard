import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Camera, MapPin, Calendar, Users } from 'lucide-react';
import FriendButton from '../components/friends/FriendButton';
import PostCard from '../components/posts/PostCard';
import toast from 'react-hot-toast';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser, token } = useSelector(state => state.auth);
  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'about' or 'friends'

  const isOwnProfile = currentUser?.id === id;

  useEffect(() => {
    fetchUserProfile();
    fetchUserPosts();
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`http://localhost:5002/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileUser(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      // You might need to create this endpoint or filter feed posts
      const response = await axios.get(`http://localhost:5002/api/posts/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserPosts(response.data);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      // If endpoint doesn't exist, just set empty array
      setUserPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">User Not Found</h2>
          <p className="text-gray-600">The user you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Cover Photo - Placeholder */}
      <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg relative"></div>

      {/* Profile Header */}
      <div className="bg-white rounded-b-lg shadow p-6 -mt-12 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between">
          <div className="flex items-end space-x-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white overflow-hidden bg-gray-200">
                <img
                  src={profileUser.avatar?.url || 'https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png'}
                  alt={profileUser.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {isOwnProfile && (
                <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                  <Camera size={16} />
                </button>
              )}
            </div>

            {/* User Info */}
            <div className="mb-2">
              <h1 className="text-2xl font-bold">{profileUser.name}</h1>
              <p className="text-gray-600">@{profileUser.email?.split('@')[0]}</p>
              {profileUser.bio && (
                <p className="mt-2 text-gray-700 max-w-md">{profileUser.bio}</p>
              )}
            </div>
          </div>

          {/* Friend Button or Edit Profile */}
          <div className="mt-4 md:mt-0">
            {isOwnProfile ? (
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                Edit Profile
              </button>
            ) : (
              <FriendButton userId={profileUser._id} />
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex space-x-6 mt-6 pt-4 border-t">
          <div className="text-center">
            <span className="block font-bold text-xl">{profileUser.friends?.length || 0}</span>
            <span className="text-gray-600 text-sm">Friends</span>
          </div>
          <div className="text-center">
            <span className="block font-bold text-xl">{userPosts.length}</span>
            <span className="text-gray-600 text-sm">Posts</span>
          </div>
          <div className="text-center">
            <span className="block font-bold text-xl">
              {profileUser.friendRequests?.received?.length || 0}
            </span>
            <span className="text-gray-600 text-sm">Requests</span>
          </div>
        </div>
      </div>

      {/* Profile Content Tabs */}
      <div className="mt-6">
        <div className="border-b flex space-x-6">
          <button
            onClick={() => setActiveTab('posts')}
            className={`pb-2 px-1 font-medium transition-colors ${
              activeTab === 'posts'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`pb-2 px-1 font-medium transition-colors ${
              activeTab === 'about'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            About
          </button>
          <button
            onClick={() => setActiveTab('friends')}
            className={`pb-2 px-1 font-medium transition-colors ${
              activeTab === 'friends'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Friends
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {postsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : userPosts.length > 0 ? (
                userPosts.map(post => (
                  <PostCard key={post._id} post={post} onUpdate={fetchUserPosts} />
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <p className="text-gray-500">No posts yet</p>
                  {isOwnProfile && (
                    <p className="text-sm text-gray-400 mt-2">Create your first post!</p>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">About {profileUser.name}</h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <Calendar size={18} className="mr-3 text-gray-500" />
                  <span>Joined {formatDate(profileUser.createdAt)}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Users size={18} className="mr-3 text-gray-500" />
                  <span>{profileUser.friends?.length || 0} friends</span>
                </div>
                {profileUser.bio && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{profileUser.bio}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'friends' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Friends ({profileUser.friends?.length || 0})</h3>
              {profileUser.friends && profileUser.friends.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* You'll need to populate friends with user details */}
                  <div className="text-center text-gray-500 col-span-full">
                    Friend list feature coming soon
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No friends yet</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;