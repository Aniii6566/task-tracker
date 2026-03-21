from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import sqlite3
import random

app = Flask(__name__)
app.config['SECRET_KEY'] = 'task-tracker-2024'
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Motivational quotes
MOTIVATIONAL_QUOTES = [
    "Small progress is still progress.",
    "Focus on being productive, not busy.",
    "Success comes from consistency.",
    "Do something today that your future self will thank you for.",
    "Every accomplishment starts with the decision to try.",
    "Progress, not perfection.",
    "Your only limit is you.",
    "Make it happen.",
    "Dream it. Believe it. Build it.",
    "Stay focused, stay determined."
]

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
    
    # Simplified tasks table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            user_id INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Create default user
    cursor.execute('SELECT COUNT(*) FROM users WHERE email = ?', ('admin@test.com',))
    if cursor.fetchone()[0] == 0:
        cursor.execute('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', 
                   ('Aniket', 'admin@test.com', generate_password_hash('admin123')))
        print("✅ Created default user: Aniket")
    
    db.commit()

init_db()

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

# Get today's tasks
@app.route('/api/tasks/today', methods=['GET'])
def get_today_tasks():
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
            'tasks': [dict(task) for task in tasks]
        })
        
    except Exception as e:
        print(f"❌ Get today's tasks error: {e}")
        return jsonify({'error': f'Failed to get tasks: {str(e)}'}), 500

# Get completed tasks
@app.route('/api/tasks/completed', methods=['GET'])
def get_completed_tasks():
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        today = datetime.now().strftime('%Y-%m-%d')
        
        db = get_db()
        cursor = db.cursor()
        cursor.execute('SELECT * FROM tasks WHERE user_id = ? AND DATE(created_at) = ? AND status = ? ORDER BY created_at DESC', 
                   (user_id, today, 'Completed'))
        tasks = cursor.fetchall()
        
        return jsonify({
            'status': 'success',
            'tasks': [dict(task) for task in tasks]
        })
        
    except Exception as e:
        print(f"❌ Get completed tasks error: {e}")
        return jsonify({'error': f'Failed to get completed tasks: {str(e)}'}), 500

# Get history tasks
@app.route('/api/tasks/history', methods=['GET'])
def get_history_tasks():
    try:
        user_id = request.args.get('user_id')
        filter_type = request.args.get('filter', 'daily')  # daily, weekly, monthly
        
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        db = get_db()
        cursor = db.cursor()
        
        if filter_type == 'daily':
            date_filter = request.args.get('date')
            if date_filter:
                cursor.execute('SELECT * FROM tasks WHERE user_id = ? AND DATE(created_at) = ? ORDER BY created_at DESC', 
                           (user_id, date_filter))
            else:
                today = datetime.now().strftime('%Y-%m-%d')
                cursor.execute('SELECT * FROM tasks WHERE user_id = ? AND DATE(created_at) = ? ORDER BY created_at DESC', 
                           (user_id, today))
        
        elif filter_type == 'weekly':
            week_ago = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
            cursor.execute('SELECT * FROM tasks WHERE user_id = ? AND created_at >= ? ORDER BY created_at DESC', 
                       (user_id, week_ago))
        
        elif filter_type == 'monthly':
            current_month = datetime.now().strftime('%Y-%m')
            cursor.execute('SELECT * FROM tasks WHERE user_id = ? AND strftime("%Y-%m", created_at) = ? ORDER BY created_at DESC', 
                       (user_id, current_month))
        
        else:
            return jsonify({'error': 'Invalid filter type'}), 400
        
        tasks = cursor.fetchall()
        
        return jsonify({
            'status': 'success',
            'tasks': [dict(task) for task in tasks]
        })
        
    except Exception as e:
        print(f"❌ Get history tasks error: {e}")
        return jsonify({'error': f'Failed to get history: {str(e)}'}), 500

# Create task
@app.route('/api/tasks', methods=['POST'])
def create_task():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        title = data.get('title')
        user_id = data.get('user_id')
        
        if not title or not user_id:
            return jsonify({'error': 'Title and user_id are required'}), 400
        
        db = get_db()
        cursor = db.cursor()
        cursor.execute('INSERT INTO tasks (title, status, user_id) VALUES (?, ?, ?)', 
                   (title, 'Pending', user_id))
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

