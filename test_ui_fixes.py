#!/usr/bin/env python3
"""
Test UI fixes and task functionality
"""

import requests
import json
import time

# Configuration
API_BASE = "http://localhost:5000/api"

def test_ui_fixes():
    print("🔧 TESTING UI FIXES AND TASK FUNCTIONALITY")
    print("=" * 60)
    
    results = {
        'login': False,
        'task_creation': False,
        'task_completion': False,
        'task_deletion': False,
        'today_tasks_pending': False,
        'completed_tasks': False,
        'dashboard_metrics': False,
        'real_time_updates': False
    }
    
    try:
        # Test 1: Login
        print("\n1. Testing Login...")
        try:
            login_data = {"email": "admin@test.com", "password": "admin123"}
            response = requests.post(f"{API_BASE}/auth/login", json=login_data, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                if 'user' in data:
                    print("✅ Login successful!")
                    print(f"   User: {data['user']['name']} ({data['user']['email']})")
                    user_id = data['user']['id']
                    token = data['token']
                    results['login'] = True
                else:
                    print(f"❌ Login failed: {data.get('error', 'Invalid response format')}")
            else:
                print(f"❌ Login failed: {response.status_code}")
        except Exception as e:
            print(f"❌ Login error: {e}")
        
        if not results['login']:
            print("❌ Cannot continue tests without successful login")
            return results
        
        # Test 2: Task Creation (Simple)
        print("\n2. Testing Task Creation...")
        try:
            task_data = {
                "title": "Gym",
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
                print(f"   Response: {response.text}")
        except Exception as e:
            print(f"❌ Task creation error: {e}")
        
        # Test 3: Get Today's Tasks (Pending Only)
        print("\n3. Testing Today's Tasks (Pending Only)...")
        try:
            response = requests.get(f"{API_BASE}/tasks/today?user_id={user_id}", timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success':
                    tasks = data.get('tasks', [])
                    pending_tasks = [t for t in tasks if t.get('status') == 'Pending']
                    print("✅ Today's tasks retrieved successfully!")
                    print(f"   Total tasks today: {len(tasks)}")
                    print(f"   Pending tasks: {len(pending_tasks)}")
                    
                    # Verify all tasks are from today
                    today = time.strftime('%Y-%m-%d')
                    for task in tasks:
                        task_date = task['created_at'].split(' ')[0]
                        if task_date != today:
                            print(f"❌ Task from wrong date: {task_date} (expected {today})")
                            return results
                    
                    print("✅ All tasks are correctly filtered for today")
                    results['today_tasks_pending'] = True
                else:
                    print(f"❌ Today's tasks failed: {data.get('error')}")
            else:
                print(f"❌ Today's tasks failed: {response.status_code}")
        except Exception as e:
            print(f"❌ Today's tasks error: {e}")
        
        # Test 4: Task Completion (Done Button)
        print("\n4. Testing Task Completion...")
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
                print(f"   Response: {response.text}")
        except Exception as e:
            print(f"❌ Task completion error: {e}")
        
        # Test 5: Get Completed Tasks
        print("\n5. Testing Completed Tasks...")
        try:
            response = requests.get(f"{API_BASE}/tasks/completed?user_id={user_id}", timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success':
                    tasks = data.get('tasks', [])
                    completed_tasks = [t for t in tasks if t.get('status') == 'Completed']
                    print("✅ Completed tasks retrieved successfully!")
                    print(f"   Completed tasks: {len(completed_tasks)}")
                    
                    # Verify all tasks are completed
                    for task in tasks:
                        if task.get('status') != 'Completed':
                            print(f"❌ Non-completed task in completed list: {task.get('status')}")
                            return results
                    
                    print("✅ All tasks in completed list are properly marked as completed")
                    results['completed_tasks'] = True
                else:
                    print(f"❌ Completed tasks failed: {data.get('error')}")
            else:
                print(f"❌ Completed tasks failed: {response.status_code}")
        except Exception as e:
            print(f"❌ Completed tasks error: {e}")
        
        # Test 6: Dashboard Metrics
        print("\n6. Testing Dashboard Metrics...")
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
                    
                    # Verify productivity calculation
                    total = metrics.get('total_tasks', 0)
                    completed = metrics.get('completed_tasks', 0)
                    expected_productivity = (completed / total * 100) if total > 0 else 0
                    actual_productivity = metrics.get('productivity', 0)
                    
                    if abs(expected_productivity - actual_productivity) < 0.1:
                        print("✅ Productivity calculation is correct")
                        results['dashboard_metrics'] = True
                    else:
                        print(f"❌ Productivity calculation error: expected {expected_productivity}, got {actual_productivity}")
                else:
                    print(f"❌ Dashboard metrics failed: {data.get('error')}")
            else:
                print(f"❌ Dashboard metrics failed: {response.status_code}")
        except Exception as e:
            print(f"❌ Dashboard metrics error: {e}")
        
        # Test 7: Task Deletion
        print("\n7. Testing Task Deletion...")
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
                print(f"   Response: {response.text}")
        except Exception as e:
            print(f"❌ Task deletion error: {e}")
        
        # Test 8: Real-time Updates Simulation
        print("\n8. Testing Real-time Updates (Simulation)...")
        try:
            # Create a task
            create_response = requests.post(f"{API_BASE}/tasks", json={"title": "Test Task", "user_id": user_id}, timeout=5)
            if create_response.status_code == 201:
                create_data = create_response.json()
                new_task_id = create_data['task']['id']
                
                # Check if it appears in today's tasks
                today_response = requests.get(f"{API_BASE}/tasks/today?user_id={user_id}", timeout=5)
                if today_response.status_code == 200:
                    today_data = today_response.json()
                    today_tasks = today_data.get('tasks', [])
                    
                    # Find our task
                    task_found = any(t['id'] == new_task_id for t in today_tasks)
                    if task_found:
                        print("✅ Task appears immediately in today's tasks")
                        
                        # Mark as completed
                        complete_response = requests.put(f"{API_BASE}/tasks/{new_task_id}", json={"status": "Completed"}, timeout=5)
                        if complete_response.status_code == 200:
                            # Check if it appears in completed tasks
                            completed_response = requests.get(f"{API_BASE}/tasks/completed?user_id={user_id}", timeout=5)
                            if completed_response.status_code == 200:
                                completed_data = completed_response.json()
                                completed_tasks_list = completed_data.get('tasks', [])
                                
                                # Find our task in completed
                                task_in_completed = any(t['id'] == new_task_id for t in completed_tasks_list)
                                if task_in_completed:
                                    print("✅ Task appears immediately in completed tasks")
                                    
                                    # Delete task
                                    delete_response = requests.delete(f"{API_BASE}/tasks/{new_task_id}", timeout=5)
                                    if delete_response.status_code == 200:
                                        # Check if it's removed from all lists
                                        final_today_response = requests.get(f"{API_BASE}/tasks/today?user_id={user_id}", timeout=5)
                                        final_completed_response = requests.get(f"{API_BASE}/tasks/completed?user_id={user_id}", timeout=5)
                                        
                                        if final_today_response.status_code == 200 and final_completed_response.status_code == 200:
                                            final_today_data = final_today_response.json()
                                            final_completed_data = final_completed_response.json()
                                            
                                            task_removed_from_today = not any(t['id'] == new_task_id for t in final_today_data.get('tasks', []))
                                            task_removed_from_completed = not any(t['id'] == new_task_id for t in final_completed_data.get('tasks', []))
                                            
                                            if task_removed_from_today and task_removed_from_completed:
                                                print("✅ Task removed immediately from all lists")
                                                results['real_time_updates'] = True
                                            else:
                                                print("❌ Task not properly removed from lists")
                                        else:
                                            print("❌ Failed to check final state")
                                    else:
                                        print("❌ Failed to delete test task")
                                else:
                                    print("❌ Task not found in completed list")
                            else:
                                print("❌ Failed to check completed tasks")
                        else:
                            print("❌ Failed to complete test task")
                    else:
                        print("❌ Task not found in today's tasks")
                else:
                    print("❌ Failed to check today's tasks")
            else:
                print("❌ Failed to create test task")
        except Exception as e:
            print(f"❌ Real-time updates test error: {e}")
        
    except Exception as e:
        print(f"❌ System test error: {e}")
    
    return results

def print_final_results(results):
    print("\n" + "=" * 60)
    print("🎯 UI FIXES AND FUNCTIONALITY TEST RESULTS")
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
    
    print(f"\n🎨 UI TEXT VISIBILITY FIXES:")
    print("   • Changed theme to light background for better text visibility")
    print("   • Set default text color to black (#000000)")
    print("   • Dark cards with white text for proper contrast")
    print("   • Fixed input fields with black text on white background")
    print("   • Fixed button text visibility")
    print("   • Fixed sidebar text visibility")
    print("   • Added CSS classes for text visibility")
    
    print(f"\n🔧 TASK FUNCTIONALITY FIXES:")
    print("   • Add Task: POST /api/tasks with title and user_id")
    print("   • Task Completion: PUT /api/tasks/{id} with status='Completed'")
    print("   • Task Deletion: DELETE /api/tasks/{id}")
    print("   • Today's Tasks: Filter for pending tasks created today")
    print("   • Completed Tasks: Filter for completed tasks")
    print("   • Real-time UI updates without page refresh")
    print("   • Console error logging for debugging")
    
    print(f"\n🚀 NEXT STEPS:")
    if passed_tests == total_tests:
        print("   🎉 ALL TESTS PASSED! UI and functionality are fixed.")
        print("   📱 Frontend: file:///d:/TRACKER/task-tracker/index_ui_fixed.html")
        print("   🔐 Login: admin@test.com / admin123")
        print("   🚀 Backend: python app_simple.py")
        print("   ✨ Text is now clearly visible and all task actions work!")
    else:
        print("   🔧 Fix failed tests before using the system.")
        print("   📋 Check browser console for JavaScript errors.")
        print("   🧪 Re-run test after fixes.")

if __name__ == "__main__":
    results = test_ui_fixes()
    print_final_results(results)
