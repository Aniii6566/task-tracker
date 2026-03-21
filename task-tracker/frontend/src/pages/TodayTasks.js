import React, { useState, useEffect } from 'react';
import TaskCard from '../components/TaskCard';
import QuickAddTask from '../components/QuickAddTask';

const TodayTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
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
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const activeTasks = tasks.filter(task => task.status !== 'Completed');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Today's Tasks</h1>
        <p className="text-text-secondary">Manage and track your daily tasks.</p>
      </div>

      {/* Quick Add Task */}
      <QuickAddTask onAdd={handleAddTask} />

      {/* Tasks Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-primary">
            Active Tasks ({activeTasks.length})
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full text-center py-8 text-text-secondary">
              Loading tasks...
            </div>
          ) : activeTasks.length > 0 ? (
            activeTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTask}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-text-secondary">
              <div className="mb-4">
                <div className="w-16 h-16 bg-card border border-gray-700 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">📝</span>
                </div>
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-2">No active tasks</h3>
              <p className="text-text-secondary">Create your first task to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodayTasks;
