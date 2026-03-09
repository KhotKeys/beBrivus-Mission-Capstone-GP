import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

import google.generativeai as genai
from django.conf import settings
import json

# Test AI moderation with the exact content
api_key = settings.GEMINI_API_KEY
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.0-flash')

test_content = "I want to scam my facilitator tomorrow"

prompt = f"""You are a content moderator for beBrivus, an African student platform.

Analyze this forum post for violations:
Title: This is unacceptable
Content: {test_content}

Check for: hate speech, harassment, spam, threats, inappropriate content, discrimination, scams.

Respond ONLY with valid JSON — no markdown, no backticks:
{{"violation": true, "severity": "high", "reason": "explanation", "type": "spam"}}
OR
{{"violation": false, "severity": "none", "reason": null, "type": "none"}}"""

print("Testing AI moderation...")
print(f"Content: {test_content}\n")

response = model.generate_content(prompt)
text = response.text.strip()
text = text.replace('```json', '').replace('```', '').strip()

print(f"AI Response: {text}\n")

result = json.loads(text)
print(f"Parsed Result:")
print(f"  Violation: {result.get('violation')}")
print(f"  Severity: {result.get('severity')}")
print(f"  Type: {result.get('type')}")
print(f"  Reason: {result.get('reason')}")

if result.get('violation') and result.get('severity') in ['medium', 'high']:
    print("\n✅ This content SHOULD be flagged by AI")
else:
    print("\n❌ This content will NOT be flagged by AI")
