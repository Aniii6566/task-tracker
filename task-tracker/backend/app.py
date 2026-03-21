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
    
    # Create default user
    cursor.execute('SELECT COUNT(*) FROM users WHERE email = ?', ('admin@tasktracker.com',))
    if cursor.fetchone()[0] == 0:
        cursor.execute('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', 
                   ('Admin', 'admin@tasktracker.com', generate_password_hash('admin123')))
    
    db.commit()

init_db()

# Authentication
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
    user = cursor.fetchone()
    
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

# Tasks
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    user_id = request.args.get('user_id', '1')
    today = datetime.now().strftime('%Y-%m-%d')
    
    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT * FROM tasks WHERE user_id = ? AND DATE(created_at) = ? ORDER BY created_at DESC', 
               (user_id, today))
    tasks = cursor.fetchall()
    
    return jsonify([dict(task) for task in tasks])

@app.route('/api/tasks', methods=['POST'])
def create_task():
    data = request.get_json()
    user_id = data.get('user_id', '1')
    
    db = get_db()
    cursor = db.cursor()
    cursor.execute('INSERT INTO tasks (title, priority, status, user_id) VALUES (?, ?, ?, ?)', 
               (data['title'], data.get('priority', 'Medium'), 'Pending', user_id))
    db.commit()
    
    return jsonify({'message': 'Task created successfully'})

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.get_json()
    
    db = get_db()
    cursor = db.cursor()
    cursor.execute('UPDATE tasks SET status = ? WHERE id = ?', (data['status'], task_id))
    db.commit()
    
    return jsonify({'message': 'Task updated successfully'})

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute('DELETE FROM tasks WHERE id = ?', (task_id,))
    db.commit()
    
    return jsonify({'message': 'Task deleted successfully'})

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    user_id = request.args.get('user_id', '1')
    
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
        'today': today_stats,
        'week': week_stats
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
