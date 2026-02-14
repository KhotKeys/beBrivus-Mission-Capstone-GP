"""
Test if the Gemini API key is valid and working
"""
import os
import google.generativeai as genai
from decouple import config

# Load API key
api_key = config('GEMINI_API_KEY', default='')

if not api_key:
    print("❌ ERROR: GEMINI_API_KEY not found in .env file")
    exit(1)

print(f"✓ API Key found: {api_key[:20]}...{api_key[-4:]}")
print("\nTesting API key...")
print("-" * 80)

try:
    # Configure API
    genai.configure(api_key=api_key)
    
    # Try to create a model
    model = genai.GenerativeModel('gemini-2.0-flash')
    print("✓ Model created successfully")
    
    # Try a simple generation
    print("\nSending test prompt...")
    response = model.generate_content("Say 'Hello, the API key works!'")
    print(f"✓ Response received: {response.text}")
    
    print("\n" + "="*80)
    print("✅ SUCCESS! Your API key is valid and working!")
    print("="*80)
    
except Exception as e:
    print(f"\n❌ ERROR: {str(e)}")
    print("\nPossible issues:")
    print("1. API key is invalid or has been restricted")
    print("2. You've exceeded the free tier quota")
    print("3. The API key doesn't have proper permissions")
    print("4. Billing is not set up correctly")
    print("\nCheck: https://aistudio.google.com/app/apikey")
