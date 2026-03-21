# Task Activity Tracker

A professional web-based task management system with modern dark dashboard UI, built with React + Flask.

## 🚀 Features

### Frontend (React)
- **Modern Dark Dashboard UI** - Professional SaaS-style interface
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Real-time Updates** - Instant task management without page refresh
- **Analytics & Charts** - Visual productivity insights with Recharts
- **Authentication System** - Secure login with password hashing
- **Multi-page Navigation** - Sidebar navigation with 6 main sections

### Backend (Flask)
- **RESTful API** - Complete CRUD operations for tasks
- **SQLite Database** - Simple, reliable data storage
- **User Authentication** - Secure login system
- **Analytics Endpoints** - Task statistics and productivity metrics
- **Multi-device Support** - Works across devices on same network

### Key Features
- **Task Management** - Create, update, delete, and complete tasks
- **Priority Levels** - High, Medium, Low priority with color coding
- **Status Tracking** - Pending, In Progress, Completed states
- **Daily Tracking** - Tasks automatically organized by date
- **History System** - View tasks from previous days
- **Productivity Analytics** - Charts and insights
- **Quick Add Task** - Fast task creation from dashboard

## 🎨 UI Design

### Dark Theme Colors
- **Background**: `#0f172a`
- **Sidebar**: `#020617`
- **Cards**: `#1e293b`
- **Accent**: `#38bdf8`
- **Success**: `#22c55e`
- **Warning**: `#facc15`
- **Danger**: `#ef4444`

### Design Elements
- **Glass Morphism Effects** - Modern frosted glass appearance
- **Smooth Animations** - Hover states and transitions
- **Rounded Cards** - Soft shadows and modern styling
- **Professional Typography** - Clean hierarchy and spacing
- **Responsive Grid** - Adaptive layout for all screen sizes

## 📱 Pages & Navigation

### Sidebar Navigation
- **Dashboard** - Overview with statistics and recent tasks
- **Today's Tasks** - Active tasks for current day
- **Completed Tasks** - Finished tasks review
- **History** - Browse tasks by date
- **Analytics** - Charts and productivity insights
- **Settings** - Profile, notifications, security, help

### Top Header
- **Search Bar** - Global task search
- **Notifications** - Alert system with badge
- **User Profile** - Avatar and user information
- **Current Date** - Dynamic date display

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern component-based UI
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Recharts** - Data visualization library
- **Lucide React** - Modern icon library
- **Axios** - HTTP client for API calls

### Backend
- **Flask 2.3.3** - Python web framework
- **Flask-CORS** - Cross-origin resource sharing
- **SQLite** - Lightweight database
- **Werkzeug** - Security and utilities

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Python 3.8+
- npm or pip

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm start
```

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api

### 4. Login Credentials
- **Email**: admin@tasktracker.com
- **Password**: admin123

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'Medium',
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Tasks
- `GET /api/tasks` - Get user's tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task status
- `DELETE /api/tasks/:id` - Delete task

### Analytics
- `GET /api/analytics` - Get productivity analytics

## 📱 Multi-Device Support

The application works across multiple devices:

### Desktop/Laptop
- Full dashboard experience
- Complete feature set
- Keyboard shortcuts support

### Tablet
- Responsive layout adaptation
- Touch-optimized interface
- Simplified navigation

### Mobile
- Mobile-first design
- Swipe gestures support
- Optimized performance

### Network Access
Backend runs with `host="0.0.0.0"` enabling:
- Local development (localhost:5000)
- Same-network access (IP:5000)
- Mobile device testing

## 🚀 Deployment

### Frontend Deployment

#### Netlify
1. Run `npm run build`
2. Upload `build` folder to Netlify
3. Set environment variables

#### Vercel
1. Connect GitHub repository to Vercel
2. Automatic build and deployment
3. Set environment variables

### Backend Deployment

#### Railway
1. Connect GitHub repository to Railway
2. Set environment variables
3. Automatic deployment

#### Render
1. Create Web Service
2. Connect GitHub repository
3. Set build and start commands

#### Heroku
1. Create Heroku app
2. Set environment variables
3. Deploy with git push

## 🎯 Project Structure

```
task-tracker/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── README.md
├── backend/
│   ├── app.py             # Flask application
│   ├── requirements.txt   # Python dependencies
│   └── README.md
└── README.md              # This file
```

## 🔒 Security Features

- **Password Hashing** - Secure password storage
- **CORS Protection** - Cross-origin request handling
- **SQL Injection Prevention** - Parameterized queries
- **Token Authentication** - Simple token-based auth
- **Input Validation** - Form validation and sanitization

## 🎨 UI Components

### Reusable Components
- **Sidebar** - Navigation menu
- **Header** - Top bar with search and user info
- **TaskCard** - Individual task display
- **QuickAddTask** - Fast task creation
- **StatsCard** - Statistics display

### Page Components
- **Dashboard** - Overview with analytics
- **TodayTasks** - Current day tasks
- **CompletedTasks** - Finished tasks
- **History** - Date-based task browsing
- **Analytics** - Charts and insights
- **Settings** - User preferences
- **Login** - Authentication page

## 📈 Analytics Features

### Charts
- **Weekly Activity Bar Chart** - Tasks per day
- **Status Distribution Pie Chart** - Task completion breakdown
- **Productivity Metrics** - Completion rates and averages

### Insights
- **Daily Average** - Tasks per day average
- **Most Productive Day** - Peak performance day
- **Current Streak** - Consistency tracking
- **Completion Rate** - Success percentage

## 🔄 Task Workflow

### Task States
1. **Pending** - New task, not started
2. **In Progress** - Currently working on
3. **Completed** - Finished successfully

### Task Actions
- **Start** - Move from Pending to In Progress
- **Complete** - Move to Completed state
- **Reopen** - Move from Completed back to Pending
- **Delete** - Remove task permanently

## 🎯 Use Cases

### Personal Productivity
- Daily task tracking
- Goal setting and completion
- Productivity analysis
- Habit formation

### Team Collaboration
- Task assignment and tracking
- Progress monitoring
- Performance analytics
- Workflow optimization

### Project Management
- Task breakdown and tracking
- Progress reporting
- Resource allocation
- Timeline management

## 🚀 Future Enhancements

### Planned Features
- **Real-time Collaboration** - Multiple users
- **Advanced Analytics** - More insights
- **Mobile App** - Native mobile application
- **Integration** - Calendar and email integration
- **AI Features** - Smart task suggestions
- **Reports** - Export and reporting features

### Technical Improvements
- **PostgreSQL** - Production database
- **Redis** - Caching layer
- **WebSocket** - Real-time updates
- **Testing** - Comprehensive test suite
- **CI/CD** - Automated deployment

## 📄 License

MIT License - Feel free to use and modify for your projects.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions, issues, or contributions:
- Create an issue on GitHub
- Check the documentation
- Review the FAQ in Settings page

---

**Built with ❤️ using React, Flask, and modern web technologies.**
