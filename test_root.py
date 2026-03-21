#!/usr/bin/env python3
"""
Test root endpoint
"""

import requests

try:
    response = requests.get('http://localhost:5000/', timeout=5)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
