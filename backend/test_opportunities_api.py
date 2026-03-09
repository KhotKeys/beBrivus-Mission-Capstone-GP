import requests
import json

# Login first
login_data = {'email': 'admin@bebrivus.com', 'password': 'admin123'}
response = requests.post('http://127.0.0.1:8000/api/auth/login/', json=login_data)
if response.status_code == 200:
    token = response.json()['access']
    headers = {'Authorization': f'Bearer {token}'}
    
    # Test opportunities endpoint
    opp_response = requests.get('http://127.0.0.1:8000/api/admin/opportunities/', headers=headers)
    print(f'Opportunities Status: {opp_response.status_code}')
    if opp_response.status_code == 200:
        data = opp_response.json()
        results = data.get('results', [])
        print(f'Found {len(results)} opportunities')
        if results:
            print('First opportunity fields:', list(results[0].keys()))
            first_opp = results[0]
            print(f'Title: {first_opp.get("title")}')
            print(f'Organization: {first_opp.get("organization")}')
            print(f'Category: {first_opp.get("category_name")}')
            print(f'Status: {first_opp.get("status")}')
    else:
        print('Error:', opp_response.text)
else:
    print('Login failed:', response.text)
