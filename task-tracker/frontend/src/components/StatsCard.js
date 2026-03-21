import React from 'react';

const StatsCard = ({ title, value, icon, color, trend }) => {
  const getIconColor = () => {
    switch (color) {
      case 'accent': return 'text-accent';
      case 'success': return 'text-success';
      case 'warning': return 'text-warning';
      case 'danger': return 'text-danger';
      default: return 'text-text-secondary';
    }
  };

  const getBgColor = () => {
    switch (color) {
      case 'accent': return 'bg-accent/10';
      case 'success': return 'bg-success/10';
      case 'warning': return 'bg-warning/10';
      case 'danger': return 'bg-danger/10';
      default: return 'bg-gray-500/10';
    }
  };

  return (
    <div className="bg-card border border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${getBgColor()} rounded-lg flex items-center justify-center ${getIconColor()}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-sm font-medium ${
            trend > 0 ? 'text-success' : 'text-danger'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      
      <h3 className="text-2xl font-bold text-text-primary mb-1">{value}</h3>
      <p className="text-text-secondary text-sm">{title}</p>
    </div>
  );
};

export default StatsCard;
