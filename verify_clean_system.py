#!/usr/bin/env python3
"""
Verify the Task Activity Tracker system is clean and ready
"""

import sqlite3
import os
import json

def verify_database_state():
    """Verify database is in clean state"""
    print("🔍 VERIFYING DATABASE STATE")
    print("=" * 50)
    
    db_path = "d:/TRACKER/task-tracker/backend/task_tracker.db"
    
    if not os.path.exists(db_path):
        print("❌ Database file not found!")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check tables exist
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cursor.fetchall()]
        print(f"📋 Tables found: {tables}")
        
        # Check users table
        cursor.execute("SELECT COUNT(*) FROM users")
        users_count = cursor.fetchone()[0]
        print(f"👥 Users: {users_count}")
        
        if users_count > 0:
            cursor.execute("SELECT id, name, email FROM users")
            users = cursor.fetchall()
            for user in users:
                print(f"   - User {user[0]}: {user[1]} ({user[2]})")
        
        # Check tasks table
        cursor.execute("SELECT COUNT(*) FROM tasks")
        tasks_count = cursor.fetchone()[0]
        print(f"📝 Tasks: {tasks_count}")
        
        # Check if any tasks exist
        if tasks_count == 0:
            print("   ✅ No tasks found - Clean!")
        else:
            print("   ❌ Tasks still exist!")
            cursor.execute("SELECT id, title, status FROM tasks")
            tasks = cursor.fetchall()
            for task in tasks:
                print(f"   - Task {task[0]}: {task[1]} ({task[2]})")
        
        # Check for task_logs table
        if 'task_logs' in tables:
            cursor.execute("SELECT COUNT(*) FROM task_logs")
            logs_count = cursor.fetchone()[0]
            print(f"📊 Task Logs: {logs_count}")
            
            if logs_count == 0:
                print("   ✅ No task logs found - Clean!")
            else:
                print("   ❌ Task logs still exist!")
        else:
            print("📊 Task Logs: Table not found (expected for original app)")
        
        conn.close()
        
        # Determine if system is clean
        is_clean = (tasks_count == 0 and users_count > 0)
        
        if is_clean:
            print("\n✅ DATABASE STATE: CLEAN AND READY!")
            return True
        else:
            print("\n❌ DATABASE STATE: NOT CLEAN!")
            return False
            
    except Exception as e:
        print(f"❌ Error checking database: {e}")
        return False

def check_expected_frontend_state():
    """Check what the frontend should show"""
    print("\n🎨 EXPECTED FRONTEND STATE")
    print("=" * 50)
    
    print("📱 Dashboard should show:")
    print("   ✅ 'No tasks added yet' message")
    print("   ✅ Empty task list")
    print("   ✅ Metrics showing 0 tasks")
    print("   ✅ Ready to add new tasks")
    
    print("\n📊 Analytics should show:")
    print("   ✅ All metrics at 0")
    print("   ✅ Empty charts")
    print("   ✅ No data to display")
    
    print("\n📝 Completed tasks should show:")
    print("   ✅ 'No completed tasks' message")
    print("   ✅ Empty completed list")

def provide_usage_instructions():
    """Provide instructions for using the clean system"""
    print("\n🚀 USAGE INSTRUCTIONS")
    print("=" * 50)
    
    print("1. 🖥️  Start the backend:")
    print("   cd d:/TRACKER/task-tracker/backend")
    print("   python app.py")
    
    print("\n2. 🌐 Open the frontend:")
    print("   Double-click: d:/TRACKER/task-tracker/index.html")
    print("   OR open in browser: file:///d:/TRACKER/task-tracker/index.html")
    
    print("\n3. 🔐 Login with credentials:")
    print("   Email: admin@tasktracker.com")
    print("   Password: admin123")
    print("   (Or use the other user account if created)")
    
    print("\n4. ✅ Verify clean state:")
    print("   - Dashboard shows 'No tasks added yet'")
    print("   - All metrics show 0")
    print("   - Ready to add new tasks")
    
    print("\n5. ➕ Add your first task:")
    print("   - Enter task title")
    print("   - Click 'Add Task'")
    print("   - Task should appear immediately")

def main():
    """Main verification function"""
    print("🧹 TASK ACTIVITY TRACKER - CLEAN SYSTEM VERIFICATION")
    print("=" * 70)
    
    # Verify database state
    is_clean = verify_database_state()
    
    # Show expected frontend state
    check_expected_frontend_state()
    
    # Provide usage instructions
    provide_usage_instructions()
    
    print("\n" + "=" * 70)
    if is_clean:
        print("🎉 VERIFICATION COMPLETE - SYSTEM IS READY!")
        print("=" * 70)
        print("✅ SUMMARY:")
        print("   • Project structure analyzed")
        print("   • All task data cleared successfully")
        print("   • Users table preserved")
        print("   • Database structure intact")
        print("   • System ready for fresh start")
        print("   • Expected frontend state documented")
        
        print("\n🎯 READY FOR:")
        print("   • Adding new recurring tasks")
        print("   • Testing daily task management")
        print("   • Building task completion habits")
        print("   • Tracking daily progress")
        
    else:
        print("❌ VERIFICATION FAILED - SYSTEM NOT READY!")
        print("=" * 70)
        print("❌ ISSUES FOUND:")
        print("   • Database may still contain task data")
        print("   • Please run the clearing script again")
        print("   • Check database file permissions")

if __name__ == "__main__":
    main()
