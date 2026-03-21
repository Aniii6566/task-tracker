"""
Production-ready Task Activity Tracker Backend
Uses PostgreSQL and implements proper daily tracking system
"""

import os
import psycopg2
from psycopg2.extras import RealDictCursor
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import random
import hashlib
from functools import wraps
import logging

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://username:password@localhost/tasktracker")

# Motivational quotes
MOTIVATIONAL_QUOTES = [
    "The secret of getting ahead is getting started.",
    "It's hard to beat a person who never gives up.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "Believe you can and you're halfway there.",
    "The only way to do great work is to love what you do.",
    "Don't watch the clock; do what it does. Keep going.",
    "The future depends on what you do today.",
    "Quality is not an act, it is a habit.",
    "Your limitation—it's only your imagination.",
    "Great things never come from comfort zones."
]

def get_db():
    """Get database connection"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        raise

def init_db():
    """Initialize database tables"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Create users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create tasks table with task_date
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS tasks (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                status VARCHAR(50) DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP NULL,
                task_date DATE NOT NULL DEFAULT CURRENT_DATE,
                user_id INTEGER REFERENCES users(id),
                INDEX idx_task_date (task_date),
                INDEX idx_user_date (user_id, task_date)
            )
        ''')
        
        # Create default user if not exists
        cursor.execute('SELECT id FROM users WHERE email = %s', ('admin@test.com',))
        if not cursor.fetchone():
            password_hash = hashlib.sha256('admin123'.encode()).hexdigest()
            cursor.execute('''
                INSERT INTO users (name, email, password_hash) 
                VALUES (%s, %s, %s)
            ''', ('Test User', 'admin@test.com', password_hash))
        
        conn.commit()
        conn.close()
        logger.info("Database initialized successfully")
        
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
        raise

def hash_password(password):
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

# Initialize database on startup
init_db()

# API Routes

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT 1')
        conn.close()
        return jsonify({'status': 'healthy', 'database': 'connected'})
    except Exception as e:
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 500

# Authentication endpoints
@app.route('/api/auth/register', methods=['POST'])
def register():
    """User registration"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        
        if not name or not email or not password:
            return jsonify({'error': 'Name, email, and password are required'}), 400
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Check if user already exists
        cursor.execute('SELECT id FROM users WHERE email = %s', (email,))
        if cursor.fetchone():
            conn.close()
            return jsonify({'error': 'User with this email already exists'}), 400
        
        # Create new user
        password_hash = hash_password(password)
        cursor.execute('''
            INSERT INTO users (name, email, password_hash) 
            VALUES (%s, %s, %s) 
            RETURNING id, name, email, created_at
        ''', (name, email, password_hash))
        
        user = cursor.fetchone()
        conn.commit()
        conn.close()
        
        return jsonify({
            'status': 'success',
            'message': 'Account created successfully',
            'user': {
                'id': user[0],
                'name': user[1],
                'email': user[2],
                'created_at': user[3].isoformat() if user[3] else None
            }
        })
        
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500

@app.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    """Forgot password - Step 1: Verify email"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email')
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Check if user exists
        cursor.execute('SELECT id, name FROM users WHERE email = %s', (email,))
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            return jsonify({'error': 'No account found with this email'}), 404
        
        # For now, just return success (in production, send email)
        return jsonify({
            'status': 'success',
            'message': 'Email verified. You can now reset your password.',
            'user_id': user[0],
            'user_name': user[1]
        })
        
    except Exception as e:
        logger.error(f"Forgot password error: {e}")
        return jsonify({'error': f'Failed to process request: {str(e)}'}), 500

@app.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    """Reset password - Step 2: Update password"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        user_id = data.get('user_id')
        new_password = data.get('new_password')
        
        if not user_id or not new_password:
            return jsonify({'error': 'User ID and new password are required'}), 400
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Check if user exists
        cursor.execute('SELECT id FROM users WHERE id = %s', (user_id,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({'error': 'User not found'}), 404
        
        # Update password
        password_hash = hash_password(new_password)
        cursor.execute('''
            UPDATE users SET password_hash = %s WHERE id = %s
        ''', (password_hash, user_id))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'status': 'success',
            'message': 'Password reset successfully'
        })
        
    except Exception as e:
        logger.error(f"Reset password error: {e}")
        return jsonify({'error': f'Failed to reset password: {str(e)}'}), 500

@app.route('/api/user/update-name', methods=['PUT'])
def update_user_name():
    """Update user name"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        user_id = data.get('user_id')
        new_name = data.get('name')
        
        if not user_id or not new_name:
            return jsonify({'error': 'User ID and name are required'}), 400
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Check if user exists
        cursor.execute('SELECT id FROM users WHERE id = %s', (user_id,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({'error': 'User not found'}), 404
        
        # Update name
        cursor.execute('''
            UPDATE users SET name = %s WHERE id = %s
        ''', (new_name, user_id))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'status': 'success',
            'message': 'Name updated successfully',
            'name': new_name
        })
        
    except Exception as e:
        logger.error(f"Update name error: {e}")
        return jsonify({'error': f'Failed to update name: {str(e)}'}), 500

@app.route('/api/user/update-password', methods=['PUT'])
def update_user_password():
    """Update user password"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        user_id = data.get('user_id')
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        
        if not user_id or not current_password or not new_password:
            return jsonify({'error': 'User ID, current password, and new password are required'}), 400
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Verify current password
        cursor.execute('SELECT password_hash FROM users WHERE id = %s', (user_id,))
        user = cursor.fetchone()
        
        if not user or user[0] != hash_password(current_password):
            conn.close()
            return jsonify({'error': 'Current password is incorrect'}), 400
        
        # Update password
        password_hash = hash_password(new_password)
        cursor.execute('''
            UPDATE users SET password_hash = %s WHERE id = %s
        ''', (password_hash, user_id))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'status': 'success',
            'message': 'Password updated successfully'
        })
        
    except Exception as e:
        logger.error(f"Update password error: {e}")
        return jsonify({'error': f'Failed to update password: {str(e)}'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """User login"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        conn = get_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute('SELECT * FROM users WHERE email = %s', (email,))
        user = cursor.fetchone()
        
        if not user or user['password_hash'] != hash_password(password):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Remove password from response
        user_data = dict(user)
        user_data.pop('password_hash', None)
        
        conn.close()
        
        return jsonify({
            'status': 'success',
            'user': user_data,
            'token': 'simple_token_' + str(user['id'])
        })
        
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({'error': f'Login failed: {str(e)}'}), 500

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """Get today's tasks"""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        today = datetime.now().strftime('%Y-%m-%d')
        
        conn = get_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute('''
            SELECT * FROM tasks 
            WHERE user_id = %s AND task_date = %s 
            ORDER BY created_at DESC
        ''', (user_id, today))
        
        tasks = cursor.fetchall()
        conn.close()
        
        return jsonify({
            'status': 'success',
            'tasks': [dict(task) for task in tasks]
        })
        
    except Exception as e:
        logger.error(f"Get tasks error: {e}")
        return jsonify({'error': f'Failed to get tasks: {str(e)}'}), 500

@app.route('/api/tasks', methods=['POST'])
def create_task():
    """Create a new task"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        title = data.get('title')
        user_id = data.get('user_id')
        
        if not title or not user_id:
            return jsonify({'error': 'title and user_id are required'}), 400
        
        # Auto-assign task_date to today
        task_date = datetime.now().strftime('%Y-%m-%d')
        
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO tasks (title, status, task_date, user_id) 
            VALUES (%s, %s, %s, %s) 
            RETURNING id, title, status, created_at, completed_at, task_date, user_id
        ''', (title, 'Pending', task_date, user_id))
        
        task = cursor.fetchone()
        conn.commit()
        conn.close()
        
        return jsonify({
            'status': 'success',
            'message': 'Task created successfully',
            'task': {
                'id': task[0],
                'title': task[1],
                'status': task[2],
                'created_at': task[3].isoformat() if task[3] else None,
                'completed_at': task[4].isoformat() if task[4] else None,
                'task_date': task[5].isoformat() if task[5] else None,
                'user_id': task[6]
            }
        })
        
    except Exception as e:
        logger.error(f"Create task error: {e}")
        return jsonify({'error': f'Failed to create task: {str(e)}'}), 500

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """Update task status"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        status = data.get('status')
        if not status:
            return jsonify({'error': 'status is required'}), 400
        
        # Validate status
        valid_statuses = ['Pending', 'Completed']
        if status not in valid_statuses:
            return jsonify({'error': 'Invalid status'}), 400
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Check if task exists
        cursor.execute('SELECT id FROM tasks WHERE id = %s', (task_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'Task not found'}), 404
        
        # Update task
        if status == 'Completed':
            cursor.execute('''
                UPDATE tasks 
                SET status = %s, completed_at = CURRENT_TIMESTAMP 
                WHERE id = %s
            ''', (status, task_id))
        else:
            cursor.execute('''
                UPDATE tasks 
                SET status = %s, completed_at = NULL 
                WHERE id = %s
            ''', (status, task_id))
        
        # Get updated task
        cursor.execute('''
            SELECT id, title, status, created_at, completed_at, task_date, user_id 
            FROM tasks WHERE id = %s
        ''', (task_id,))
        
        task = cursor.fetchone()
        conn.commit()
        conn.close()
        
        return jsonify({
            'status': 'success',
            'message': 'Task updated successfully',
            'task': {
                'id': task[0],
                'title': task[1],
                'status': task[2],
                'created_at': task[3].isoformat() if task[3] else None,
                'completed_at': task[4].isoformat() if task[4] else None,
                'task_date': task[5].isoformat() if task[5] else None,
                'user_id': task[6]
            }
        })
        
    except Exception as e:
        logger.error(f"Update task error: {e}")
        return jsonify({'error': f'Failed to update task: {str(e)}'}), 500

@app.route('/api/tasks/<int:task_id>/incomplete', methods=['PUT'])
def mark_task_incomplete(task_id):
    """Mark task as incomplete (Pending)"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Check if task exists
        cursor.execute('SELECT id FROM tasks WHERE id = %s', (task_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'Task not found'}), 404
        
        # Update task to pending
        cursor.execute('''
            UPDATE tasks 
            SET status = 'Pending', completed_at = NULL 
            WHERE id = %s
        ''', (task_id,))
        
        # Get updated task
        cursor.execute('''
            SELECT id, title, status, created_at, completed_at, task_date, user_id 
            FROM tasks WHERE id = %s
        ''', (task_id,))
        
        task = cursor.fetchone()
        conn.commit()
        conn.close()
        
        return jsonify({
            'status': 'success',
            'message': 'Task marked as incomplete',
            'task': {
                'id': task[0],
                'title': task[1],
                'status': task[2],
                'created_at': task[3].isoformat() if task[3] else None,
                'completed_at': task[4].isoformat() if task[4] else None,
                'task_date': task[5].isoformat() if task[5] else None,
                'user_id': task[6]
            }
        })
        
    except Exception as e:
        logger.error(f"Mark task incomplete error: {e}")
        return jsonify({'error': f'Failed to mark task incomplete: {str(e)}'}), 500

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete task"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Check if task exists
        cursor.execute('SELECT id FROM tasks WHERE id = %s', (task_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'Task not found'}), 404
        
        # Delete task
        cursor.execute('DELETE FROM tasks WHERE id = %s', (task_id,))
        conn.commit()
        conn.close()
        
        return jsonify({
            'status': 'success',
            'message': 'Task deleted successfully'
        })
        
    except Exception as e:
        logger.error(f"Delete task error: {e}")
        return jsonify({'error': f'Failed to delete task: {str(e)}'}), 500