# Update task status
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
        valid_statuses = ['Pending', 'Completed']
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
        cursor.execute('UPDATE tasks SET status = ? WHERE id = ?', (status, task_id))
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

# Mark task as incomplete
@app.route('/api/tasks/<int:task_id>/incomplete', methods=['PUT'])
def mark_task_incomplete(task_id):
    try:
        db = get_db()
        cursor = db.cursor()
        
        # Check if task exists
        cursor.execute('SELECT * FROM tasks WHERE id = ?', (task_id,))
        task = cursor.fetchone()
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        
        # Update task to pending
        cursor.execute('UPDATE tasks SET status = ? WHERE id = ?', ('Pending', task_id))
        db.commit()
        
        # Get updated task
        cursor.execute('SELECT * FROM tasks WHERE id = ?', (task_id,))
        updated_task = cursor.fetchone()
        
        print(f"✅ Marked task {task_id} as incomplete")
        
        return jsonify({
            'status': 'success',
            'message': 'Task marked as incomplete',
            'task': dict(updated_task)
        })
        
    except Exception as e:
        print(f"❌ Mark task incomplete error: {e}")
        return jsonify({'error': f'Failed to mark task incomplete: {str(e)}'}), 500

# Delete task
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

# Get dashboard metrics
@app.route('/api/dashboard/metrics', methods=['GET'])
def get_dashboard_metrics():
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        today = datetime.now().strftime('%Y-%m-%d')
        
        db = get_db()
        cursor = db.cursor()
        
        # Get today's tasks
        cursor.execute('SELECT * FROM tasks WHERE user_id = ? AND DATE(created_at) = ?', (user_id, today))
        today_tasks = cursor.fetchall()
        
        total_tasks = len(today_tasks)
        completed_tasks = len([t for t in today_tasks if t['status'] == 'Completed'])
        pending_tasks = len([t for t in today_tasks if t['status'] == 'Pending'])
        
        productivity = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        
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
        print(f"❌ Dashboard metrics error: {e}")
        return jsonify({'error': f'Failed to get metrics: {str(e)}'}), 500

# Get tasks over time analytics
@app.route('/api/analytics/tasks-over-time', methods=['GET'])
def get_tasks_over_time():
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        db = get_db()
        cursor = db.cursor()
        
        # Daily analytics - Last 7 days
        cursor.execute('''
            SELECT DATE(created_at) as date, COUNT(*) as completed
            FROM tasks 
            WHERE user_id = ? AND status = 'Completed' 
            AND DATE(created_at) >= DATE('now', '-7 days')
            GROUP BY DATE(created_at)
            ORDER BY date DESC
        ''', (user_id,))
        daily_data = cursor.fetchall()
        
        # Weekly analytics - Last 8 weeks
        cursor.execute('''
            SELECT strftime('%Y-W%W', created_at) as week, COUNT(*) as completed
            FROM tasks 
            WHERE user_id = ? AND status = 'Completed' 
            AND created_at >= DATE('now', '-56 days')
            GROUP BY strftime('%Y-W%W', created_at)
            ORDER BY week DESC
        ''', (user_id,))
        weekly_data = cursor.fetchall()
        
        # Monthly analytics - Last 12 months
        cursor.execute('''
            SELECT strftime('%Y-%m', created_at) as month, 
                   CASE strftime('%m', created_at)
                       WHEN '01' THEN 'Jan'
                       WHEN '02' THEN 'Feb'
                       WHEN '03' THEN 'Mar'
                       WHEN '04' THEN 'Apr'
                       WHEN '05' THEN 'May'
                       WHEN '06' THEN 'Jun'
                       WHEN '07' THEN 'Jul'
                       WHEN '08' THEN 'Aug'
                       WHEN '09' THEN 'Sep'
                       WHEN '10' THEN 'Oct'
                       WHEN '11' THEN 'Nov'
                       WHEN '12' THEN 'Dec'
                   END as month_name,
                   COUNT(*) as completed
            FROM tasks 
            WHERE user_id = ? AND status = 'Completed' 
            AND created_at >= DATE('now', '-365 days')
            GROUP BY strftime('%Y-%m', created_at)
            ORDER BY month DESC
        ''', (user_id,))
        monthly_data = cursor.fetchall()
        
        # Format data for frontend
        daily_formatted = [
            {"date": row['date'], "completed": row['completed']} 
            for row in daily_data
        ]
        
        weekly_formatted = [
            {"week": f"Week {row['week'].split('-W')[1]}", "completed": row['completed']} 
            for row in weekly_data
        ]
        
        monthly_formatted = [
            {"month": row['month_name'], "completed": row['completed']} 
            for row in monthly_data
        ]
        
        return jsonify({
            'status': 'success',
            'daily': daily_formatted,
            'weekly': weekly_formatted,
            'monthly': monthly_formatted
        })
        
    except Exception as e:
        print(f"❌ Tasks over time error: {e}")
        return jsonify({'error': f'Failed to get tasks over time: {str(e)}'}), 500

