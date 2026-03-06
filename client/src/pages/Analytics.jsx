import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Users, MessageCircle, Heart, Eye, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Analytics = () => {
  const { token } = useSelector(state => state.auth);
  const [stats, setStats] = useState(null);
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    if (!token) {
      setError('No authentication token found');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching analytics with token:', token.substring(0, 20) + '...');
      
      const response = await axios.get(`http://localhost:5002/api/analytics?range=${timeRange}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Analytics response:', response.data);
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      
      if (err.response) {
        // The request was made and the server responded with a status code
        setError(`Server error: ${err.response.status} - ${err.response.data.message || 'Unknown error'}`);
      } else if (err.request) {
        // The request was made but no response was received
        setError('Cannot connect to server. Please check if backend is running.');
      } else {
        // Something happened in setting up the request
        setError(err.message || 'Failed to load analytics data');
      }
      
      // Set mock data for demonstration if in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock data for development');
        setStats(getMockData());
      }
    } finally {
      setLoading(false);
    }
  }, [token, timeRange]);

  // Mock data function for development
  const getMockData = () => ({
    totalUsers: 1250,
    totalPosts: 3420,
    totalLikes: 15678,
    totalMessages: 8923,
    userGrowth: 12,
    postGrowth: 8,
    likeGrowth: 15,
    messageGrowth: 10,
    dailyEngagement: [
      { date: '2024-03-01', posts: 45, likes: 230, comments: 89, messages: 120 },
      { date: '2024-03-02', posts: 52, likes: 278, comments: 95, messages: 145 },
      { date: '2024-03-03', posts: 38, likes: 198, comments: 76, messages: 98 },
      { date: '2024-03-04', posts: 63, likes: 312, comments: 112, messages: 167 },
      { date: '2024-03-05', posts: 41, likes: 245, comments: 83, messages: 134 },
      { date: '2024-03-06', posts: 55, likes: 289, comments: 104, messages: 156 },
      { date: '2024-03-07', posts: 47, likes: 267, comments: 91, messages: 142 }
    ],
    postTypes: [
      { type: 'image', count: 2150 },
      { type: 'video', count: 870 },
      { type: 'text', count: 400 }
    ],
    topPosts: [
      {
        _id: '1',
        caption: 'Amazing sunset view!',
        media: [{ url: 'https://via.placeholder.com/300' }],
        likes: 342,
        comments: 56,
        createdAt: new Date().toISOString(),
        user: { name: 'John Doe', avatar: { url: 'https://via.placeholder.com/50' } }
      },
      {
        _id: '2',
        caption: 'Check out this new feature',
        media: [{ url: 'https://via.placeholder.com/300' }],
        likes: 289,
        comments: 43,
        createdAt: new Date().toISOString(),
        user: { name: 'Jane Smith', avatar: { url: 'https://via.placeholder.com/50' } }
      }
    ]
  });

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };

  const handleRetry = () => {
    fetchAnalytics();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={handleRetry}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw size={20} className="mr-2" />
              Try Again
            </button>
            <p className="text-sm text-gray-500">
              Make sure your backend server is running on port 5002
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">No analytics data available</p>
          <button 
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // Prepare chart data with null checks
  const engagementData = {
    labels: stats.dailyEngagement?.map(d => d.date) || [],
    datasets: [
      {
        label: 'Likes',
        data: stats.dailyEngagement?.map(d => d.likes) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4
      },
      {
        label: 'Comments',
        data: stats.dailyEngagement?.map(d => d.comments) || [],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        tension: 0.4
      },
      {
        label: 'Messages',
        data: stats.dailyEngagement?.map(d => d.messages) || [],
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.5)',
        tension: 0.4
      },
    ],
  };

  const postTypeData = {
    labels: stats.postTypes?.map(p => p.type) || [],
    datasets: [
      {
        data: stats.postTypes?.map(p => p.count) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
        borderWidth: 1
      },
    ],
  };

  const topPostsData = {
    labels: stats.topPosts?.map(p => p.caption?.substring(0, 30) + '...') || [],
    datasets: [
      {
        label: 'Engagement Score',
        data: stats.topPosts?.map(p => (p.likes || 0) + (p.comments || 0) * 2) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 6
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  const barOptions = {
    ...chartOptions,
    indexAxis: 'y',
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={handleTimeRangeChange}
              className="border rounded-lg px-4 py-2 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="year">Last 12 months</option>
            </select>
            <button
              onClick={handleRetry}
              className="p-2 bg-white border rounded-lg hover:bg-gray-50"
              title="Refresh data"
            >
              <RefreshCw size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Users</p>
                <p className="text-3xl font-bold">{stats.totalUsers?.toLocaleString() || 0}</p>
                <p className="text-sm text-green-600 mt-1">+{stats.userGrowth || 0}%</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Posts</p>
                <p className="text-3xl font-bold">{stats.totalPosts?.toLocaleString() || 0}</p>
                <p className="text-sm text-green-600 mt-1">+{stats.postGrowth || 0}%</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Eye className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Likes</p>
                <p className="text-3xl font-bold">{stats.totalLikes?.toLocaleString() || 0}</p>
                <p className="text-sm text-green-600 mt-1">+{stats.likeGrowth || 0}%</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <Heart className="text-red-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Messages</p>
                <p className="text-3xl font-bold">{stats.totalMessages?.toLocaleString() || 0}</p>
                <p className="text-sm text-green-600 mt-1">+{stats.messageGrowth || 0}%</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <MessageCircle className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Daily Engagement</h2>
            <div className="h-80">
              {stats.dailyEngagement?.length > 0 ? (
                <Line data={engagementData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No engagement data available
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Post Type Distribution</h2>
            <div className="h-80">
              {stats.postTypes?.length > 0 ? (
                <Pie data={postTypeData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No post type data available
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Top Performing Posts</h2>
            <div className="h-96">
              {stats.topPosts?.length > 0 ? (
                <Bar 
                  data={topPostsData} 
                  options={barOptions} 
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No top posts data available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;