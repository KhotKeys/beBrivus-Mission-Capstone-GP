import requests
import json

# Login first
login_data = {'email': 'admin@bebrivus.com', 'password': 'admin123'}
response = requests.post('http://127.0.0.1:8000/api/auth/login/', json=login_data)
if response.status_code == 200:
    token = response.json()['access']
    headers = {'Authorization': f'Bearer {token}'}
    
    # Test categories endpoint
    cat_response = requests.get('http://127.0.0.1:8000/api/admin/categories/', headers=headers)
    print(f'Categories Status: {cat_response.status_code}')
    if cat_response.status_code == 200:
        data = cat_response.json()
        results = data.get('results', data) if isinstance(data, dict) else data
        print(f'Found {len(results)} categories')
        for cat in results:
            print(f'- {cat.get("name")}: {cat.get("description")}')
    else:
        print('Error:', cat_response.text)
else:
    print('Login failed:', response.text)
