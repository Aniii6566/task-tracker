#!/usr/bin/env python3
"""
Production Setup Script for Task Activity Tracker
"""

import os
import sys
import subprocess
import psycopg2
from datetime import datetime

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 7):
        print("❌ Python 3.7 or higher is required")
        return False
    print(f"✅ Python {sys.version.split()[0]} detected")
    return True

def install_dependencies():
    """Install required dependencies"""
    print("\n📦 Installing dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError:
        print("❌ Failed to install dependencies")
        return False

def setup_environment():
    """Setup environment variables"""
    print("\n🔧 Setting up environment...")
    
    # Check if .env file exists
    if not os.path.exists('.env'):
        if os.path.exists('.env.example'):
            # Copy .env.example to .env
            with open('.env.example', 'r') as f:
                env_content = f.read()
            
            with open('.env', 'w') as f:
                f.write(env_content)
            
            print("✅ Created .env file from .env.example")
            print("⚠️  Please edit .env file with your database credentials")
        else:
            print("❌ .env.example file not found")
            return False
    else:
        print("✅ .env file already exists")
    
    return True

def test_database_connection():
    """Test PostgreSQL connection"""
    print("\n🗄️  Testing database connection...")
    
    # Load environment variables
    if os.path.exists('.env'):
        with open('.env', 'r') as f:
            for line in f:
                if line.strip() and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    os.environ[key] = value
    
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("❌ DATABASE_URL not found in .env file")
        return False
    
    try:
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor()
        
        # Test connection
        cursor.execute('SELECT 1')
        result = cursor.fetchone()
        
        if result[0] == 1:
            print("✅ Database connection successful")
            
            # Check if tables exist
            cursor.execute('''
                SELECT table_name FROM information_schema.tables 
                WHERE table_schema = 'public'
            ''')
            tables = [row[0] for row in cursor.fetchall()]
            
            if 'users' in tables and 'tasks' in tables:
                print("✅ Database tables already exist")
            else:
                print("⚠️  Database tables will be created on first run")
            
            conn.close()
            return True
        else:
            print("❌ Database test failed")
            return False
            
    except psycopg2.OperationalError as e:
        print(f"❌ Database connection failed: {e}")
        print("💡 Please check your DATABASE_URL in .env file")
        return False
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False

def create_desktop_shortcut():
    """Create desktop shortcut for easy access"""
    print("\n🖥️  Creating desktop shortcut...")
    
    try:
        import platform
        
        if platform.system() == "Windows":
            # Create Windows shortcut
            import winshell
            from win32com.client import Dispatch
            
            desktop = winshell.desktop()
            path = os.path.join(desktop, "Task Tracker.lnk")
            target = os.path.join(os.getcwd(), "index_production.html")
            wDir = os.getcwd()
            icon = target
            
            shell = Dispatch('WScript.Shell')
            shortcut = shell.CreateShortCut(path)
            shortcut.Targetpath = target
            shortcut.WorkingDirectory = wDir
            shortcut.IconLocation = icon
            shortcut.save()
            
            print("✅ Desktop shortcut created (Windows)")
            
        elif platform.system() == "Darwin":  # macOS
            # Create macOS shortcut
            desktop = os.path.expanduser("~/Desktop")
            script_path = os.path.join(desktop, "Task Tracker.command")
            
            with open(script_path, 'w') as f:
                f.write(f'#!/bin/bash\nopen "{os.path.join(os.getcwd(), "index_production.html")}"')
            
            os.chmod(script_path, 0o755)
            print("✅ Desktop shortcut created (macOS)")
            
        else:  # Linux
            # Create Linux desktop entry
            desktop_dir = os.path.expanduser("~/.local/share/applications")
            os.makedirs(desktop_dir, exist_ok=True)
            
            desktop_entry = f"""[Desktop Entry]
Version=1.0
Type=Application
Name=Task Tracker
Comment=Daily Task Management System
Exec=xdg-open "{os.path.join(os.getcwd(), "index_production.html")}"
Icon=applications-office
Terminal=false
Categories=Office;
"""
            
            with open(os.path.join(desktop_dir, "task-tracker.desktop"), 'w') as f:
                f.write(desktop_entry)
            
            print("✅ Desktop shortcut created (Linux)")
            
    except ImportError:
        print("⚠️  Could not create desktop shortcut (missing dependencies)")
    except Exception as e:
        print(f"⚠️  Could not create desktop shortcut: {e}")

def print_next_steps():
    """Print next steps for the user"""
    print("\n" + "=" * 60)
    print("🎯 SETUP COMPLETE!")
    print("=" * 60)
    
    print("\n✅ Production Task Activity Tracker is ready!")
    
    print("\n📋 NEXT STEPS:")
    print("1. Start the backend server:")
    print("   python app_production.py")
    
    print("\n2. Open the frontend:")
    print("   • Double-click the desktop shortcut")
    print("   • Or open: index_production.html")
    
    print("\n3. Login with:")
    print("   • Email: admin@test.com")
    print("   • Password: admin123")
    
    print("\n🌐 DEPLOYMENT OPTIONS:")
    print("• Local: http://localhost:5000")
    print("• Network: http://YOUR_IP:5000")
    print("• Cloud: Follow DEPLOYMENT_GUIDE.md")
    
    print("\n📚 DOCUMENTATION:")
    print("• DEPLOYMENT_GUIDE.md - Full deployment instructions")
    print("• .env.example - Environment configuration")
    print("• requirements.txt - Python dependencies")
    
    print("\n🎉 ENJOY YOUR PRODUCTION TASK TRACKER!")

def main():
    """Main setup function"""
    print("🚀 Task Activity Tracker - Production Setup")
    print("=" * 60)
    
    # Check Python version
    if not check_python_version():
        return
    
    # Install dependencies
    if not install_dependencies():
        return
    
    # Setup environment
    if not setup_environment():
        return
    
    # Test database connection
    if not test_database_connection():
        print("\n💡 To set up PostgreSQL:")
        print("1. Install PostgreSQL: https://www.postgresql.org/download/")
        print("2. Create database: createdb tasktracker")
        print("3. Update DATABASE_URL in .env file")
        print("4. Run this setup script again")
        return
    
    # Create desktop shortcut
    create_desktop_shortcut()
    
    # Print next steps
    print_next_steps()

if __name__ == "__main__":
    main()
