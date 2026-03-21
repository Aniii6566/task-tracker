#!/usr/bin/env python3
"""
Test the Simplified Task Activity Tracker System
"""

import requests
import json
import time

# Configuration
API_BASE = "http://localhost:5000/api"

def test_simplified_system():
    print("🚀 TESTING SIMPLIFIED TASK ACTIVITY TRACKER")
    print("=" * 60)
    
    results = {
        'login': False,
        'task_creation': False,
        'task_completion': False,
        'task_deletion': False,
        'today_tasks': False,
        'completed_tasks': False,
        'history': False,
        'dashboard_metrics': False,
        'analytics': False,
        'quote': False,
        'settings': False
    }
    
    try:
        # Test 1: Login
        print("\n1. Testing Login...")
        try:
            login_data = {"email": "admin@test.com", "password": "admin123"}
            response = requests.post(f"{API_BASE}/auth/login", json=login_data, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                if 'user' in data:  # Check for user in response instead of status
                    print("✅ Login successful!")
                    print(f"   User: {data['user']['name']} ({data['user']['email']})")
                    user_id = data['user']['id']
                    token = data['token']
                    results['login'] = True
                else:
                    print(f"❌ Login failed: {data.get('error', 'Invalid response format')}")
            else:
                print(f"❌ Login failed: {response.status_code}")
                print(f"   Response: {response.text}")
        except Exception as e:
            print(f"❌ Login error: {e}")
        
        if not results['login']:
            print("❌ Cannot continue tests without successful login")
            return results
        
        # Test 2: Get Motivational Quote
        print("\n2. Testing Motivational Quote...")
        try:
            response = requests.get(f"{API_BASE}/quote", timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success':
                    print("✅ Quote retrieved successfully!")
                    print(f"   Quote: {data['quote']}")
                    results['quote'] = True
                else:
                    print(f"❌ Quote failed: {data.get('error')}")
            else:
                print(f"❌ Quote failed: {response.status_code}")
        except Exception as e:
            print(f"❌ Quote error: {e}")
        
        # Test 3: Create Task (without priority)
        print("\n3. Testing Task Creation...")
        try:
            task_data = {
                "title": "Simplified Test Task",
                "user_id": user_id
            }
            response = requests.post(f"{API_BASE}/tasks", json=task_data, timeout=5)
            
            if response.status_code == 201:
                data = response.json()
                if data.get('status') == 'success':
                    print("✅ Task created successfully!")
                    print(f"   Title: {data['task']['title']}")
                    print(f"   Status: {data['task']['status']}")
                    print(f"   Created: {data['task']['created_at']}")
                    task_id = data['task']['id']
                    results['task_creation'] = True
                else:
                    print(f"❌ Task creation failed: {data.get('error')}")
            else:
                print(f"❌ Task creation failed: {response.status_code}")
        except Exception as e:
            print(f"❌ Task creation error: {e}")
        
        # Test 4: Get Today's Tasks
        print("\n4. Testing Today's Tasks...")
        try:
            response = requests.get(f"{API_BASE}/tasks/today?user_id={user_id}", timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success':
                    print("✅ Today's tasks retrieved successfully!")
                    print(f"   Total tasks today: {len(data.get('tasks', []))}")
                    results['today_tasks'] = True
                else:
                    print(f"❌ Today's tasks failed: {data.get('error')}")
            else:
                print(f"❌ Today's tasks failed: {response.status_code}")
        except Exception as e:
            print(f"❌ Today's tasks error: {e}")
        
        # Test 5: Mark Task as Completed
        print("\n5. Testing Task Completion...")
        try:
            response = requests.put(f"{API_BASE}/tasks/{task_id}", json={"status": "Completed"}, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success':
                    print("✅ Task marked as completed!")
                    print(f"   New Status: {data['task']['status']}")
                    results['task_completion'] = True
                else:
                    print(f"❌ Task completion failed: {data.get('error')}")
            else:
                print(f"❌ Task completion failed: {response.status_code}")
        except Exception as e:
            print(f"❌ Task completion error: {e}")
        
        # Test 6: Get Completed Tasks
        print("\n6. Testing Completed Tasks...")
        try:
            response = requests.get(f"{API_BASE}/tasks/completed?user_id={user_id}", timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success':
                    print("✅ Completed tasks retrieved successfully!")
                    print(f"   Completed tasks: {len(data.get('tasks', []))}")
                    results['completed_tasks'] = True
                else:
                    print(f"❌ Completed tasks failed: {data.get('error')}")
            else:
                print(f"❌ Completed tasks failed: {response.status_code}")
        except Exception as e:
            print(f"❌ Completed tasks error: {e}")
        
        # Test 7: Get Dashboard Metrics
        print("\n7. Testing Dashboard Metrics...")
        try:
            response = requests.get(f"{API_BASE}/dashboard/metrics?user_id={user_id}", timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success':
                    metrics = data.get('metrics', {})
                    print("✅ Dashboard metrics retrieved successfully!")
                    print(f"   Total Tasks: {metrics.get('total_tasks')}")
                    print(f"   Completed: {metrics.get('completed_tasks')}")
                    print(f"   Pending: {metrics.get('pending_tasks')}")
                    print(f"   Productivity: {metrics.get('productivity')}%")
                    results['dashboard_metrics'] = True
                else:
                    print(f"❌ Dashboard metrics failed: {data.get('error')}")
            else:
                print(f"❌ Dashboard metrics failed: {response.status_code}")
        except Exception as e:
            print(f"❌ Dashboard metrics error: {e}")
        
        # Test 8: Get Analytics
        print("\n8. Testing Analytics...")
        try:
            response = requests.get(f"{API_BASE}/analytics?user_id={user_id}", timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success':
                    print("✅ Analytics retrieved successfully!")
                    print(f"   Today's stats: {data.get('today_stats')}")
                    print(f"   Week stats: {data.get('week_stats')}")
                    results['analytics'] = True
                else:
                    print(f"❌ Analytics failed: {data.get('error')}")
            else:
                print(f"❌ Analytics failed: {response.status_code}")
        except Exception as e:
            print(f"❌ Analytics error: {e}")
        
        # Test 9: Test History (Daily)
        print("\n9. Testing History (Daily)...")
        try:
            today = time.strftime('%Y-%m-%d')
            response = requests.get(f"{API_BASE}/tasks/history?user_id={user_id}&filter=daily&date={today}", timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success':
                    print("✅ Daily history retrieved successfully!")
                    print(f"   Tasks today: {len(data.get('tasks', []))}")
                    results['history'] = True
                else:
                    print(f"❌ Daily history failed: {data.get('error')}")
            else:
                print(f"❌ Daily history failed: {response.status_code}")
        except Exception as e:
            print(f"❌ Daily history error: {e}")
        
        # Test 10: Test Settings (Update Name)
        print("\n10. Testing Settings (Update Name)...")
        try:
            response = requests.put(f"{API_BASE}/user/update-name", 
                                  json={"user_id": user_id, "name": "Test User"}, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success':
                    print("✅ Name updated successfully!")
                    print(f"   New name: {data['user']['name']}")
                    results['settings'] = True
                else:
                    print(f"❌ Name update failed: {data.get('error')}")
            else:
                print(f"❌ Name update failed: {response.status_code}")
        except Exception as e:
            print(f"❌ Name update error: {e}")
        
        # Test 11: Delete Task
        print("\n11. Testing Task Deletion...")
        try:
            response = requests.delete(f"{API_BASE}/tasks/{task_id}", timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success':
                    print("✅ Task deleted successfully!")
                    results['task_deletion'] = True
                else:
                    print(f"❌ Task deletion failed: {data.get('error')}")
            else:
                print(f"❌ Task deletion failed: {response.status_code}")
        except Exception as e:
            print(f"❌ Task deletion error: {e}")
        
        # Test 12: Create Multiple Tasks for Testing
        print("\n12. Testing Multiple Task Creation...")
        try:
            tasks_created = []
            for i in range(5):
                task_data = {
                    "title": f"Test Task {i+1}",
                    "user_id": user_id
                }
                response = requests.post(f"{API_BASE}/tasks", json=task_data, timeout=5)
                
                if response.status_code == 201:
                    data = response.json()
                    if data.get('status') == 'success':
                        tasks_created.append(data['task']['id'])
                        print(f"   ✅ Created task {i+1}: {task_data['title']}")
                    else:
                        print(f"   ❌ Failed to create task {i+1}")
                else:
                    print(f"   ❌ Failed to create task {i+1}: {response.status_code}")
            
            if len(tasks_created) == 5:
                print("✅ Multiple tasks created successfully!")
                
                # Clean up
                for task_id in tasks_created:
                    requests.delete(f"{API_BASE}/tasks/{task_id}", timeout=5)
                
                print("✅ Test tasks cleaned up")
            else:
                print("❌ Multiple task creation failed")
        except Exception as e:
            print(f"❌ Multiple task creation error: {e}")
        
    except Exception as e:
        print(f"❌ System test error: {e}")
    
    return results

def print_final_results(results):
    print("\n" + "=" * 60)
    print("🎯 SIMPLIFIED SYSTEM AUDIT RESULTS")
    print("=" * 60)
    
    total_tests = len(results)
    passed_tests = sum(results.values())
    failed_tests = total_tests - passed_tests
    
    print(f"\n📊 SUMMARY:")
    print(f"   Total Tests: {total_tests}")
    print(f"   Passed: {passed_tests}")
    print(f"   Failed: {failed_tests}")
    print(f"   Success Rate: {round((passed_tests/total_tests)*100, 1)}%")
    
    print(f"\n✅ PASSED TESTS:")
    for test, passed in results.items():
        if passed:
            print(f"   • {test.replace('_', ' ').title()}")
    
    if failed_tests > 0:
        print(f"\n❌ FAILED TESTS:")
        for test, passed in results.items():
            if not passed:
                print(f"   • {test.replace('_', ' ').title()}")
    
    print(f"\n🎯 SIMPLIFIED SYSTEM FEATURES:")
    print("   • Removed priority field from tasks")
    print("   • Only Done and Delete buttons")
    print("   • Simplified task structure: id, title, status, created_at, user_id")
    print("   • Today's Tasks section (pending only)")
    print("   • Completed Tasks section")
    print("   • History with daily/weekly/monthly filters")
    print("   • Dashboard metrics with productivity calculation")
    print("   • Analytics with pie and bar charts")
    print("   • Settings for name and password updates")
    print("   • Motivational quotes on dashboard")
    print("   • Real-time header with date/time")
    print("   • Modern dark theme UI")
    
    print(f"\n🚀 NEXT STEPS:")
    if passed_tests == total_tests:
        print("   🎉 ALL TESTS PASSED! System is ready.")
        print("   📱 Frontend: file:///d:/TRACKER/task-tracker/index_simple.html")
        print("   🔐 Login: admin@test.com / admin123")
        print("   🚀 Backend: python app_simple.py")
        print("   ✨ Enjoy your simplified task tracker!")
    else:
        print("   🔧 Fix failed tests before using the system.")
        print("   📋 Check backend logs for detailed error information.")
        print("   🧪 Re-run test after fixes.")

if __name__ == "__main__":
    results = test_simplified_system()
    print_final_results(results)