@app.route('/api/tasks/completed', methods=['GET'])
def get_completed_tasks():
    """Get today's completed tasks"""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        today = datetime.now().strftime('%Y-%m-%d')
        
        conn = get_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute('''
            SELECT * FROM tasks 
            WHERE user_id = %s AND task_date = %s AND status = 'Completed'
            ORDER BY completed_at DESC
        ''', (user_id, today))
        
        tasks = cursor.fetchall()
        conn.close()
        
        return jsonify({
            'status': 'success',
            'tasks': [dict(task) for task in tasks]
        })
        
    except Exception as e:
        logger.error(f"Get completed tasks error: {e}")
        return jsonify({'error': f'Failed to get completed tasks: {str(e)}'}), 500

@app.route('/api/history', methods=['GET'])
def get_history():
    """Get task history with filtering"""
    try:
        user_id = request.args.get('user_id')
        filter_type = request.args.get('filter', 'daily')
        
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        conn = get_db()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        if filter_type == 'daily':
            # Last 7 days
            start_date = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
            cursor.execute('''
                SELECT * FROM tasks 
                WHERE user_id = %s AND task_date >= %s 
                ORDER BY task_date DESC, created_at DESC
            ''', (user_id, start_date))
            
        elif filter_type == 'weekly':
            # Last 4 weeks
            start_date = (datetime.now() - timedelta(weeks=4)).strftime('%Y-%m-%d')
            cursor.execute('''
                SELECT * FROM tasks 
                WHERE user_id = %s AND task_date >= %s 
                ORDER BY task_date DESC, created_at DESC
            ''', (user_id, start_date))
            
        elif filter_type == 'monthly':
            # Last 6 months
            start_date = (datetime.now() - timedelta(days=180)).strftime('%Y-%m-%d')
            cursor.execute('''
                SELECT * FROM tasks 
                WHERE user_id = %s AND task_date >= %s 
                ORDER BY task_date DESC, created_at DESC
            ''', (user_id, start_date))
        
        tasks = cursor.fetchall()
        conn.close()
        
        return jsonify({
            'status': 'success',
            'tasks': [dict(task) for task in tasks],
            'filter': filter_type
        })
        
    except Exception as e:
        logger.error(f"Get history error: {e}")
        return jsonify({'error': f'Failed to get history: {str(e)}'}), 500

