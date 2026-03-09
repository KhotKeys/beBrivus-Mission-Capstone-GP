"""
Script to list available Gemini models
"""
import os
import google.generativeai as genai
from decouple import config

# Load API key
api_key = config('GEMINI_API_KEY', default='')

if not api_key:
    print("ERROR: GEMINI_API_KEY not found in .env file")
    exit(1)

# Configure API
genai.configure(api_key=api_key)

print("Available Gemini models:\n")
print("-" * 80)

try:
    models = genai.list_models()
    for model in models:
        if 'generateContent' in model.supported_generation_methods:
            print(f"Model: {model.name}")
            print(f"  Display Name: {model.display_name}")
            print(f"  Description: {model.description}")
            print(f"  Supported Methods: {model.supported_generation_methods}")
            print("-" * 80)
except Exception as e:
    print(f"Error listing models: {e}")
