from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import sqlite3
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'task-tracker-2024'
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Database setup
def get_db():
    conn = sqlite3.connect('task_tracker.db', check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    db = get_db()
    cursor = db.cursor()
    
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
            priority TEXT NOT NULL DEFAULT 'Medium',
            status TEXT NOT NULL DEFAULT 'Pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            user_id INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Create default user (admin@test.com)
    cursor.execute('SELECT COUNT(*) FROM users WHERE email = ?', ('admin@test.com',))
    if cursor.fetchone()[0] == 0:
        cursor.execute('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', 
                   ('Admin', 'admin@test.com', generate_password_hash('admin123')))
        print("✅ Created default admin user: admin@test.com / admin123")
    
    db.commit()

init_db()

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute('SELECT 1')
        cursor.fetchone()
        return jsonify({
            'status': 'OK',
            'database': 'connected',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'status': 'ERROR',
            'database': 'disconnected',
            'error': str(e)
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
        
        db = get_db()
        cursor = db.cursor()
        cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()
        
        if user and check_password_hash(user['password_hash'], password):
            return jsonify({
                'status': 'success',
                'user': {
                    'id': user['id'],
                    'name': user['name'],
                    'email': user['email']
                },
                'token': f"token-{user['id']}-{int(datetime.now().timestamp())}"
            })
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
            
    except Exception as e:
        print(f"❌ Login error: {e}")
        return jsonify({'error': f'Login failed: {str(e)}'}), 500

# Tasks
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        today = datetime.now().strftime('%Y-%m-%d')
        
        db = get_db()
        cursor = db.cursor()
        cursor.execute('SELECT * FROM tasks WHERE user_id = ? AND DATE(created_at) = ? ORDER BY created_at DESC', 
                   (user_id, today))
        tasks = cursor.fetchall()
        
        return jsonify({
            'status': 'success',
            'tasks': [dict(task) for task in tasks],
            'total': len(tasks)
        })
        
    except Exception as e:
        print(f"❌ Get tasks error: {e}")
        return jsonify({'error': f'Failed to get tasks: {str(e)}'}), 500

@app.route('/api/tasks', methods=['POST'])
def create_task():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        title = data.get('title')
        priority = data.get('priority', 'Medium')
        user_id = data.get('user_id')
        
        if not title or not user_id:
            return jsonify({'error': 'Title and user_id are required'}), 400
        
        # Validate priority
        valid_priorities = ['Low', 'Medium', 'High']
        if priority not in valid_priorities:
            priority = 'Medium'
        
        db = get_db()
        cursor = db.cursor()
        cursor.execute('INSERT INTO tasks (title, priority, status, user_id) VALUES (?, ?, ?, ?)', 
                   (title, priority, 'Pending', user_id))
        db.commit()
        
        # Get the created task
        cursor.execute('SELECT * FROM tasks WHERE id = last_insert_rowid()')
        created_task = cursor.fetchone()
        
        print(f"✅ Created task: {title} for user {user_id}")
        
        return jsonify({
            'status': 'success',
            'message': 'Task created successfully',
            'task': dict(created_task)
        }), 201
        
    except Exception as e:
        print(f"❌ Create task error: {e}")
        return jsonify({'error': f'Failed to create task: {str(e)}'}), 500

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        status = data.get('status')
        if not status:
            return jsonify({'error': 'Status is required'}), 400
        
        # Validate status
        valid_statuses = ['Pending', 'In Progress', 'Completed']
        if status not in valid_statuses:
            return jsonify({'error': 'Invalid status'}), 400
        
        db = get_db()
        cursor = db.cursor()
        
        # Check if task exists
        cursor.execute('SELECT * FROM tasks WHERE id = ?', (task_id,))
        task = cursor.fetchone()
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        
        # Update task
        cursor.execute('UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
                   (status, task_id))
        db.commit()
        
        # Get updated task
        cursor.execute('SELECT * FROM tasks WHERE id = ?', (task_id,))
        updated_task = cursor.fetchone()
        
        print(f"✅ Updated task {task_id} to {status}")
        
        return jsonify({
            'status': 'success',
            'message': 'Task updated successfully',
            'task': dict(updated_task)
        })
        
    except Exception as e:
        print(f"❌ Update task error: {e}")
        return jsonify({'error': f'Failed to update task: {str(e)}'}), 500

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    try:
        db = get_db()
        cursor = db.cursor()
        
        # Check if task exists
        cursor.execute('SELECT * FROM tasks WHERE id = ?', (task_id,))
        task = cursor.fetchone()
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        
        # Delete task
        cursor.execute('DELETE FROM tasks WHERE id = ?', (task_id,))
        db.commit()
        
        print(f"✅ Deleted task {task_id}")
        
        return jsonify({
            'status': 'success',
            'message': 'Task deleted successfully'
        })
        
    except Exception as e:
        print(f"❌ Delete task error: {e}")
        return jsonify({'error': f'Failed to delete task: {str(e)}'}), 500

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        db = get_db()
        cursor = db.cursor()
        
        # Today's stats
        today = datetime.now().strftime('%Y-%m-%d')
        cursor.execute('SELECT status, COUNT(*) FROM tasks WHERE user_id = ? AND DATE(created_at) = ? GROUP BY status', 
                   (user_id, today))
        today_stats = dict(cursor.fetchall())
        
        # Week stats
        week_ago = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
        cursor.execute('SELECT DATE(created_at), COUNT(*) FROM tasks WHERE user_id = ? AND created_at >= ? GROUP BY DATE(created_at)', 
                   (user_id, week_ago))
        week_stats = dict(cursor.fetchall())
        
        return jsonify({
            'status': 'success',
            'today': today_stats,
            'week': week_stats
        })
        
    except Exception as e:
        print(f"❌ Analytics error: {e}")
        return jsonify({'error': f'Failed to get analytics: {str(e)}'}), 500

@app.route('/api/tasks/history', methods=['GET'])
def get_task_history():
    try:
        user_id = request.args.get('user_id')
        date_filter = request.args.get('date')
        
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        db = get_db()
        cursor = db.cursor()
        
        if date_filter:
            # Get tasks for specific date
            cursor.execute('SELECT * FROM tasks WHERE user_id = ? AND DATE(created_at) = ? ORDER BY created_at DESC', 
                       (user_id, date_filter))
        else:
            # Get all tasks for user
            cursor.execute('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC', 
                       (user_id))
        
        tasks = cursor.fetchall()
        
        return jsonify({
            'status': 'success',
            'tasks': [dict(task) for task in tasks],
            'total': len(tasks)
        })
        
    except Exception as e:
        print(f"❌ History error: {e}")
        return jsonify({'error': f'Failed to get task history: {str(e)}'}), 500

if __name__ == '__main__':
    print("🚀 Starting Task Activity Tracker Backend")
    print("📋 Database: SQLite (task_tracker.db)")
    print("🔐 Default user: admin@test.com / admin123")
    print("🎯 All endpoints ready for testing")
    print("=" * 50)
    
    try:
        app.run(host='0.0.0.0', port=5000, debug=True)
    except Exception as e:
        print(f"❌ Error starting backend: {e}")
