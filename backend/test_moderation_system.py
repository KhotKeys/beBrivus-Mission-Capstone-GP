"""
Comprehensive test for the moderation system to ensure everything works
"""
import os
import django
import json
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.ai_services.gemini_service import gemini_service
from apps.ai_services.models import ContentModerationFlag
from apps.forum.moderation_models import FlaggedContent

def test_api_availability():
    """Test if Gemini API is available"""
    print("\n" + "="*60)
    print("TEST 1: API Availability Check")
    print("="*60)
    
    available = gemini_service.is_available()
    api_key = gemini_service.api_key
    client = gemini_service.client
    
    print(f"API Key configured: {bool(api_key)}")
    print(f"API Key value: {api_key[:20]}..." if api_key else "API Key: NOT SET")
    print(f"Client initialized: {bool(client)}")
    print(f"Is Available: {available}")
    
    if available:
        print("\n[PASS] API is properly configured and available!")
        return True
    else:
        print("\n[FAIL] API is NOT available. Moderation will not work.")
        return False

def test_content_moderation():
    """Test the moderation function with safe and unsafe content"""
    print("\n" + "="*60)
    print("TEST 2: Content Moderation")
    print("="*60)
    
    if not gemini_service.is_available():
        print("⚠️  Skipping - API not available")
        return False
    
    test_cases = [
        {
            "name": "Safe content",
            "content": "I really enjoyed working on this project. It was a great learning experience.",
            "should_flag": False
        },
        {
            "name": "Hate speech content",
            "content": "People from [specific group] should not be allowed in professional spaces.",
            "should_flag": True
        },
        {
            "name": "Spam content",
            "content": "CLICK HERE FOR FREE MONEY!!! www.scam-site.com - Make $5000 per day!",
            "should_flag": True
        },
        {
            "name": "Harassment content",
            "content": "You are so stupid and incompetent. Nobody likes you.",
            "should_flag": True
        }
    ]
    
    all_passed = True
    for test_case in test_cases:
        print(f"\nTesting: {test_case['name']}")
        try:
            result = gemini_service.moderate_content(test_case['content'], 'test')
            
            print(f"  Response: {json.dumps(result, indent=2)}")
            
            expected_flag = test_case['should_flag']
            actual_flag = result.get('should_flag', False)
            
            if actual_flag == expected_flag:
                print(f"  [PASS] Correctly detected as {'flagged' if actual_flag else 'safe'}")
            else:
                print(f"  [WARN] Expected {expected_flag}, got {actual_flag}")
                all_passed = False
                
        except Exception as e:
            print(f"  [FAIL] Error: {str(e)}")
            all_passed = False
    
    return all_passed

def test_flag_creation():
    """Test creating a moderation flag in the database"""
    print("\n" + "="*60)
    print("TEST 3: Flag Creation in Database")
    print("="*60)
    
    try:
        # Create a test flag
        flag = ContentModerationFlag.objects.create(
            flagged_user=None,  # System flag, not tied to user
            content_text="Test flagged content for moderation",
            content_type="chat_message",
            content_id=1,
            violation_category="harassment",
            confidence_score=0.85,
            status="pending",
            reason="Test flag creation"
        )
        
        print(f"[PASS] Successfully created ContentModerationFlag with ID: {flag.id}")
        
        # Verify it was created
        retrieved = ContentModerationFlag.objects.get(id=flag.id)
        print(f"[PASS] Successfully retrieved flag: {retrieved.reason}")
        
        return True
        
    except Exception as e:
        print(f"[FAIL] Error creating flag: {str(e)}")
        return False

def test_flagged_content_creation():
    """Test creating FlaggedContent for forum posts"""
    print("\n" + "="*60)
    print("TEST 4: FlaggedContent Creation")
    print("="*60)
    
    try:
        flagged = FlaggedContent.objects.create(
            post_id=999,  # Test post ID
            content="Test flagged forum content",
            author_username="test_user",
            violation_categories=["harassment"],
            ai_confidence=0.82,
            reason="Test flag for forum post",
            status="pending"
        )
        
        print(f"[PASS] Successfully created FlaggedContent with ID: {flagged.id}")
        
        # Verify it was created
        retrieved = FlaggedContent.objects.get(id=flagged.id)
        print(f"[PASS] Successfully retrieved: {retrieved.author_username} - {retrieved.violation_categories}")
        
        return True
        
    except Exception as e:
        print(f"[FAIL] Error creating FlaggedContent: {str(e)}")
        return False

def test_moderation_flag_visibility():
    """Test that flags are visible in the admin queryset"""
    print("\n" + "="*60)
    print("TEST 5: Flag Visibility in Admin")
    print("="*60)
    
    try:
        pending_count = ContentModerationFlag.objects.filter(status="pending").count()
        print(f"Pending ContentModerationFlags: {pending_count}")
        
        flagged_count = FlaggedContent.objects.filter(status="pending").count()
        print(f"Pending FlaggedContent records: {flagged_count}")
        
        if pending_count > 0:
            print("[PASS] Flags are being stored and retrievable for admin view")
        else:
            print("[WARN] No pending flags found (create some first)")
        
        return True
        
    except Exception as e:
        print(f"[FAIL] Error checking flags: {str(e)}")
        return False

def main():
    """Run all tests"""
    print("\n")
    print("=" * 60)
    print("MODERATION SYSTEM COMPREHENSIVE TEST")
    print("=" * 60)
    
    results = {
        "API Availability": test_api_availability(),
        "Content Moderation": test_content_moderation(),
        "Flag Creation": test_flag_creation(),
        "FlaggedContent Creation": test_flagged_content_creation(),
        "Admin Visibility": test_moderation_flag_visibility()
    }
    
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    for test_name, passed in results.items():
        status = "[PASS]" if passed else "[FAIL]"
        print(f"{test_name}: {status}")
    
    all_passed = all(results.values())
    
    if all_passed:
        print("\n[SUCCESS] All tests passed! The moderation system is working!")
    else:
        print("\n[WARN] Some tests failed. Please check the output above.")
    
    print("\nNext steps:")
    print("1. If API tests pass: System is ready")
    print("2. Run seed_moderation_data.py to create test flags")
    print("3. Check Django admin at /admin/ai_services/contentmoderationflag/")
    print("4. Check /admin/forum/flaggedcontent/ for forum flags")

if __name__ == '__main__':
    main()