# Get pie chart analytics
@app.route('/api/analytics/pie-chart', methods=['GET'])
def get_pie_chart_analytics():
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        filter_type = request.args.get('filter', 'daily')
        today = datetime.now().strftime('%Y-%m-%d')
        
        db = get_db()
        cursor = db.cursor()
        
        if filter_type == 'daily':
            # Daily: Today's tasks
            cursor.execute('''
                SELECT status, COUNT(*) FROM tasks 
                WHERE user_id = ? AND DATE(created_at) = ?
                GROUP BY status
            ''', (user_id, today))
            
        elif filter_type == 'weekly':
            # Weekly: Last 7 days
            week_ago = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
            cursor.execute('''
                SELECT status, COUNT(*) FROM tasks 
                WHERE user_id = ? AND created_at >= ?
                GROUP BY status
            ''', (user_id, week_ago))
            
        elif filter_type == 'monthly':
            # Monthly: Current month
            current_month = datetime.now().strftime('%Y-%m')
            cursor.execute('''
                SELECT status, COUNT(*) FROM tasks 
                WHERE user_id = ? AND strftime('%Y-%m', created_at) = ?
                GROUP BY status
            ''', (user_id, current_month))
            
        elif filter_type == 'yearly':
            # Yearly: Current year
            current_year = datetime.now().strftime('%Y')
            cursor.execute('''
                SELECT status, COUNT(*) FROM tasks 
                WHERE user_id = ? AND strftime('%Y', created_at) = ?
                GROUP BY status
            ''', (user_id, current_year))
        
        status_counts = dict(cursor.fetchall())
        completed = status_counts.get('Completed', 0)
        pending = status_counts.get('Pending', 0)
        
        return jsonify({
            'status': 'success',
            'completed': completed,
            'pending': pending,
            'filter': filter_type
        })
        
    except Exception as e:
        print(f"❌ Pie chart analytics error: {e}")
        return jsonify({'error': f'Failed to get pie chart analytics: {str(e)}'}), 500

