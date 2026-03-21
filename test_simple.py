#!/usr/bin/env python3
"""
Simple test for the Task Activity Tracker
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:5000/api"

def test_simple():
    print("🚀 TESTING TASK ACTIVITY TRACKER")
    print("=" * 40)
    
    try:
        # Test Login
        print("1. Testing Login...")
        login_data = {"email": "admin@tasktracker.com", "password": "admin123"}
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Login successful!")
            print(f"   User: {data['user']['name']}")
            user_id = data['user']['id']
            
            # Test Create Task
            print("\n2. Testing Create Task...")
            task_data = {"title": "Test Task", "priority": "High", "user_id": user_id}
            response = requests.post(f"{BASE_URL}/tasks", json=task_data, timeout=5)
            
            if response.status_code == 200:
                print("✅ Task created successfully!")
                
                # Test Get Tasks
                print("\n3. Testing Get Tasks...")
                response = requests.get(f"{BASE_URL}/tasks?user_id={user_id}", timeout=5)
                
                if response.status_code == 200:
                    tasks = response.json()
                    print(f"✅ Retrieved {len(tasks)} tasks")
                    
                    # Test Analytics
                    print("\n4. Testing Analytics...")
                    response = requests.get(f"{BASE_URL}/analytics?user_id={user_id}", timeout=5)
                    
                    if response.status_code == 200:
                        analytics = response.json()
                        print("✅ Analytics working!")
                        
                        print("\n🎉 ALL TESTS PASSED!")
                        print("   System is ready to use!")
                        return True
                    else:
                        print("❌ Analytics failed")
                else:
                    print("❌ Get tasks failed")
            else:
                print("❌ Create task failed")
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(f"   Response: {response.text}")
        
        return False
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = test_simple()
    
    if success:
        print("\n" + "=" * 40)
        print("🎉 SYSTEM READY!")
        print("=" * 40)
        print("📱 Open: file:///d:/TRACKER/task-tracker/index.html")
        print("🔐 Login: admin@tasktracker.com / admin123")
        print("🚀 Backend: http://localhost:5000")
    else:
        print("\n❌ System not ready")
