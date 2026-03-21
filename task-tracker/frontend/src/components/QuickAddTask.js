import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const QuickAddTask = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('Medium');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd({ title, priority });
      setTitle('');
      setPriority('Medium');
    }
  };

  return (
    <div className="bg-card border border-gray-700 rounded-lg p-4 mb-6">
      <form onSubmit={handleSubmit} className="flex items-center space-x-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task Title"
          className="flex-1 px-4 py-2 bg-sidebar border border-gray-700 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
        />
        
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="px-4 py-2 bg-sidebar border border-gray-700 rounded-lg text-text-primary focus:outline-none focus:border-accent"
        >
          <option value="Low">Low Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="High">High Priority</option>
        </select>
        
        <button
          type="submit"
          className="px-4 py-2 bg-accent text-sidebar rounded-lg hover:bg-accent/80 transition-colors flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Task</span>
        </button>
      </form>
    </div>
  );
};

export default QuickAddTask;
