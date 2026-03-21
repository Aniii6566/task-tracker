#!/usr/bin/env python3
"""
Comprehensive test to identify the exact issue
"""

import requests
import json
import subprocess
import time

def comprehensive_test():
    print("🔍 COMPREHENSIVE SYSTEM TEST")
    print("=" * 50)
    
    # Test 1: Check what backend is running
    print("\n1. Checking Backend Status...")
    try:
        # Test multiple possible endpoints
        endpoints_to_test = [
            'http://localhost:5000/api/quote',
            'http://localhost:5000/api/auth/login',
            'http://localhost:5000/api/tasks',
            'http://127.0.0.1:5000/api/quote',
            'http://localhost:5000/'
        ]
        
        for endpoint in endpoints_to_test:
            try:
                response = requests.get(endpoint, timeout=2)
                print(f"   ✅ {endpoint}: {response.status_code}")
            except Exception as e:
                print(f"   ❌ {endpoint}: {e}")
                
    except Exception as e:
        print(f"   ❌ Backend test error: {e}")
    
    # Test 2: Test login with detailed response
    print("\n2. Testing Login with Full Details...")
    try:
        login_data = {"email": "admin@test.com", "password": "admin123"}
        response = requests.post('http://localhost:5000/api/auth/login', 
                             json=login_data, timeout=5)
        
        print(f"   Status Code: {response.status_code}")
        print(f"   Status Text: {response.reason}")
        print(f"   Headers: {dict(response.headers)}")
        print(f"   Response Body: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Parsed JSON: {json.dumps(data, indent=2)}")
            
            # Test if token works
            if 'token' in data and 'user' in data:
                print(f"   ✅ Token: {data['token'][:20]}...")
                print(f"   ✅ User: {data['user']['name']} ({data['user']['email']})")
                
                # Test with token
                headers = {'Authorization': f'Bearer {data["token"]}'}
                test_response = requests.get('http://localhost:5000/api/quote', 
                                         headers=headers, timeout=5)
                print(f"   Token Test Status: {test_response.status_code}")
            else:
                print("   ❌ Invalid login response format")
        else:
            print("   ❌ Login failed")
            
    except Exception as e:
        print(f"   ❌ Login test error: {e}")
    
    # Test 3: Check if correct backend file is running
    print("\n3. Checking Backend File...")
    try:
        # Check if app_simple.py exists and is being used
        with open('d:/TRACKER/task-tracker/backend/app_simple.py', 'r') as f:
            content = f.read()
            if 'admin@test.com' in content:
                print("   ✅ app_simple.py contains correct email")
            else:
                print("   ❌ app_simple.py has wrong email")
                
            if 'quote' in content:
                print("   ✅ app_simple.py has quote endpoint")
            else:
                print("   ❌ app_simple.py missing quote endpoint")
                
    except Exception as e:
        print(f"   ❌ File check error: {e}")
    
    # Test 4: Create a simple working frontend test
    print("\n4. Creating Simple Frontend Test...")
    try:
        simple_frontend = '''
<!DOCTYPE html>
<html>
<head>
    <title>Simple Login Test</title>
</head>
<body>
    <h1>Simple Login Test</h1>
    <button onclick="testLogin()">Test Login</button>
    <div id="result"></div>
    
    <script>
        async function testLogin() {
            const result = document.getElementById('result');
            result.innerHTML = 'Testing...';
            
            try {
                const response = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        email: 'admin@test.com',
                        password: 'admin123'
                    })
                });
                
                const data = await response.json();
                
                if (response.ok && data.status === 'success') {
                    result.innerHTML = `
                        <h2>✅ SUCCESS!</h2>
                        <p>User: ${data.user.name}</p>
                        <p>Email: ${data.user.email}</p>
                        <p>Token: ${data.token}</p>
                        <p><a href="index_ui_fixed.html" target="_blank">Open Main App</a></p>
                    `;
                } else {
                    result.innerHTML = `
                        <h2>❌ FAILED!</h2>
                        <p>Error: ${data.error || 'Unknown'}</p>
                        <p>Status: ${response.status}</p>
                    `;
                }
            } catch (error) {
                result.innerHTML = `
                    <h2>❌ ERROR!</h2>
                    <p>${error.message}</p>
                `;
            }
        }
    </script>
</body>
</html>
        '''
        
        with open('d:/TRACKER/task-tracker/simple_test.html', 'w') as f:
            f.write(simple_frontend)
            
        print("   ✅ Created simple_test.html")
        print("   📂 Open: file:///d:/TRACKER/task-tracker/simple_test.html")
        
    except Exception as e:
        print(f"   ❌ Create test error: {e}")
    
    # Test 5: Check processes
    print("\n5. Checking Running Processes...")
    try:
        # Check if python processes are running
        result = subprocess.run(['tasklist', '/FI', 'IMAGENAME eq python.exe'], 
                              capture_output=True, text=True)
        
        if 'python.exe' in result.stdout:
            print("   ✅ Python processes are running")
            print("   📋 Running Python processes:")
            for line in result.stdout.split('\n'):
                if 'python.exe' in line:
                    print(f"      {line.strip()}")
        else:
            print("   ❌ No Python processes found")
            
    except Exception as e:
        print(f"   ❌ Process check error: {e}")
    
    print("\n" + "=" * 50)
    print("🎯 DIAGNOSIS COMPLETE")
    print("=" * 50)
    
    print("\n📋 NEXT STEPS:")
    print("1. If backend tests pass: Issue is in frontend")
    print("2. If backend tests fail: Restart backend")
    print("3. Open simple_test.html to isolate the issue")
    print("4. Check browser console for JavaScript errors")
    print("5. Verify correct frontend file is being used")

if __name__ == "__main__":
    comprehensive_test()
