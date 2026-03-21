#!/usr/bin/env python3
"""
Test individual endpoints
"""

import requests

try:
    # Test login
    response = requests.post('http://localhost:5000/api/auth/login', 
                          json={"email": "admin@test.com", "password": "admin123"})
    print(f"Login status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        user_id = data['user']['id']
        print(f"Login successful, user_id: {user_id}")
        
        # Test quote endpoint
        response = requests.get('http://localhost:5000/api/quote')
        print(f"Quote status: {response.status_code}")
        print(f"Quote response: {response.text}")
        
        # Test task creation
        response = requests.post('http://localhost:5000/api/tasks', 
                              json={"title": "Test Task", "user_id": user_id})
        print(f"Task creation status: {response.status_code}")
        print(f"Task creation response: {response.text}")
        
    else:
        print(f"Login failed: {response.text}")
        
except Exception as e:
    print(f"Error: {e}")
