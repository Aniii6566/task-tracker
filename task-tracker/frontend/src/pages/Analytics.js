import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`http://localhost:5000/api/analytics?user_id=${user.id}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const prepareWeekData = () => {
    if (!analytics?.week) return [];
    
    const weekData = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      weekData.push({
        date: dayName,
        tasks: analytics.week[dateStr] || 0
      });
    }
    
    return weekData;
  };

  const prepareStatusData = () => {
    if (!analytics?.today) return [];
    
    return [
      { name: 'Pending', value: analytics.today['Pending'] || 0, color: '#facc15' },
      { name: 'In Progress', value: analytics.today['In Progress'] || 0, color: '#38bdf8' },
      { name: 'Completed', value: analytics.today['Completed'] || 0, color: '#22c55e' }
    ];
  };

  const getTotalTasks = () => {
    if (!analytics?.today) return 0;
    return Object.values(analytics.today).reduce((sum, count) => sum + count, 0);
  };

  const getCompletionRate = () => {
    if (!analytics?.today) return 0;
    const total = getTotalTasks();
    const completed = analytics.today['Completed'] || 0;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const weekData = prepareWeekData();
  const statusData = prepareStatusData();
  const totalTasks = getTotalTasks();
  const completionRate = getCompletionRate();

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Analytics</h1>
          <p className="text-text-secondary">Loading your task analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Analytics</h1>
        <p className="text-text-secondary">Track your productivity and task completion patterns.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-medium text-text-primary mb-2">Total Tasks Today</h3>
          <p className="text-3xl font-bold text-accent">{totalTasks}</p>
        </div>
        <div className="bg-card border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-medium text-text-primary mb-2">Completion Rate</h3>
          <p className="text-3xl font-bold text-success">{completionRate}%</p>
        </div>
        <div className="bg-card border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-medium text-text-primary mb-2">Completed Today</h3>
          <p className="text-3xl font-bold text-success">{analytics?.today?.['Completed'] || 0}</p>
        </div>
        <div className="bg-card border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-medium text-text-primary mb-2">Pending Tasks</h3>
          <p className="text-3xl font-bold text-warning">{analytics?.today?.['Pending'] || 0}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Task Chart */}
        <div className="bg-card border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-text-primary mb-4">Weekly Task Activity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Bar dataKey="tasks" fill="#38bdf8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-card border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-text-primary mb-4">Task Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#f1f5f9' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-card border border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-text-primary mb-4">Productivity Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-sidebar rounded-lg">
            <h3 className="text-lg font-medium text-text-primary mb-2">Daily Average</h3>
            <p className="text-2xl font-bold text-accent">
              {Math.round(weekData.reduce((sum, day) => sum + day.tasks, 0) / 7)}
            </p>
            <p className="text-text-secondary text-sm">tasks per day</p>
          </div>
          <div className="p-4 bg-sidebar rounded-lg">
            <h3 className="text-lg font-medium text-text-primary mb-2">Most Productive Day</h3>
            <p className="text-2xl font-bold text-accent">
              {weekData.reduce((max, day) => day.tasks > max.tasks ? day : max, weekData[0])?.date || 'N/A'}
            </p>
            <p className="text-text-secondary text-sm">this week</p>
          </div>
          <div className="p-4 bg-sidebar rounded-lg">
            <h3 className="text-lg font-medium text-text-primary mb-2">Current Streak</h3>
            <p className="text-2xl font-bold text-accent">0</p>
            <p className="text-text-secondary text-sm">days</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
