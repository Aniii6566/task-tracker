#!/usr/bin/env python3
"""
Clear all task data from Task Activity Tracker and show project structure
"""

import os
import sqlite3
import json
from pathlib import Path

def show_project_structure():
    """Display the complete project structure"""
    print("📁 TASK ACTIVITY TRACKER PROJECT STRUCTURE")
    print("=" * 70)
    
    def print_tree(directory, prefix="", max_depth=3, current_depth=0):
        if current_depth >= max_depth:
            return
            
        try:
            items = sorted(Path(directory).iterdir(), key=lambda x: (x.is_file(), x.name.lower()))
        except PermissionError:
            return
            
        dirs = []
        files = []
        
        for item in items:
            if item.is_dir() and not item.name.startswith('.'):
                dirs.append(item)
            elif item.is_file() and not item.name.startswith('.'):
                files.append(item)
        
        # Print directories first
        for i, dir_item in enumerate(dirs):
            is_last_dir = (i == len(dirs) - 1) and len(files) == 0
            print(f"{prefix}{'└── ' if is_last_dir else '├── '}{dir_item.name}/")
            
            # Recurse into directory
            extension = "    " if is_last_dir else "│   "
            print_tree(dir_item, prefix + extension, max_depth, current_depth + 1)
        
        # Print files
        for i, file_item in enumerate(files):
            is_last = i == len(files) - 1
            size = file_item.stat().st_size
            size_str = f" ({size:,} bytes)" if size > 1024 else ""
            print(f"{prefix}{'└── ' if is_last else '├── '}{file_item.name}{size_str}")
    
    print_tree("d:/TRACKER/task-tracker")
    
    print("\n" + "=" * 70)
    print("📊 PROJECT SUMMARY")
    print("=" * 70)
    
    # Count files by type
    project_root = Path("d:/TRACKER/task-tracker")
    
    html_files = list(project_root.glob("*.html"))
    py_files = list(project_root.glob("**/*.py"))
    md_files = list(project_root.glob("**/*.md"))
    db_files = list(project_root.glob("**/*.db"))
    
    print(f"📄 HTML Files: {len(html_files)}")
    for html_file in html_files:
        print(f"   - {html_file.name}")
    
    print(f"\n🐍 Python Files: {len(py_files)}")
    for py_file in py_files:
        print(f"   - {py_file.relative_to(project_root)}")
    
    print(f"\n📝 Markdown Files: {len(md_files)}")
    for md_file in md_files:
        print(f"   - {md_file.relative_to(project_root)}")
    
    print(f"\n🗄️ Database Files: {len(db_files)}")
    for db_file in db_files:
        print(f"   - {db_file.relative_to(project_root)}")

def clear_task_data():
    """Clear all task data from the database"""
    print("\n🗑️ CLEARING TASK DATA")
    print("=" * 70)
    
    db_path = "d:/TRACKER/task-tracker/backend/task_tracker.db"
    
    if not os.path.exists(db_path):
        print("❌ Database file not found!")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check current data before deletion
        cursor.execute("SELECT COUNT(*) FROM tasks")
        tasks_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='task_logs'")
        task_logs_exists = cursor.fetchone()
        
        logs_count = 0
        if task_logs_exists:
            cursor.execute("SELECT COUNT(*) FROM task_logs")
            logs_count = cursor.fetchone()[0]
        
        print(f"📊 Current Data Status:")
        print(f"   Tasks: {tasks_count}")
        print(f"   Task Logs: {logs_count}")
        print(f"   Task Logs Table: {'Exists' if task_logs_exists else 'Not Found'}")
        
        # Clear task data
        print(f"\n🗑️ Deleting task data...")
        
        # Delete from tasks table
        cursor.execute("DELETE FROM tasks")
        tasks_deleted = cursor.rowcount
        
        # Delete from task_logs table if it exists
        logs_deleted = 0
        if task_logs_exists:
            cursor.execute("DELETE FROM task_logs")
            logs_deleted = cursor.rowcount
        
        conn.commit()
        
        print(f"✅ Data deletion complete!")
        print(f"   Tasks deleted: {tasks_deleted}")
        print(f"   Task logs deleted: {logs_deleted}")
        
        # Verify deletion
        cursor.execute("SELECT COUNT(*) FROM tasks")
        remaining_tasks = cursor.fetchone()[0]
        
        remaining_logs = 0
        if task_logs_exists:
            cursor.execute("SELECT COUNT(*) FROM task_logs")
            remaining_logs = cursor.fetchone()[0]
        
        print(f"\n🔍 Verification:")
        print(f"   Remaining tasks: {remaining_tasks}")
        print(f"   Remaining task logs: {remaining_logs}")
        
        # Check users table is intact
        cursor.execute("SELECT COUNT(*) FROM users")
        users_count = cursor.fetchone()[0]
        print(f"   Users intact: {users_count} users")
        
        conn.close()
        
        if remaining_tasks == 0 and remaining_logs == 0 and users_count > 0:
            print(f"\n✅ SUCCESS: All task data cleared, users preserved!")
            return True
        else:
            print(f"\n❌ ERROR: Data clearing incomplete!")
            return False
            
    except Exception as e:
        print(f"\n❌ ERROR: Failed to clear task data: {e}")
        return False

def test_api_response():
    """Test API to verify clean state"""
    print("\n🌐 TESTING API RESPONSE")
    print("=" * 70)
    
    try:
        import requests
        
        # Test health check
        response = requests.get('http://localhost:5000/api/tasks?user_id=1', timeout=5)
        
        if response.status_code == 200:
            tasks = response.json()
            print(f"✅ API responding correctly!")
            print(f"   Tasks returned: {len(tasks)}")
            
            if len(tasks) == 0:
                print("   ✅ No tasks found - System is clean!")
            else:
                print("   ⚠️  Tasks still exist - Check backend!")
        else:
            print(f"❌ API error: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("⚠️  Backend not running - Start with: python backend/app.py")
    except Exception as e:
        print(f"❌ API test error: {e}")

def main():
    """Main execution function"""
    print("🧹 TASK ACTIVITY TRACKER - DATA CLEARING & STRUCTURE ANALYSIS")
    print("=" * 70)
    
    # Show project structure
    show_project_structure()
    
    # Clear task data
    success = clear_task_data()
    
    if success:
        print("\n🎉 TASK DATA CLEARING COMPLETE!")
        print("=" * 70)
        print("✅ RESULTS:")
        print("   • Project structure displayed")
        print("   • All task data deleted")
        print("   • Users table preserved")
        print("   • Database structure intact")
        print("   • System ready for fresh start")
        
        print("\n🚀 NEXT STEPS:")
        print("   1. Start backend: python backend/app.py")
        print("   2. Open frontend: index.html")
        print("   3. Login with: admin@tasktracker.com / admin123")
        print("   4. Dashboard should show: 'No tasks added yet'")
        
        # Test API if possible
        test_api_response()
        
    else:
        print("\n❌ TASK DATA CLEARING FAILED!")
        print("   Please check the database file and permissions")

if __name__ == "__main__":
    main()
