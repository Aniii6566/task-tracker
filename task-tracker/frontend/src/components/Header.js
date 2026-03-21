import React from 'react';
import { Search, Bell, User, Calendar } from 'lucide-react';

const Header = ({ user }) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="bg-card border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" size={20} />
            <input
              type="text"
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2 bg-sidebar border border-gray-700 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-text-secondary">
            <Calendar size={20} />
            <span className="text-sm">{currentDate}</span>
          </div>
          
          <button className="relative p-2 text-text-secondary hover:text-text-primary transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <User size={18} className="text-sidebar" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">{user?.name}</p>
              <p className="text-xs text-text-secondary">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
