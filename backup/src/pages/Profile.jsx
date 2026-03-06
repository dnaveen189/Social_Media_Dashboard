import React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

const Profile = () => {
  const { id } = useParams();
  const { user } = useSelector(state => state.auth);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Profile Page</h1>
      <p>User ID: {id}</p>
      <p>Name: {user?.name}</p>
    </div>
  );
};

export default Profile;