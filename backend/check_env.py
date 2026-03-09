with open('.env', 'r') as f:
    for line in f:
        if any(k in line for k in ['EMAIL_HOST_USER','EMAIL_HOST_PASSWORD','DEFAULT_FROM','GEMINI']):
            print(repr(line.strip()))
