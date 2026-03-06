import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Home, User, MessageCircle, BarChart3, LogOut, Users, UserPlus } from 'lucide-react';
import { logout } from '../../store/slices/authSlice';
import axios from 'axios';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const { user, token } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const response = await axios.get('http://localhost:5002/api/friend-requests/requests/received', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPendingRequests(response.data.length);
      } catch (error) {
        console.error('Error fetching pending requests:', error);
      }
    };

    if (token) {
      fetchPendingRequests();
    }
  }, [token]);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: User, label: 'Profile', path: `/profile/${user?.id}` },
    { icon: Users, label: 'Friends', path: '/friends' },
    { 
      icon: UserPlus, 
      label: 'Friend Requests', 
      path: '/friend-requests',
      badge: pendingRequests > 0 ? pendingRequests : null
    },
    { icon: MessageCircle, label: 'Messages', path: '/messages' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-screen sticky top-0">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-blue-600">SocialDash</h1>
      </div>

      <div className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <img
            src={user?.avatar?.url || '/default-avatar.png'}
            alt={user?.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold">{user?.name}</p>
            <p className="text-sm text-gray-500">@{user?.email?.split('@')[0]}</p>
          </div>
        </div>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className="flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          ))}
          <li>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;