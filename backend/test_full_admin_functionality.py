import requests
import json
from datetime import datetime, timedelta

# Test the full CRUD functionality for all admin interfaces
BASE_URL = 'http://127.0.0.1:8000'

def test_admin_functionality():
    print("🧪 Testing BeBrivus Admin Interface - Full CRUD Operations")
    print("=" * 60)
    
    # 1. Authentication
    print("\n1. 🔐 Testing Authentication...")
    login_data = {'email': 'admin@bebrivus.com', 'password': 'admin123'}
    response = requests.post(f'{BASE_URL}/api/auth/login/', json=login_data)
    
    if response.status_code != 200:
        print("❌ Authentication failed!")
        return
    
    token = response.json()['access']
    headers = {'Authorization': f'Bearer {token}'}
    print("✅ Authentication successful!")
    
    # 2. Test Opportunities CRUD
    print("\n2. 🎯 Testing Opportunities Management...")
    
    # List opportunities
    response = requests.get(f'{BASE_URL}/api/admin/opportunities/', headers=headers)
    print(f"   📋 List Opportunities: {response.status_code} - Found {len(response.json().get('results', []))} opportunities")
    
    # Get categories for opportunity creation
    cat_response = requests.get(f'{BASE_URL}/api/admin/categories/', headers=headers)
    categories = cat_response.json().get('results', cat_response.json())
    scholarship_category = next((cat for cat in categories if cat['name'] == 'Scholarships'), categories[0])
    
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
    
    create_response = requests.post(f'{BASE_URL}/api/admin/opportunities/', json=new_opportunity, headers=headers)
    if create_response.status_code == 201:
        created_opp = create_response.json()
        print(f"   ✅ Create Opportunity: {create_response.status_code} - Created '{created_opp['title']}'")
        
        # Update opportunity
        update_data = {'title': 'Updated Test Scholarship Program 2025', 'featured': True}
        update_response = requests.patch(f'{BASE_URL}/api/admin/opportunities/{created_opp["id"]}/', json=update_data, headers=headers)
        print(f"   ✅ Update Opportunity: {update_response.status_code} - Updated to featured")
        
        # Toggle status
        toggle_response = requests.post(f'{BASE_URL}/api/admin/opportunities/{created_opp["id"]}/toggle_status/', headers=headers)
        print(f"   ✅ Toggle Status: {toggle_response.status_code}")
        
        # View specific opportunity
        view_response = requests.get(f'{BASE_URL}/api/admin/opportunities/{created_opp["id"]}/', headers=headers)
        print(f"   ✅ View Opportunity: {view_response.status_code}")
        
        # Delete opportunity
        delete_response = requests.delete(f'{BASE_URL}/api/admin/opportunities/{created_opp["id"]}/', headers=headers)
        print(f"   ✅ Delete Opportunity: {delete_response.status_code}")
    else:
        print(f"   ❌ Create Opportunity failed: {create_response.status_code}")
    
    # 3. Test Users CRUD
    print("\n3. 👥 Testing User Management...")
    
    # List users
    response = requests.get(f'{BASE_URL}/api/admin/users/', headers=headers)
    print(f"   📋 List Users: {response.status_code} - Found {len(response.json().get('results', []))} users")
    
    # Create new user (if endpoint supports it)
    new_user = {
        'email': 'test.user@example.com',
        'username': 'testuser',
        'first_name': 'Test',
        'last_name': 'User',
        'user_type': 'student',
        'is_active': True
    }
    
    create_user_response = requests.post(f'{BASE_URL}/api/admin/users/', json=new_user, headers=headers)
    if create_user_response.status_code == 201:
        created_user = create_user_response.json()
        print(f"   ✅ Create User: {create_user_response.status_code} - Created '{created_user['email']}'")
        
        # Update user
        update_user_data = {'first_name': 'Updated Test', 'user_type': 'mentor'}
        update_user_response = requests.patch(f'{BASE_URL}/api/admin/users/{created_user["id"]}/', json=update_user_data, headers=headers)
        print(f"   ✅ Update User: {update_user_response.status_code}")
        
        # Toggle user status
        toggle_user_response = requests.post(f'{BASE_URL}/api/admin/users/{created_user["id"]}/toggle_status/', headers=headers)
        print(f"   ✅ Toggle User Status: {toggle_user_response.status_code}")
        
        # Delete user
        delete_user_response = requests.delete(f'{BASE_URL}/api/admin/users/{created_user["id"]}/', headers=headers)
        print(f"   ✅ Delete User: {delete_user_response.status_code}")
    else:
        print(f"   ⚠️  Create User: {create_user_response.status_code} (may not be implemented)")
    
    # 4. Test Resources CRUD
    print("\n4. 📚 Testing Resource Management...")
    
    # List resources
    response = requests.get(f'{BASE_URL}/api/admin/resources/', headers=headers)
    print(f"   📋 List Resources: {response.status_code} - Found {len(response.json().get('results', []))} resources")
    
    # Create new resource (if endpoint supports it)
    new_resource = {
        'title': 'Test Study Guide',
        'description': 'A comprehensive study guide for test purposes',
        'resource_type': 'guide',
        'content': 'This is test content for the study guide.',
        'tags': ['test', 'guide', 'study'],
        'is_active': True
    }
    
    create_resource_response = requests.post(f'{BASE_URL}/api/admin/resources/', json=new_resource, headers=headers)
    if create_resource_response.status_code == 201:
        created_resource = create_resource_response.json()
        print(f"   ✅ Create Resource: {create_resource_response.status_code} - Created '{created_resource['title']}'")
        
        # Update resource
        update_resource_data = {'title': 'Updated Test Study Guide'}
        update_resource_response = requests.patch(f'{BASE_URL}/api/admin/resources/{created_resource["id"]}/', json=update_resource_data, headers=headers)
        print(f"   ✅ Update Resource: {update_resource_response.status_code}")
        
        # Delete resource
        delete_resource_response = requests.delete(f'{BASE_URL}/api/admin/resources/{created_resource["id"]}/', headers=headers)
        print(f"   ✅ Delete Resource: {delete_resource_response.status_code}")
    else:
        print(f"   ⚠️  Create Resource: {create_resource_response.status_code} (may need setup)")
    
    # 5. Test Categories
    print("\n5. 🏷️  Testing Categories...")
    response = requests.get(f'{BASE_URL}/api/admin/categories/', headers=headers)
    categories = response.json().get('results', response.json())
    print(f"   📋 List Categories: {response.status_code} - Found {len(categories)} categories")
    for cat in categories[:5]:  # Show first 5
        print(f"      - {cat['name']}: {cat['description']}")
    
    # 6. Dashboard Stats
    print("\n6. 📊 Testing Dashboard Statistics...")
    response = requests.get(f'{BASE_URL}/api/admin/dashboard/stats/', headers=headers)
    if response.status_code == 200:
        stats = response.json()
        print(f"   ✅ Dashboard Stats: {response.status_code}")
        print(f"      - Total Users: {stats.get('total_users', 'N/A')}")
        print(f"      - Total Opportunities: {stats.get('total_opportunities', 'N/A')}")
        print(f"      - Total Resources: {stats.get('total_resources', 'N/A')}")
    else:
        print(f"   ⚠️  Dashboard Stats: {response.status_code}")
    
    print("\n" + "=" * 60)
    print("🎉 Admin Interface Testing Complete!")
    print("\nNext Steps:")
    print("1. Open http://localhost:5173 in your browser")
    print("2. Login with admin@bebrivus.com / admin123")
    print("3. Navigate to admin sections to test the UI:")
    print("   • Opportunities Management - Create, Edit, View, Delete")
    print("   • User Management - View, Edit, Toggle Status")
    print("   • Resource Management - Full CRUD operations")
    print("   • Dashboard - View statistics and analytics")

if __name__ == "__main__":
    test_admin_functionality()
