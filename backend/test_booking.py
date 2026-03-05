"""
Test booking endpoint
"""
import requests
import json

BASE_URL = "http://localhost:8001/api"

# Login first
login_data = {
    "email": "aluel@gmail.com",  # Replace with actual student email
    "password": "testpass123"
}

response = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
if response.status_code == 200:
    token = response.json().get('access')
    headers = {"Authorization": f"Bearer {token}"}
    
    # Try booking
    booking_data = {
        "session_date": "2026-02-20",
        "start_time": "09:00",
        "duration": 60,
        "session_type": "career_guidance",
        "notes": "Test booking"
    }
    
    print("Booking data:", json.dumps(booking_data, indent=2))
    
    response = requests.post(
        f"{BASE_URL}/mentors/17/book/",
        headers=headers,
        json=booking_data
    )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
else:
    print(f"Login failed: {response.status_code}")
    print(response.text)
