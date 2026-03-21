import React, { useState } from 'react';
import { User, Bell, Shield, HelpCircle } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    desktop: true
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'help', label: 'Help', icon: HelpCircle }
  ];

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="bg-sidebar rounded-lg p-6">
              <h3 className="text-lg font-medium text-text-primary mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Name</label>
                  <input
                    type="text"
                    defaultValue="Admin User"
                    className="w-full px-4 py-2 bg-card border border-gray-700 rounded-lg text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue="admin@tasktracker.com"
                    className="w-full px-4 py-2 bg-card border border-gray-700 rounded-lg text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Role</label>
                  <input
                    type="text"
                    defaultValue="Administrator"
                    disabled
                    className="w-full px-4 py-2 bg-card border border-gray-700 rounded-lg text-text-secondary"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-sidebar rounded-lg p-6">
              <h3 className="text-lg font-medium text-text-primary mb-4">Preferences</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Language</label>
                  <select className="w-full px-4 py-2 bg-card border border-gray-700 rounded-lg text-text-primary focus:outline-none focus:border-accent">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Timezone</label>
                  <select className="w-full px-4 py-2 bg-card border border-gray-700 rounded-lg text-text-primary focus:outline-none focus:border-accent">
                    <option>UTC-05:00 Eastern Time</option>
                    <option>UTC-06:00 Central Time</option>
                    <option>UTC-07:00 Mountain Time</option>
                    <option>UTC-08:00 Pacific Time</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                Cancel
              </button>
              <button className="px-6 py-2 bg-accent text-sidebar rounded-lg hover:bg-accent/80 transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="bg-sidebar rounded-lg p-6">
              <h3 className="text-lg font-medium text-text-primary mb-4">Notification Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-text-primary font-medium">Email Notifications</h4>
                    <p className="text-text-secondary text-sm">Receive task updates via email</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('email')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notifications.email ? 'bg-accent' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      notifications.email ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-text-primary font-medium">Push Notifications</h4>
                    <p className="text-text-secondary text-sm">Get browser push notifications</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('push')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notifications.push ? 'bg-accent' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      notifications.push ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-text-primary font-medium">Desktop Notifications</h4>
                    <p className="text-text-secondary text-sm">Show desktop alerts</p>
                  </div>
                  <button
                    onClick={() => handleNotificationChange('desktop')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notifications.desktop ? 'bg-accent' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      notifications.desktop ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-sidebar rounded-lg p-6">
              <h3 className="text-lg font-medium text-text-primary mb-4">Notification Types</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-accent bg-card border-gray-600 rounded focus:ring-accent" />
                  <span className="text-text-primary">Task reminders</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-accent bg-card border-gray-600 rounded focus:ring-accent" />
                  <span className="text-text-primary">Task completions</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="w-4 h-4 text-accent bg-card border-gray-600 rounded focus:ring-accent" />
                  <span className="text-text-primary">Daily summaries</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-accent bg-card border-gray-600 rounded focus:ring-accent" />
                  <span className="text-text-primary">Weekly reports</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="bg-sidebar rounded-lg p-6">
              <h3 className="text-lg font-medium text-text-primary mb-4">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Current Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 bg-card border border-gray-700 rounded-lg text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">New Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 bg-card border border-gray-700 rounded-lg text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 bg-card border border-gray-700 rounded-lg text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
              <button className="mt-4 px-6 py-2 bg-accent text-sidebar rounded-lg hover:bg-accent/80 transition-colors">
                Update Password
              </button>
            </div>

            <div className="bg-sidebar rounded-lg p-6">
              <h3 className="text-lg font-medium text-text-primary mb-4">Two-Factor Authentication</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-text-primary font-medium">Enable 2FA</h4>
                    <p className="text-text-secondary text-sm">Add an extra layer of security to your account</p>
                  </div>
                  <button className="px-4 py-2 bg-accent text-sidebar rounded-lg hover:bg-accent/80 transition-colors">
                    Enable
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'help':
        return (
          <div className="space-y-6">
            <div className="bg-sidebar rounded-lg p-6">
              <h3 className="text-lg font-medium text-text-primary mb-4">Frequently Asked Questions</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-text-primary font-medium mb-2">How do I create a new task?</h4>
                  <p className="text-text-secondary">Use the Quick Add Task form at the top of the dashboard or go to the Today's Tasks page.</p>
                </div>
                <div>
                  <h4 className="text-text-primary font-medium mb-2">How do I mark a task as completed?</h4>
                  <p className="text-text-secondary">Click the Complete button on any task card to mark it as completed.</p>
                </div>
                <div>
                  <h4 className="text-text-primary font-medium mb-2">Can I view tasks from previous days?</h4>
                  <p className="text-text-secondary">Yes, go to the History page and select the date you want to view.</p>
                </div>
                <div>
                  <h4 className="text-text-primary font-medium mb-2">How do I change my password?</h4>
                  <p className="text-text-secondary">Go to Settings > Security and use the password change form.</p>
                </div>
              </div>
            </div>

            <div className="bg-sidebar rounded-lg p-6">
              <h3 className="text-lg font-medium text-text-primary mb-4">Support</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-text-primary font-medium mb-2">Email Support</h4>
                  <p className="text-text-secondary">support@tasktracker.com</p>
                </div>
                <div>
                  <h4 className="text-text-primary font-medium mb-2">Documentation</h4>
                  <p className="text-text-secondary">docs.tasktracker.com</p>
                </div>
                <div>
                  <h4 className="text-text-primary font-medium mb-2">Community Forum</h4>
                  <p className="text-text-secondary">community.tasktracker.com</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Settings</h1>
        <p className="text-text-secondary">Manage your account settings and preferences.</p>
      </div>

      <div className="flex space-x-1 bg-sidebar rounded-lg p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-accent text-sidebar'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="fade-in">
        {renderContent()}
      </div>
    </div>
  );
};

export default Settings;
