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
import { Users, MessageCircle, Heart, Eye } from 'lucide-react';

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

  // Define fetchAnalytics first (before useEffect)
  const fetchAnalytics = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`http://localhost:5002/api/analytics?range=${timeRange}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [token, timeRange]);

  // Now use fetchAnalytics in useEffect
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
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
        <div className="text-red-600 text-center">
          <p className="text-xl font-bold">Error</p>
          <p>{error}</p>
          <button 
            onClick={() => fetchAnalytics()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-600 text-center">
          <p className="text-xl">No analytics data available</p>
        </div>
      </div>
    );
  }

  const engagementData = {
    labels: stats.dailyEngagement?.map(d => d.date) || [],
    datasets: [
      {
        label: 'Likes',
        data: stats.dailyEngagement?.map(d => d.likes) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
      {
        label: 'Comments',
        data: stats.dailyEngagement?.map(d => d.comments) || [],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
      },
      {
        label: 'Messages',
        data: stats.dailyEngagement?.map(d => d.messages) || [],
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.5)',
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
      },
    ],
  };

  const topPostsData = {
    labels: stats.topPosts?.map(p => p.caption?.substring(0, 20) + '...') || [],
    datasets: [
      {
        label: 'Engagement',
        data: stats.topPosts?.map(p => (p.likes || 0) + (p.comments || 0) * 2) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
    ],
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <select
            value={timeRange}
            onChange={handleTimeRangeChange}
            className="border rounded-lg px-4 py-2 bg-white"
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="year">Last 12 months</option>
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers || 0}</p>
                <p className="text-sm text-green-600">+{stats.userGrowth || 0}%</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Posts</p>
                <p className="text-2xl font-bold">{stats.totalPosts || 0}</p>
                <p className="text-sm text-green-600">+{stats.postGrowth || 0}%</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Eye className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Likes</p>
                <p className="text-2xl font-bold">{stats.totalLikes || 0}</p>
                <p className="text-sm text-green-600">+{stats.likeGrowth || 0}%</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <Heart className="text-red-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Messages</p>
                <p className="text-2xl font-bold">{stats.totalMessages || 0}</p>
                <p className="text-sm text-green-600">+{stats.messageGrowth || 0}%</p>
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
            {stats.dailyEngagement?.length > 0 ? (
              <Line data={engagementData} options={{ responsive: true }} />
            ) : (
              <p className="text-gray-500 text-center py-8">No engagement data available</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Post Type Distribution</h2>
            {stats.postTypes?.length > 0 ? (
              <Pie data={postTypeData} options={{ responsive: true }} />
            ) : (
              <p className="text-gray-500 text-center py-8">No post type data available</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4">Top Performing Posts</h2>
            {stats.topPosts?.length > 0 ? (
              <Bar 
                data={topPostsData} 
                options={{ 
                  responsive: true,
                  indexAxis: 'y',
                }} 
              />
            ) : (
              <p className="text-gray-500 text-center py-8">No top posts data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;