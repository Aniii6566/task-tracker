#!/usr/bin/env python3
"""
Test backend connection
"""

import requests

try:
    # Test root endpoint
    response = requests.get('http://localhost:5000/', timeout=5)
    print(f"Root endpoint status: {response.status_code}")
    print(f"Root response: {response.text[:200]}...")
    
    # Test login endpoint
    response = requests.post('http://localhost:5000/api/auth/login', 
                          json={"email": "admin@test.com", "password": "admin123"}, 
                          timeout=5)
    print(f"Login endpoint status: {response.status_code}")
    print(f"Login response: {response.text}")
    
except Exception as e:
    print(f"Error: {e}")