# Get analytics
@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        filter_type = request.args.get('filter', 'daily')
        today = datetime.now().strftime('%Y-%m-%d')
        
        db = get_db()
        cursor = db.cursor()
        
        # Get completed and incomplete counts
        cursor.execute('SELECT status, COUNT(*) FROM tasks WHERE user_id = ? GROUP BY status', (user_id,))
        status_counts = dict(cursor.fetchall())
        completed = status_counts.get('Completed', 0)
        pending = status_counts.get('Pending', 0)
        
        # Filter-based data
        analytics_data = {}
        
        if filter_type == 'daily':
            # Daily: Today's tasks by hour
            cursor.execute('''
                SELECT strftime('%H', created_at) as hour, 
                       SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
                       SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as incomplete
                FROM tasks 
                WHERE user_id = ? AND DATE(created_at) = ?
                GROUP BY strftime('%H', created_at)
                ORDER BY hour
            ''', (user_id, today))
            daily_data = cursor.fetchall()
            
            for hour, completed_count, incomplete_count in daily_data:
                analytics_data[f"{hour}:00"] = {
                    'completed': completed_count,
                    'incomplete': incomplete_count
                }
                
        elif filter_type == 'weekly':
            # Weekly: Last 7 days
            week_ago = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
            cursor.execute('''
                SELECT DATE(created_at) as date,
                       SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
                       SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as incomplete
                FROM tasks 
                WHERE user_id = ? AND created_at >= ?
                GROUP BY DATE(created_at)
                ORDER BY date
            ''', (user_id, week_ago))
            weekly_data = cursor.fetchall()
            
            for date, completed_count, incomplete_count in weekly_data:
                analytics_data[date] = {
                    'completed': completed_count,
                    'incomplete': incomplete_count
                }
                
        elif filter_type == 'monthly':
            # Monthly: Current month
            current_month = datetime.now().strftime('%Y-%m')
            cursor.execute('''
                SELECT DATE(created_at) as date,
                       SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
                       SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as incomplete
                FROM tasks 
                WHERE user_id = ? AND strftime('%Y-%m', created_at) = ?
                GROUP BY DATE(created_at)
                ORDER BY date
            ''', (user_id, current_month))
            monthly_data = cursor.fetchall()
            
            for date, completed_count, incomplete_count in monthly_data:
                analytics_data[date] = {
                    'completed': completed_count,
                    'incomplete': incomplete_count
                }
        
        # Get today's stats for dashboard
        cursor.execute('SELECT status, COUNT(*) FROM tasks WHERE user_id = ? AND DATE(created_at) = ? GROUP BY status', 
                   (user_id, today))
        today_stats = dict(cursor.fetchall())
        
        # Get week stats for dashboard
        week_ago = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
        cursor.execute('SELECT DATE(created_at), COUNT(*) FROM tasks WHERE user_id = ? AND created_at >= ? GROUP BY DATE(created_at)', 
                   (user_id, week_ago))
        week_stats = dict(cursor.fetchall())
        
        return jsonify({
            'status': 'success',
            'completed': completed,
            'pending': pending,
            'analytics': analytics_data,
            'today_stats': today_stats,
            'week_stats': week_stats
        })
        
    except Exception as e:
        print(f"❌ Analytics error: {e}")
        return jsonify({'error': f'Failed to get analytics: {str(e)}'}), 500

# Get motivational quote
@app.route('/api/quote', methods=['GET'])
def get_quote():
    return jsonify({
        'status': 'success',
        'quote': random.choice(MOTIVATIONAL_QUOTES)
    })

# Update user name
@app.route('/api/user/update-name', methods=['PUT'])
def update_user_name():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        user_id = data.get('user_id')
        new_name = data.get('name')
        
        if not user_id or not new_name:
            return jsonify({'error': 'user_id and name are required'}), 400
        
        db = get_db()
        cursor = db.cursor()
        
        # Update user name
        cursor.execute('UPDATE users SET name = ? WHERE id = ?', (new_name, user_id))
        db.commit()
        
        # Get updated user
        cursor.execute('SELECT id, name, email FROM users WHERE id = ?', (user_id,))
        updated_user = cursor.fetchone()
        
        return jsonify({
            'status': 'success',
            'message': 'Name updated successfully',
            'user': dict(updated_user)
        })
        
    except Exception as e:
        print(f"❌ Update name error: {e}")
        return jsonify({'error': f'Failed to update name: {str(e)}'}), 500

# Update user password
@app.route('/api/user/update-password', methods=['PUT'])
def update_user_password():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        user_id = data.get('user_id')
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        
        if not user_id or not current_password or not new_password:
            return jsonify({'error': 'user_id, current_password, and new_password are required'}), 400
        
        db = get_db()
        cursor = db.cursor()
        
        # Get current user
        cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Verify current password
        if not check_password_hash(user['password_hash'], current_password):
            return jsonify({'error': 'Current password is incorrect'}), 400
        
        # Update password
        new_password_hash = generate_password_hash(new_password)
        cursor.execute('UPDATE users SET password_hash = ? WHERE id = ?', (new_password_hash, user_id))
        db.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Password updated successfully'
        })
        
    except Exception as e:
        print(f"❌ Update password error: {e}")
        return jsonify({'error': f'Failed to update password: {str(e)}'}), 500

if __name__ == '__main__':
    print("🚀 Starting Simplified Task Activity Tracker")
    print("📋 Database: SQLite (task_tracker.db)")
    print("🔐 Default user: admin@test.com / admin123")
    print("🎯 Simplified task structure: title, status only")
    print("=" * 50)
    
    try:
        app.run(host='0.0.0.0', port=5000, debug=True)
    except Exception as e:
        print(f"❌ Error starting backend: {e}")
