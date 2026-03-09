import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

import google.generativeai as genai
from django.conf import settings

api_key = settings.GEMINI_API_KEY
print(f"API Key: {api_key[:20]}...")

genai.configure(api_key=api_key)

print("\nAvailable models:")
for model in genai.list_models():
    if 'generateContent' in model.supported_generation_methods:
        print(f"  - {model.name}")
