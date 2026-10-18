#!/usr/bin/env python
"""
Root seed_data.py proxy for Render.
Runs the backend seed script safely and exits with 0.
"""
import os
import sys
from pathlib import Path

if __name__ == '__main__':
    backend_dir = Path(__file__).resolve().parent / 'backend'
    backend_seed = backend_dir / 'seed_data.py'
    
    if backend_seed.exists():
        sys.path.insert(0, str(backend_dir))
        os.chdir(backend_dir)
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fouz_backend.settings')
        try:
            import django
            django.setup()
            # Run the seed script
            with open(backend_seed, 'r', encoding='utf-8') as f:
                code = f.read()
            exec(code, {'__name__': '__main__', '__file__': str(backend_seed)})
            print("Database seeded successfully via root proxy.")
        except Exception as e:
            print(f"Warning during seed execution: {e}")
            # Never fail the build because of seed warnings
            sys.exit(0)
    else:
        print("No backend/seed_data.py found, skipping.")
        sys.exit(0)
