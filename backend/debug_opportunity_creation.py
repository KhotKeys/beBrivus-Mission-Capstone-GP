import requests
import json
from datetime import datetime, timedelta

# Debug opportunity creation
BASE_URL = 'http://127.0.0.1:8000'

login_data = {'email': 'admin@bebrivus.com', 'password': 'admin123'}
response = requests.post(f'{BASE_URL}/api/auth/login/', json=login_data)
token = response.json()['access']
headers = {'Authorization': f'Bearer {token}'}

# Get categories
cat_response = requests.get(f'{BASE_URL}/api/admin/categories/', headers=headers)
categories = cat_response.json().get('results', cat_response.json())
scholarship_category = next((cat for cat in categories if cat['name'] == 'Scholarships'), categories[0])

print(f"Using category: {scholarship_category['name']} (ID: {scholarship_category['id']})")

# Create new opportunity
new_opportunity = {
    'title': 'Test Scholarship Program 2025',
    'organization': 'Test University',
    'category': scholarship_category['id'],
    'description': 'A comprehensive test scholarship for outstanding students.',
    'location': 'Online',
    'remote_allowed': True,
    'salary_min': 10000,
    'salary_max': 15000,
    'currency': 'USD',
    'difficulty_level': 'intermediate',
    'status': 'published',
    'application_deadline': (datetime.now() + timedelta(days=90)).isoformat(),
    'external_url': 'https://test-university.edu/scholarships'
}

print("Creating opportunity with data:")
print(json.dumps(new_opportunity, indent=2))

create_response = requests.post(f'{BASE_URL}/api/admin/opportunities/', json=new_opportunity, headers=headers)
print(f"\nResponse Status: {create_response.status_code}")
print(f"Response Text: {create_response.text}")
