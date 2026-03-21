#!/usr/bin/env python3
"""
Test quote endpoint specifically
"""

import requests

try:
    response = requests.get('http://localhost:5000/api/quote')
    print(f"Quote endpoint status: {response.status_code}")
    print(f"Quote response: {response.text}")
    
    # Test with trailing slash
    response = requests.get('http://localhost:5000/api/quote/')
    print(f"Quote endpoint with slash status: {response.status_code}")
    print(f"Quote response with slash: {response.text}")
    
except Exception as e:
    print(f"Error: {e}")
