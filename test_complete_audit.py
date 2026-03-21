#!/usr/bin/env python3
"""
Complete Audit Test for Task Activity Tracker
Tests all functionality after fixes
"""

import requests
import json
import time

# Configuration
API_BASE = "http://localhost:5000/api"

def test_complete_audit():
    print("🔍 COMPLETE AUDIT TEST - TASK ACTIVITY TRACKER")
    print("=" * 60)
    
    results = {
        'health': False,
        'login': False,
        'task_creation': False,
        'task_update': False,
        'task_deletion': False,
        'analytics': False,
        'history': False,
        'daily_filter': False
    }
    
    try:
        # Test 1: Health Check
        print("\n1. Testing Health Check...")
        try:
            response = requests.get(f"{API_BASE}/health", timeout=5)
            if response.status_code == 200:
                data = response.json()
                print("✅ Health check successful")
                print(f"   Status: {data.get('status')}")
                print(f"   Database: {data.get('database')}")
                results['health'] = True
            else:
                print(f"❌ Health check failed: {response.status_code}")
        except Exception as e:
            print(f"❌ Health check error: {e}")
        
        # Test 2: Login with new user
        print("\n2. Testing Login System...")
        try:
            login_data = {"email": "admin@test.com", "password": "admin123"}
            response = requests.post(f"{API_BASE}/auth/login", json=login_data, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success':
                    print("✅ Login successful!")
                    print(f"   User: {data['user']['name']} ({data['user']['email']})")
                    user_id = data['user']['id']
                    token = data['token']
                    results['login'] = True
                else:
                    print(f"❌ Login failed: {data.get('error')}")
            else:
                print(f"❌ Login failed: {response.status_code}")
                print(f"   Response: {response.text}")
        except Exception as e:
            print(f"❌ Login error: {e}")
        
        if not results['login']:
            print("❌ Cannot continue tests without successful login")
            return results
        
        # Test 3: Task Creation
        print("\n3. Testing Task Creation...")
        try:
            task_data = {
                "title": "Audit Test Task",
                "priority": "High",
                "user_id": user_id
            }
            response = requests.post(f"{API_BASE}/tasks", json=task_data, timeout=5)
            
            if response.status_code == 201:
                data = response.json()
                if data.get('status') == 'success':
                    print("✅ Task created successfully!")
                    print(f"   Title: {data['task']['title']}")
                    print(f"   Priority: {data['task']['priority']}")
                    print(f"   Status: {data['task']['status']}")
                    print(f"   Created: {data['task']['created_at']}")
                    task_id = data['task']['id']
                    results['task_creation'] = True
                else:
                    print(f"❌ Task creation failed: {data.get('error')}")
            else:
                print(f"❌ Task creation failed: {response.status_code}")
                print(f"   Response: {response.text}")
        except Exception as e:
            print(f"❌ Task creation error: {e}")
        
        # Test 4: Task Update
        print("\n4. Testing Task Update...")
        try:
            update_data = {"status": "In Progress"}
            response = requests.put(f"{API_BASE}/tasks/{task_id}", json=update_data, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success':
                    print("✅ Task updated successfully!")
                    print(f"   New Status: {data['task']['status']}")
                    results['task_update'] = True
                else:
                    print(f"❌ Task update failed: {data.get('error')}")
            else:
                print(f"❌ Task update failed: {response.status_code}")
        except Exception as e:
            print(f"❌ Task update error: {e}")
        
        # Test 5: Task Status Changes
        print("\n5. Testing Task Status Workflow...")
        try:
            # Update to Completed
            response = requests.put(f"{API_BASE}/tasks/{task_id}", json={"status": "Completed"}, timeout=5)
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success':
                    print("✅ Task status updated to Completed!")
                    
                    # Update back to Pending
                    response = requests.put(f"{API_BASE}/tasks/{task_id}", json={"status": "Pending"}, timeout=5)
                    if response.status_code == 200:
                        print("✅ Task status updated back to Pending!")
                        results['task_update'] = True
                    else:
                        print("❌ Failed to update task back to Pending")
            else:
                print(f"❌ Task status update failed: {response.status_code}")
        except Exception as e:
            print(f"❌ Task status workflow error: {e}")
        
        # Test 6: Get Tasks (Daily Filter)
        print("\n6. Testing Daily Task Filter...")
        try:
            response = requests.get(f"{API_BASE}/tasks?user_id={user_id}", timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success':
                    print("✅ Daily tasks retrieved successfully!")
                    print(f"   Total tasks today: {data.get('total')}")
                    tasks = data.get('tasks', [])
                    
                    # Verify tasks are for today
                    today = time.strftime('%Y-%m-%d')
                    for task in tasks:
                        task_date = task['created_at'].split(' ')[0]
                        if task_date != today:
                            print(f"❌ Task from wrong date: {task_date} (expected {today})")
                            return results
                    
                    print("✅ All tasks are correctly filtered for today")
                    results['daily_filter'] = True
                else:
                    print(f"❌ Get tasks failed: {data.get('error')}")
            else:
                print(f"❌ Get tasks failed: {response.status_code}")
        except Exception as e:
            print(f"❌ Get tasks error: {e}")
        
        # Test 7: Analytics
        print("\n7. Testing Analytics...")
        try:
            response = requests.get(f"{API_BASE}/analytics?user_id={user_id}", timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success':
                    print("✅ Analytics retrieved successfully!")
                    print(f"   Today's stats: {data.get('today')}")
                    print(f"   Week stats: {data.get('week')}")
                    results['analytics'] = True
                else:
                    print(f"❌ Analytics failed: {data.get('error')}")
            else:
                print(f"❌ Analytics failed: {response.status_code}")
        except Exception as e:
            print(f"❌ Analytics error: {e}")
        
        # Test 8: History
        print("\n8. Testing Task History...")
        try:
            response = requests.get(f"{API_BASE}/tasks/history?user_id={user_id}", timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success':
                    print("✅ Task history retrieved successfully!")
                    print(f"   Total tasks in history: {data.get('total')}")
                    results['history'] = True
                else:
                    print(f"❌ History failed: {data.get('error')}")
            else:
                print(f"❌ History failed: {response.status_code}")
        except Exception as e:
            print(f"❌ History error: {e}")
        
        # Test 9: Task Deletion
        print("\n9. Testing Task Deletion...")
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
        
        # Test 10: Multiple Task Creation
        print("\n10. Testing Multiple Task Creation...")
        try:
            tasks_created = []
            for i in range(3):
                task_data = {
                    "title": f"Test Task {i+1}",
                    "priority": ["Low", "Medium", "High"][i],
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
            
            if len(tasks_created) == 3:
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
        print(f"❌ Audit test error: {e}")
    
    return results

def print_final_results(results):
    print("\n" + "=" * 60)
    print("🎯 FINAL AUDIT RESULTS")
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
    
    print(f"\n🎯 RECOMMENDATIONS:")
    if passed_tests == total_tests:
        print("   🎉 ALL TESTS PASSED! System is ready for deployment.")
        print("   📱 Frontend: file:///d:/TRACKER/task-tracker/index_fixed.html")
        print("   🔐 Login: admin@test.com / admin123")
        print("   🚀 Backend: http://localhost:5000")
    else:
        print("   🔧 Fix failed tests before deployment.")
        print("   📋 Check backend logs for detailed error information.")
        print("   🧪 Re-run audit after fixes.")
    
    print(f"\n🚀 NEXT STEPS:")
    print("   1. Start the fixed backend: python app_fixed.py")
    print("   2. Open the fixed frontend: index_fixed.html")
    print("   3. Test all functionality manually")
    print("   4. Deploy if all tests pass")

if __name__ == "__main__":
    results = test_complete_audit()
    print_final_results(results)
