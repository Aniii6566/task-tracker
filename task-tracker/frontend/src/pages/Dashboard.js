import React, { useState, useEffect } from 'react';
import { BarChart3, CheckCircle, Clock, Target } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import QuickAddTask from '../components/QuickAddTask';
import TaskCard from '../components/TaskCard';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    productivity: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
    fetchAnalytics();
  }, []);

  const fetchTasks = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`http://localhost:5000/api/tasks?user_id=${user.id}`);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`http://localhost:5000/api/analytics?user_id=${user.id}`);
      const data = await response.json();
      
      const today = data.today || {};
      const total = Object.values(today).reduce((sum, count) => sum + count, 0);
      const completed = today['Completed'] || 0;
      const pending = today['Pending'] || 0;
      const productivity = total > 0 ? Math.round((completed / total) * 100) : 0;

      setStats({ total, completed, pending, productivity });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleAddTask = async (taskData) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...taskData, user_id: user.id }),
      });

      if (response.ok) {
        fetchTasks();
        fetchAnalytics();
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleUpdateTask = async (taskId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchTasks();
        fetchAnalytics();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchTasks();
        fetchAnalytics();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const recentTasks = tasks.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Dashboard</h1>
        <p className="text-text-secondary">Welcome back! Here's your task overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Tasks"
          value={stats.total}
          icon={<Target size={24} />}
          color="accent"
        />
        <StatsCard
          title="Completed Today"
          value={stats.completed}
          icon={<CheckCircle size={24} />}
          color="success"
        />
        <StatsCard
          title="Pending Tasks"
          value={stats.pending}
          icon={<Clock size={24} />}
          color="warning"
        />
        <StatsCard
          title="Productivity %"
          value={`${stats.productivity}%`}
          icon={<BarChart3 size={24} />}
          color="accent"
        />
      </div>

      {/* Quick Add Task */}
      <QuickAddTask onAdd={handleAddTask} />

      {/* Recent Tasks */}
      <div>
        <h2 className="text-xl font-bold text-text-primary mb-4">Recent Tasks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-8 text-text-secondary">
              Loading tasks...
            </div>
          ) : recentTasks.length > 0 ? (
            recentTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTask}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-text-secondary">
              No tasks yet. Create your first task above!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