@app.route('/api/analytics/pie-chart', methods=['GET'])
def get_pie_chart_analytics():
    """Get pie chart analytics with daily tracking - FIXED"""
    try:
        user_id = request.args.get('user_id')
        filter_type = request.args.get('filter', 'daily')
        
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        today = datetime.now().strftime('%Y-%m-%d')
        
        conn = get_db()
        cursor = conn.cursor()
        
        if filter_type == 'daily':
            # Today's tasks
            cursor.execute('''
                SELECT status, COUNT(*) FROM tasks 
                WHERE user_id = %s AND task_date = %s
                GROUP BY status
            ''', (user_id, today))
            
        elif filter_type == 'weekly':
            # Last 7 days
            start_date = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
            cursor.execute('''
                SELECT status, COUNT(*) FROM tasks 
                WHERE user_id = %s AND task_date >= %s
                GROUP BY status
            ''', (user_id, start_date))
            
        elif filter_type == 'monthly':
            # Current month
            current_month = datetime.now().strftime('%Y-%m')
            cursor.execute('''
                SELECT status, COUNT(*) FROM tasks 
                WHERE user_id = %s AND DATE_TRUNC('month', task_date) = DATE_TRUNC('month', %s::date)
                GROUP BY status
            ''', (user_id, current_month))
            
        elif filter_type == 'yearly':
            # Current year
            current_year = datetime.now().strftime('%Y')
            cursor.execute('''
                SELECT status, COUNT(*) FROM tasks 
                WHERE user_id = %s AND DATE_TRUNC('year', task_date) = DATE_TRUNC('year', %s::date)
                GROUP BY status
            ''', (user_id, current_year))
        
        status_counts = dict(cursor.fetchall())
        completed = status_counts.get('Completed', 0)
        pending = status_counts.get('Pending', 0)
        
        conn.close()
        
        return jsonify({
            'status': 'success',
            'completed': completed,
            'pending': pending,
            'filter': filter_type
        })
        
    except Exception as e:
        logger.error(f"Pie chart analytics error: {e}")
        return jsonify({'error': f'Failed to get pie chart analytics: {str(e)}'}), 500

