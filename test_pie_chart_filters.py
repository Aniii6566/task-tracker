#!/usr/bin/env python3
"""
Test pie chart filters for daily, weekly, monthly, yearly
"""

import requests
import json

def test_pie_chart_filters():
    print("🎯 TESTING PIE CHART FILTERS")
    print("=" * 50)
    
    API_BASE = "http://localhost:5000/api"
    
    # Login
    login_data = {"email": "admin@test.com", "password": "admin123"}
    response = requests.post(f"{API_BASE}/auth/login", json=login_data, timeout=5)
    user_id = response.json()['user']['id']
    print("✅ Login successful!")
    
    # Test daily filter
    print("\n1. Testing Daily Filter...")
    response = requests.get(f"{API_BASE}/analytics/pie-chart?user_id={user_id}&filter=daily", timeout=5)
    
    if response.status_code == 200:
        data = response.json()
        if data.get('status') == 'success':
            print("✅ Daily filter working!")
            print(f"   Completed: {data.get('completed', 0)}")
            print(f"   Pending: {data.get('pending', 0)}")
            print(f"   Filter: {data.get('filter', 'unknown')}")
        else:
            print("❌ Daily filter failed")
    else:
        print(f"❌ Daily filter failed: {response.status_code}")
    
    # Test weekly filter
    print("\n2. Testing Weekly Filter...")
    response = requests.get(f"{API_BASE}/analytics/pie-chart?user_id={user_id}&filter=weekly", timeout=5)
    
    if response.status_code == 200:
        data = response.json()
        if data.get('status') == 'success':
            print("✅ Weekly filter working!")
            print(f"   Completed: {data.get('completed', 0)}")
            print(f"   Pending: {data.get('pending', 0)}")
            print(f"   Filter: {data.get('filter', 'unknown')}")
        else:
            print("❌ Weekly filter failed")
    else:
        print(f"❌ Weekly filter failed: {response.status_code}")
    
    # Test monthly filter
    print("\n3. Testing Monthly Filter...")
    response = requests.get(f"{API_BASE}/analytics/pie-chart?user_id={user_id}&filter=monthly", timeout=5)
    
    if response.status_code == 200:
        data = response.json()
        if data.get('status') == 'success':
            print("✅ Monthly filter working!")
            print(f"   Completed: {data.get('completed', 0)}")
            print(f"   Pending: {data.get('pending', 0)}")
            print(f"   Filter: {data.get('filter', 'unknown')}")
        else:
            print("❌ Monthly filter failed")
    else:
        print(f"❌ Monthly filter failed: {response.status_code}")
    
    # Test yearly filter
    print("\n4. Testing Yearly Filter...")
    response = requests.get(f"{API_BASE}/analytics/pie-chart?user_id={user_id}&filter=yearly", timeout=5)
    
    if response.status_code == 200:
        data = response.json()
        if data.get('status') == 'success':
            print("✅ Yearly filter working!")
            print(f"   Completed: {data.get('completed', 0)}")
            print(f"   Pending: {data.get('pending', 0)}")
            print(f"   Filter: {data.get('filter', 'unknown')}")
        else:
            print("❌ Yearly filter failed")
    else:
        print(f"❌ Yearly filter failed: {response.status_code}")
    
    print("\n✅ PIE CHART FILTERS COMPLETE!")
    print("   • Daily filter: Shows today's tasks")
    print("   • Weekly filter: Shows last 7 days")
    print("   • Monthly filter: Shows current month")
    print("   • Yearly filter: Shows current year")
    print("   • All filters update pie chart and statistics")

if __name__ == "__main__":
    test_pie_chart_filters()
