#!/usr/bin/env python
"""
Root manage.py proxy for Render and cloud deployments.
Seamlessly routes commands to backend/
"""
import os
import sys
from pathlib import Path

if __name__ == '__main__':
    current_dir = Path(__file__).resolve().parent
    backend_dir = current_dir / 'backend'
    
    # Add backend directory to sys.path so fouz_backend and store can be imported
    if str(backend_dir) not in sys.path:
        sys.path.insert(0, str(backend_dir))
    
    os.chdir(backend_dir)
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fouz_backend.settings')
    
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable?"
        ) from exc
    execute_from_command_line(sys.argv)
