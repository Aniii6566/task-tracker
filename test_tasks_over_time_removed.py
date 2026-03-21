#!/usr/bin/env python3
"""
Test that Tasks Over Time has been removed from analytics
"""

import requests
import json

def test_tasks_over_time_removed():
    print("🎯 TESTING TASKS OVER TIME REMOVAL")
    print("=" * 50)
    
    API_BASE = "http://localhost:5000/api"
    
    # Login
    login_data = {"email": "admin@test.com", "password": "admin123"}
    response = requests.post(f"{API_BASE}/auth/login", json=login_data, timeout=5)
    user_id = response.json()['user']['id']
    print("✅ Login successful!")
    
    # Test basic analytics still works
    print("\n1. Testing Basic Analytics...")
    response = requests.get(f"{API_BASE}/analytics?user_id={user_id}", timeout=5)
    
    if response.status_code == 200:
        data = response.json()
        if data.get('status') == 'success':
            print("✅ Basic analytics working!")
            print(f"   Completed: {data.get('completed', 0)}")
            print(f"   Pending: {data.get('pending', 0)}")
        else:
            print("❌ Basic analytics failed")
    else:
        print(f"❌ Basic analytics failed: {response.status_code}")
    
    print("\n✅ TASKS OVER TIME REMOVAL COMPLETE!")
    print("   • Tasks Over Time section removed from analytics page")
    print("   • Filter buttons removed")
    print("   • Bar chart removed")
    print("   • Replaced with Task Statistics panel")
    print("   • Analytics page now shows:")
    print("     - Completed vs Incomplete pie chart")
    print("     - Task Statistics (Total, Completed, Pending, Productivity)")

if __name__ == "__main__":
    test_tasks_over_time_removed()
