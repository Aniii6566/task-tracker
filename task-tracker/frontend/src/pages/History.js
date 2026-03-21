import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Filter } from 'lucide-react';

const History = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchTasks();
  }, [selectedDate]);

  const fetchTasks = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`http://localhost:5000/api/tasks?user_id=${user.id}`);
      const data = await response.json();
      
      // Filter tasks by selected date
      const filteredTasks = data.filter(task => {
        const taskDate = new Date(task.created_at).toISOString().split('T')[0];
        return taskDate === selectedDate;
      });
      
      setTasks(filteredTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-danger';
      case 'Medium': return 'bg-warning';
      case 'Low': return 'bg-success';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-success';
      case 'In Progress': return 'bg-accent';
      case 'Pending': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'Completed').length;
    const pending = tasks.filter(task => task.status === 'Pending').length;
    const inProgress = tasks.filter(task => task.status === 'In Progress').length;
    
    return { total, completed, pending, inProgress };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Task History</h1>
        <p className="text-text-secondary">View and analyze your task history.</p>
      </div>

      {/* Date Filter */}
      <div className="bg-card border border-gray-700 rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="text-text-secondary" size={20} />
            <label className="text-text-primary font-medium">Date:</label>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 bg-sidebar border border-gray-700 rounded-lg text-text-primary focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium text-text-primary mb-2">Total Tasks</h3>
          <p className="text-2xl font-bold text-accent">{stats.total}</p>
        </div>
        <div className="bg-card border border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium text-text-primary mb-2">Completed</h3>
          <p className="text-2xl font-bold text-success">{stats.completed}</p>
        </div>
        <div className="bg-card border border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium text-text-primary mb-2">In Progress</h3>
          <p className="text-2xl font-bold text-accent">{stats.inProgress}</p>
        </div>
        <div className="bg-card border border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium text-text-primary mb-2">Pending</h3>
          <p className="text-2xl font-bold text-warning">{stats.pending}</p>
        </div>
      </div>

      {/* Tasks List */}
      <div>
        <h2 className="text-xl font-bold text-text-primary mb-4">
          Tasks for {formatDate(selectedDate)}
        </h2>
        
        <div className="bg-card border border-gray-700 rounded-lg overflow-hidden">
          {loading ? (
            <div className="text-center py-8 text-text-secondary">
              Loading tasks...
            </div>
          ) : tasks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-sidebar border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Task
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-sidebar/50 transition-colors">
                      <td className="px-6 py-4 text-text-primary">{task.title}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs text-sidebar rounded ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs text-sidebar rounded ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-text-secondary flex items-center space-x-2">
                        <Clock size={16} />
                        <span>{formatTime(task.created_at)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-text-secondary">
              <div className="mb-4">
                <div className="w-16 h-16 bg-sidebar border border-gray-700 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">📅</span>
                </div>
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-2">No tasks found</h3>
              <p className="text-text-secondary">No tasks found for the selected date.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