@app.route('/api/analytics/daily-data', methods=['GET'])
def get_daily_analytics_data():
    """Get daily analytics data for charts - FIXED"""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Get daily data for the last 30 days
        cursor.execute('''
            SELECT task_date,
                   COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed,
                   COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pending
            FROM tasks 
            WHERE user_id = %s AND task_date >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY task_date
            ORDER BY task_date DESC
        ''', (user_id,))
        
        daily_data = cursor.fetchall()
        conn.close()
        
        # Format data for frontend
        formatted_data = []
        for row in daily_data:
            formatted_data.append({
                'date': row[0].isoformat() if row[0] else None,
                'completed': row[1] or 0,
                'pending': row[2] or 0
            })
        
        return jsonify({
            'status': 'success',
            'daily': formatted_data
        })
        
    except Exception as e:
        logger.error(f"Daily analytics error: {e}")
        return jsonify({'error': f'Failed to get daily analytics: {str(e)}'}), 500

@app.route('/api/dashboard/metrics', methods=['GET'])
def get_dashboard_metrics():
    """Get dashboard metrics for today"""
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        today = datetime.now().strftime('%Y-%m-%d')
        
        conn = get_db()
        cursor = conn.cursor()
        
        # Get today's task counts
        cursor.execute('''
            SELECT status, COUNT(*) FROM tasks 
            WHERE user_id = %s AND task_date = %s 
            GROUP BY status
        ''', (user_id, today))
        
        status_counts = dict(cursor.fetchall())
        total_tasks = status_counts.get('Pending', 0) + status_counts.get('Completed', 0)
        completed_tasks = status_counts.get('Completed', 0)
        pending_tasks = status_counts.get('Pending', 0)
        
        productivity = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        
        conn.close()
        
        return jsonify({
            'status': 'success',
            'metrics': {
                'total_tasks': total_tasks,
                'completed_tasks': completed_tasks,
                'pending_tasks': pending_tasks,
                'productivity': round(productivity, 1)
            }
        })
        
    except Exception as e:
        logger.error(f"Dashboard metrics error: {e}")
        return jsonify({'error': f'Failed to get metrics: {str(e)}'}), 500

@app.route('/api/quote', methods=['GET'])
def get_quote():
    """Get motivational quote"""
    return jsonify({
        'status': 'success',
        'quote': random.choice(MOTIVATIONAL_QUOTES)
    })

if __name__ == '__main__':
    # Production configuration
    port = int(os.getenv('PORT', 5000))
    host = os.getenv('HOST', '0.0.0.0')
    debug = os.getenv('DEBUG', 'False').lower() == 'true'
    
    logger.info(f"Starting Task Activity Tracker on {host}:{port}")
    app.run(host=host, port=port, debug=debug)
