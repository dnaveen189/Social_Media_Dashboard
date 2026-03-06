import React from 'react';
import FriendRequests from '../components/friends/FriendRequests';

const FriendRequestsPage = () => {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Friend Requests</h1>
      <FriendRequests />
    </div>
  );
};

export default FriendRequestsPage;