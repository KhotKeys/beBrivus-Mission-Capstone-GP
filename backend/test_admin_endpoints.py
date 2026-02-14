#!/usr/bin/env python
"""
Test script for admin API endpoints
Run this after creating an admin user to test the endpoints
"""

import requests
import json
from datetime import datetime

# Base URL for the API
BASE_URL = "http://127.0.0.1:8000/api"

def test_admin_login():
    """Test admin login and get JWT token"""
    url = f"{BASE_URL}/auth/login/"
    data = {
        "email": "admin@bebrivus.com",  # Correct admin email
        "password": "admin123"          # Correct admin password
    }
    
    response = requests.post(url, json=data)
    print(f"Login Response Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print("Login successful!")
        print(f"User type: {result.get('user', {}).get('user_type')}")
        return result.get('access')
    else:
        print(f"Login failed: {response.text}")
        return None

def test_dashboard_stats(token):
    """Test dashboard statistics endpoint"""
    url = f"{BASE_URL}/admin/dashboard/stats/"
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(url, headers=headers)
    print(f"\nDashboard Stats Response Status: {response.status_code}")
    
    if response.status_code == 200:
        stats = response.json()
        print("Dashboard stats retrieved successfully!")
        print(f"Total users: {stats.get('users', {}).get('total', 0)}")
        print(f"Total opportunities: {stats.get('opportunities', {}).get('total', 0)}")
        print(f"Total applications: {stats.get('applications', {}).get('total', 0)}")
    else:
        print(f"Dashboard stats failed: {response.text}")

def test_admin_users(token):
    """Test admin users endpoint"""
    url = f"{BASE_URL}/admin/users/"
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(url, headers=headers)
    print(f"\nAdmin Users Response Status: {response.status_code}")
    
    if response.status_code == 200:
        users = response.json()
        print("Admin users retrieved successfully!")
        print(f"Number of users: {len(users.get('results', []))}")
    else:
        print(f"Admin users failed: {response.text}")

def test_admin_opportunities(token):
    """Test admin opportunities endpoint"""
    url = f"{BASE_URL}/admin/opportunities/"
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(url, headers=headers)
    print(f"\nAdmin Opportunities Response Status: {response.status_code}")
    
    if response.status_code == 200:
        opportunities = response.json()
        print("Admin opportunities retrieved successfully!")
        print(f"Number of opportunities: {len(opportunities.get('results', []))}")
    else:
        print(f"Admin opportunities failed: {response.text}")

def test_recent_activity(token):
    """Test recent activity endpoint"""
    url = f"{BASE_URL}/admin/dashboard/recent-activity/"
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(url, headers=headers)
    print(f"\nRecent Activity Response Status: {response.status_code}")
    
    if response.status_code == 200:
        activity = response.json()
        print("Recent activity retrieved successfully!")
        print(f"Number of activities: {len(activity.get('activities', []))}")
    else:
        print(f"Recent activity failed: {response.text}")

def main():
    print("Testing Admin API Endpoints")
    print("=" * 50)
    
    # Test login first
    token = test_admin_login()
    
    if token:
        # Test other endpoints if login successful
        test_dashboard_stats(token)
        test_admin_users(token)
        test_admin_opportunities(token)
        test_recent_activity(token)
    else:
        print("\nCannot test other endpoints without valid token")
        print("Make sure you have created an admin user with:")
        print("python manage.py create_admin_user")

if __name__ == "__main__":
    main()
