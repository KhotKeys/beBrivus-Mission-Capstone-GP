"""
Test script for Institution Application Updates
Run this after starting the Django server to verify the fix
"""

import requests
import json

BASE_URL = "http://localhost:8001/api"

def test_institution_application_update():
    """Test the institution application update endpoint"""
    
    print("=" * 60)
    print("Testing Institution Application Update")
    print("=" * 60)
    
    # Step 1: Login as institution user
    print("\n1. Logging in as institution user...")
    login_data = {
        "email": "institution@test.com",  # Replace with actual institution email
        "password": "testpass123"  # Replace with actual password
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
        if response.status_code == 200:
            token = response.json().get('access')
            print("✅ Login successful")
            headers = {"Authorization": f"Bearer {token}"}
        else:
            print(f"❌ Login failed: {response.status_code}")
            print(response.text)
            return
    except Exception as e:
        print(f"❌ Login error: {str(e)}")
        return
    
    # Step 2: Get applications for institution's opportunities
    print("\n2. Fetching applications...")
    try:
        response = requests.get(
            f"{BASE_URL}/applications/my_opportunities/",
            headers=headers
        )
        if response.status_code == 200:
            applications = response.json()
            print(f"✅ Found {len(applications)} applications")
            if applications:
                app_id = applications[0]['id']
                print(f"   Testing with application ID: {app_id}")
            else:
                print("⚠️  No applications found to test")
                return
        else:
            print(f"❌ Failed to fetch applications: {response.status_code}")
            print(response.text)
            return
    except Exception as e:
        print(f"❌ Fetch error: {str(e)}")
        return
    
    # Step 3: Update application status
    print("\n3. Updating application status...")
    update_data = {
        "status": "under_review",
        "notes": "Thank you for your application. We are reviewing it."
    }
    
    try:
        response = requests.patch(
            f"{BASE_URL}/applications/{app_id}/",
            headers=headers,
            json=update_data
        )
        if response.status_code == 200:
            print("✅ Application updated successfully")
            result = response.json()
            print(f"   New status: {result.get('status')}")
            print(f"   Feedback: {result.get('notes', 'N/A')}")
        else:
            print(f"❌ Update failed: {response.status_code}")
            print(response.text)
            return
    except Exception as e:
        print(f"❌ Update error: {str(e)}")
        return
    
    # Step 4: Verify update
    print("\n4. Verifying update...")
    try:
        response = requests.get(
            f"{BASE_URL}/applications/{app_id}/",
            headers=headers
        )
        if response.status_code == 200:
            app = response.json()
            if app['status'] == 'under_review':
                print("✅ Status verified: under_review")
            else:
                print(f"⚠️  Status mismatch: {app['status']}")
            
            if app.get('notes'):
                print(f"✅ Feedback saved: {app['notes'][:50]}...")
            else:
                print("⚠️  Feedback not saved")
        else:
            print(f"❌ Verification failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Verification error: {str(e)}")
    
    print("\n" + "=" * 60)
    print("Test Complete")
    print("=" * 60)


if __name__ == "__main__":
    print("\n🧪 beBrivus Institution Application Update Test\n")
    test_institution_application_update()
