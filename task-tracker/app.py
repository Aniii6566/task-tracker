from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'task-tracker-2024')
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL')

# Handle Render's postgres:// to postgresql:// conversion
if DATABASE_URL and DATABASE_URL.startswith('postgres://'):
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)

def get_db():
    """Get database connection based on environment"""
    if DATABASE_URL:
        # PostgreSQL for production
        import psycopg2
        from psycopg2.extras import RealDictCursor
        try:
            conn = psycopg2.connect(DATABASE_URL)
            return conn
        except Exception as e:
            logger.error(f"PostgreSQL connection error: {e}")
            raise
    else:
        # SQLite for local development
        import sqlite3
        conn = sqlite3.connect('task_tracker.db', check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

def init_db():
    """Initialize database tables"""
    db = get_db()
    cursor = db.cursor()
    
    if DATABASE_URL:
        # PostgreSQL schema
        try:
            # Users table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Tasks table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS tasks (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    priority VARCHAR(50) DEFAULT 'Medium',
                    status VARCHAR(50) DEFAULT 'Pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    user_id INTEGER NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            ''')
            
            # Create indexes for better performance
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at)')
            
            logger.info("PostgreSQL tables initialized successfully")
            
        except Exception as e:
            logger.error(f"PostgreSQL initialization error: {e}")
            raise
    else:
        # SQLite schema
        try:
            # Users table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Tasks table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    priority TEXT DEFAULT 'Medium',
                    status TEXT DEFAULT 'Pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    user_id INTEGER NOT NULL,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            ''')
            
            logger.info("SQLite tables initialized successfully")
            
        except Exception as e:
            logger.error(f"SQLite initialization error: {e}")
            raise
    
    # Create default user (works for both databases)
    try:
        if DATABASE_URL:
            cursor.execute('SELECT COUNT(*) FROM users WHERE email = %s', ('admin@tasktracker.com',))
        else:
            cursor.execute('SELECT COUNT(*) FROM users WHERE email = ?', ('admin@tasktracker.com',))
        
        if cursor.fetchone()[0] == 0:
            if DATABASE_URL:
                cursor.execute('INSERT INTO users (name, email, password_hash) VALUES (%s, %s, %s)', 
                           ('Admin', 'admin@tasktracker.com', generate_password_hash('admin123')))
            else:
                cursor.execute('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', 
                           ('Admin', 'admin@tasktracker.com', generate_password_hash('admin123')))
        
        db.commit()
        logger.info("Default user created/verified")
        
    except Exception as e:
        logger.error(f"Default user creation error: {e}")
        raise
    finally:
        db.close()

