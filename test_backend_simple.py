#!/usr/bin/env python3
"""
Simple backend test
"""

import requests

try:
    response = requests.get('http://localhost:5000/api/health', timeout=5)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
