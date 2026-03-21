# Task Tracker Backend

A Flask-based REST API for task management with SQLite database.

## Features

- RESTful API endpoints
- User authentication
- Task CRUD operations
- Analytics endpoints
- SQLite database
- Multi-device support

## Tech Stack

- Flask 2.3.3
- Flask-CORS
- Werkzeug
- SQLite

## Getting Started

### Prerequisites

- Python 3.8+
- pip

### Installation

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Start the server:
```bash
python app.py
```

The API will be available at http://localhost:5000

### Environment Variables

Create a `.env` file in the root directory:

```
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-secret-key-here
```

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login

### Tasks

- `GET /api/tasks` - Get all tasks for a user
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update task status
- `DELETE /api/tasks/:id` - Delete a task

### Analytics

- `GET /api/analytics` - Get task analytics

## Database Schema

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

## Default User

The system creates a default user for testing:
- Email: admin@tasktracker.com
- Password: admin123

## Deployment

### Railway

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Railway will automatically deploy

### Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `python app.py`
5. Set environment variables

### Heroku

1. Install Heroku CLI
2. Create Heroku app: `heroku create your-app-name`
3. Set environment variables
4. Deploy: `git push heroku main`

## Multi-Device Support

The backend runs with `host="0.0.0.0"` which allows access from:
- Local machine (localhost:5000)
- Other devices on the same network (IP:5000)
- Mobile devices connected to the same WiFi

## Security Features

- Password hashing with Werkzeug
- CORS enabled for frontend integration
- Simple token-based authentication
- SQL injection prevention with parameterized queries

## Error Handling

All API endpoints return proper HTTP status codes and JSON responses:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