def execute_query(query, params=None, fetch_one=False, fetch_all=False, commit=False):
    """Execute database query with proper parameter handling"""
    db = get_db()
    cursor = db.cursor()
    
    try:
        if DATABASE_URL:
            # PostgreSQL uses %s parameter style
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
        else:
            # SQLite uses ? parameter style
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
        
        if commit:
            db.commit()
            return cursor.rowcount if hasattr(cursor, 'rowcount') else None
        elif fetch_one:
            result = cursor.fetchone()
            return dict(result) if result else None
        elif fetch_all:
            results = cursor.fetchall()
            return [dict(row) for row in results] if results else []
        else:
            return None
            
    except Exception as e:
        logger.error(f"Query execution error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

# Initialize database on startup
try:
    init_db()
    logger.info("Database initialized successfully")
except Exception as e:
    logger.error(f"Database initialization failed: {e}")
    # Don't exit, let app start with error handling

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for monitoring"""
    try:
        db = get_db()
        cursor = db.cursor()
        
        if DATABASE_URL:
            cursor.execute('SELECT 1')
        else:
            cursor.execute('SELECT 1')
        
        db.close()
        
        db_type = "PostgreSQL" if DATABASE_URL else "SQLite"
        return jsonify({
            'status': 'healthy',
            'database': db_type,
            'database_url_set': bool(DATABASE_URL)
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'database_url_set': bool(DATABASE_URL)
        }), 500

# Authentication
@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        if DATABASE_URL:
            query = 'SELECT * FROM users WHERE email = %s'
            params = (email,)
        else:
            query = 'SELECT * FROM users WHERE email = ?'
            params = (email,)
        
        user = execute_query(query, params, fetch_one=True)
        
        if user and check_password_hash(user['password_hash'], password):
            return jsonify({
                'user': {
                    'id': user['id'],
                    'name': user['name'],
                    'email': user['email']
                },
                'token': f"token-{user['id']}-{int(datetime.now().timestamp())}"
            })
        
        return jsonify({'error': 'Invalid credentials'}), 401
        
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({'error': 'Login failed'}), 500

# Tasks
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    try:
        user_id = request.args.get('user_id', '1')
        today = datetime.now().strftime('%Y-%m-%d')
        
        if DATABASE_URL:
            query = '''
                SELECT * FROM tasks 
                WHERE user_id = %s AND DATE(created_at) = %s 
                ORDER BY created_at DESC
            '''
            params = (user_id, today)
        else:
            query = '''
                SELECT * FROM tasks 
                WHERE user_id = ? AND DATE(created_at) = ? 
                ORDER BY created_at DESC
            '''
            params = (user_id, today)
        
        tasks = execute_query(query, params, fetch_all=True)
        return jsonify(tasks)
        
    except Exception as e:
        logger.error(f"Get tasks error: {e}")
        return jsonify({'error': 'Failed to get tasks'}), 500

@app.route('/api/tasks', methods=['POST'])
def create_task():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        user_id = data.get('user_id', '1')
        title = data.get('title')
        
        if not title:
            return jsonify({'error': 'Title is required'}), 400
        
        if DATABASE_URL:
            query = '''
                INSERT INTO tasks (title, priority, status, user_id) 
                VALUES (%s, %s, %s, %s)
            '''
            params = (title, data.get('priority', 'Medium'), 'Pending', user_id)
        else:
            query = '''
                INSERT INTO tasks (title, priority, status, user_id) 
                VALUES (?, ?, ?, ?)
            '''
            params = (title, data.get('priority', 'Medium'), 'Pending', user_id)
        
        execute_query(query, params, commit=True)
        return jsonify({'message': 'Task created successfully'})
        
    except Exception as e:
        logger.error(f"Create task error: {e}")
        return jsonify({'error': 'Failed to create task'}), 500

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        status = data.get('status')
        if not status:
            return jsonify({'error': 'Status is required'}), 400
        
        if DATABASE_URL:
            query = 'UPDATE tasks SET status = %s WHERE id = %s'
            params = (status, task_id)
        else:
            query = 'UPDATE tasks SET status = ? WHERE id = ?'
            params = (status, task_id)
        
        rows_affected = execute_query(query, params, commit=True)
        
        if rows_affected and rows_affected > 0:
            return jsonify({'message': 'Task updated successfully'})
        else:
            return jsonify({'error': 'Task not found'}), 404
            
    except Exception as e:
        logger.error(f"Update task error: {e}")
        return jsonify({'error': 'Failed to update task'}), 500

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    try:
        if DATABASE_URL:
            query = 'DELETE FROM tasks WHERE id = %s'
            params = (task_id,)
        else:
            query = 'DELETE FROM tasks WHERE id = ?'
            params = (task_id,)
        
        rows_affected = execute_query(query, params, commit=True)
        
        if rows_affected and rows_affected > 0:
            return jsonify({'message': 'Task deleted successfully'})
        else:
            return jsonify({'error': 'Task not found'}), 404
            
    except Exception as e:
        logger.error(f"Delete task error: {e}")
        return jsonify({'error': 'Failed to delete task'}), 500

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    try:
        user_id = request.args.get('user_id', '1')
        today = datetime.now().strftime('%Y-%m-%d')
        week_ago = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
        
        # Today's stats
        if DATABASE_URL:
            today_query = '''
                SELECT status, COUNT(*) FROM tasks 
                WHERE user_id = %s AND DATE(created_at) = %s 
                GROUP BY status
            '''
            today_params = (user_id, today)
            
            week_query = '''
                SELECT DATE(created_at), COUNT(*) FROM tasks 
                WHERE user_id = %s AND created_at >= %s 
                GROUP BY DATE(created_at)
            '''
            week_params = (user_id, week_ago)
        else:
            today_query = '''
                SELECT status, COUNT(*) FROM tasks 
                WHERE user_id = ? AND DATE(created_at) = ? 
                GROUP BY status
            '''
            today_params = (user_id, today)
            
            week_query = '''
                SELECT DATE(created_at), COUNT(*) FROM tasks 
                WHERE user_id = ? AND created_at >= ? 
                GROUP BY DATE(created_at)
            '''
            week_params = (user_id, week_ago)
        
        today_stats = execute_query(today_query, today_params, fetch_all=True)
        week_stats = execute_query(week_query, week_params, fetch_all=True)
        
        # Convert to dict format
        today_dict = {item['status']: item['count'] for item in today_stats}
        week_dict = {item['date']: item['count'] for item in week_stats}
        
        return jsonify({
            'today': today_dict,
            'week': week_dict
        })
        
    except Exception as e:
        logger.error(f"Analytics error: {e}")
        return jsonify({'error': 'Failed to get analytics'}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# Application runner
if __name__ == '__main__':
    # Local development
    app.run(host='0.0.0.0', port=5000, debug=True)
else:
    # Production (Gunicorn)
    # This will be used when running with Gunicorn
    app = app
