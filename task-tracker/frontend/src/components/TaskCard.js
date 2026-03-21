import React from 'react';
import { Play, Check, X, Trash2, Clock } from 'lucide-react';

const TaskCard = ({ task, onUpdate, onDelete }) => {
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

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getActionButtons = () => {
    if (task.status === 'Pending') {
      return (
        <>
          <button
            onClick={() => onUpdate(task.id, 'In Progress')}
            className="p-2 bg-accent text-sidebar rounded hover:bg-accent/80 transition-colors"
            title="Start Task"
          >
            <Play size={16} />
          </button>
          <button
            onClick={() => onUpdate(task.id, 'Completed')}
            className="p-2 bg-success text-sidebar rounded hover:bg-success/80 transition-colors"
            title="Complete Task"
          >
            <Check size={16} />
          </button>
        </>
      );
    } else if (task.status === 'In Progress') {
      return (
        <>
          <button
            onClick={() => onUpdate(task.id, 'Completed')}
            className="p-2 bg-success text-sidebar rounded hover:bg-success/80 transition-colors"
            title="Complete Task"
          >
            <Check size={16} />
          </button>
          <button
            onClick={() => onUpdate(task.id, 'Pending')}
            className="p-2 bg-warning text-sidebar rounded hover:bg-warning/80 transition-colors"
            title="Cancel Task"
          >
            <X size={16} />
          </button>
        </>
      );
    } else if (task.status === 'Completed') {
      return (
        <button
          onClick={() => onUpdate(task.id, 'Pending')}
          className="p-2 bg-gray-500 text-sidebar rounded hover:bg-gray-500/80 transition-colors"
          title="Reopen Task"
        >
          <Play size={16} />
        </button>
      );
    }
  };

  return (
    <div className="bg-card border border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow fade-in">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-text-primary font-medium flex-1">{task.title}</h3>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs text-sidebar rounded ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          <span className={`px-2 py-1 text-xs text-sidebar rounded ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-text-secondary text-sm">
          <Clock size={16} />
          <span>{formatTime(task.created_at)}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {getActionButtons()}
          <button
            onClick={() => onDelete(task.id)}
            className="p-2 bg-danger text-sidebar rounded hover:bg-danger/80 transition-colors"
            title="Delete Task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
