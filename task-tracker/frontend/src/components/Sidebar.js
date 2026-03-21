import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  CheckCircle, 
  History, 
  BarChart3, 
  Settings, 
  LogOut 
} from 'lucide-react';

const Sidebar = ({ onLogout }) => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/today-tasks', icon: CheckSquare, label: "Today's Tasks" },
    { path: '/completed-tasks', icon: CheckCircle, label: 'Completed Tasks' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="w-64 bg-sidebar flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-accent">TaskTracker</h1>
        <p className="text-text-secondary text-sm mt-1">Professional Task Management</p>
      </div>
      
      <nav className="flex-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-accent text-sidebar'
                  : 'text-text-secondary hover:bg-card hover:text-text-primary'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={onLogout}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-card hover:text-text-primary transition-all duration-200 w-full"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
