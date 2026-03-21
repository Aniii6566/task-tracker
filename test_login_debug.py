#!/usr/bin/env python3
"""
Debug login issue
"""

import requests
import json

# Test different login endpoints and formats
API_BASE = "http://localhost:5000/api"

def test_login_debug():
    print("🔍 DEBUGGING LOGIN ISSUE")
    print("=" * 40)
    
    # Test 1: Check if backend is running
    print("\n1. Testing backend connection...")
    try:
        response = requests.get('http://localhost:5000/', timeout=5)
        print(f"Backend status: {response.status_code}")
    except Exception as e:
        print(f"Backend connection error: {e}")
        return
    
    # Test 2: Check login endpoint exists
    print("\n2. Testing login endpoint...")
    try:
        response = requests.options(f"{API_BASE}/auth/login", timeout=5)
        print(f"Login endpoint OPTIONS: {response.status_code}")
    except Exception as e:
        print(f"Login endpoint error: {e}")
    
    # Test 3: Try login with different formats
    print("\n3. Testing login with admin@test.com...")
    try:
        login_data = {"email": "admin@test.com", "password": "admin123"}
        response = requests.post(f"{API_BASE}/auth/login", json=login_data, timeout=5)
        print(f"Login status: {response.status_code}")
        print(f"Login response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Login successful!")
            print(f"User: {data.get('user', {}).get('name', 'Unknown')}")
            return True
        else:
            print(f"❌ Login failed with status {response.status_code}")
            
    except Exception as e:
        print(f"Login request error: {e}")
    
    # Test 4: Try login with original credentials
    print("\n4. Testing login with admin@tasktracker.com...")
    try:
        login_data = {"email": "admin@tasktracker.com", "password": "admin123"}
        response = requests.post(f"{API_BASE}/auth/login", json=login_data, timeout=5)
        print(f"Login status: {response.status_code}")
        print(f"Login response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Login successful!")
            print(f"User: {data.get('user', {}).get('name', 'Unknown')}")
            return True
        else:
            print(f"❌ Login failed with status {response.status_code}")
            
    except Exception as e:
        print(f"Login request error: {e}")
    
    # Test 5: Check what users exist in database
    print("\n5. Checking database users...")
    try:
        # This is a test to see if we can access any endpoint
        response = requests.get(f"{API_BASE}/quote", timeout=5)
        print(f"Quote endpoint status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Backend is responding to API calls")
        else:
            print("❌ Backend API is not responding correctly")
            
    except Exception as e:
        print(f"Database check error: {e}")
    
    return False

if __name__ == "__main__":
    success = test_login_debug()
    
    if not success:
        print("\n" + "=" * 40)
        print("🔧 LOGIN ISSUE DIAGNOSIS")
        print("=" * 40)
        print("Possible issues:")
        print("1. Backend is not running on port 5000")
        print("2. Wrong login credentials")
        print("3. Database user not created")
        print("4. Backend endpoint not working")
        print("5. Frontend using wrong API URL")
        
        print("\n🚀 SOLUTIONS:")
        print("1. Start backend: python app_simple.py")
        print("2. Use correct credentials: admin@test.com / admin123")
        print("3. Check browser console for JavaScript errors")
        print("4. Verify API_BASE URL in frontend")
        print("5. Clear browser cache and reload")
    else:
        print("\n✅ Login is working!")
