import base64
import os
from django.conf import settings


def get_logo_base64():
    """Get beBrivus logo as base64 for email embedding"""
    try:
        logo_path = os.path.join(settings.BASE_DIR, '..', 'frontend', 'public', 'beBivus.png')
        logo_path = os.path.abspath(logo_path)
        print(f"Loading logo from: {logo_path}")
        print(f"File exists: {os.path.exists(logo_path)}")
        
        with open(logo_path, 'rb') as f:
            logo_data = base64.b64encode(f.read()).decode('utf-8')
        
        print(f"Base64 length: {len(logo_data)}")
        return f"data:image/png;base64,{logo_data}"
    except Exception as e:
        print(f"Logo error: {e}")
        return ""
