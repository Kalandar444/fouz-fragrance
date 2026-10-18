"""
Django settings for fouz_backend project.
Fouz Fragrance - UAE Luxury Perfumes
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables
load_dotenv(BASE_DIR / '.env')

# Security settings
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-s3&ojk&r$6#wb^0l*v7cwvmi72ff#=aqbr1c2(9!8yl9me$mgu')
DEBUG = os.getenv('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = [host.strip() for host in os.getenv('ALLOWED_HOSTS', '*').split(',') if host.strip()]

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party apps
    'corsheaders',
    'rest_framework',

    # Local apps
    'store',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'fouz_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.media',
            ],
        },
    },
]

WSGI_APPLICATION = 'fouz_backend.wsgi.application'

# Database configuration: defaults to SQLite; uses PostgreSQL if DB_ENGINE or DB_NAME is set to postgres
DB_ENGINE = os.getenv('DB_ENGINE', 'django.db.backends.sqlite3')
if 'postgresql' in DB_ENGINE:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME', 'fouz_db'),
            'USER': os.getenv('DB_USER', 'postgres'),
            'PASSWORD': os.getenv('DB_PASSWORD', ''),
            'HOST': os.getenv('DB_HOST', 'localhost'),
            'PORT': os.getenv('DB_PORT', '5432'),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Dubai'
USE_I18N = True
USE_TZ = True

# Static & Media Files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS & CSRF Configuration
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = [
    'https://fouz-fragrance-backend.onrender.com',
    'https://fouzfragrance.co.in',
    'https://www.fouzfragrance.co.in',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:8000',
]

# Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 24,
    'DEFAULT_THROTTLE_CLASSES': [] if DEBUG else [
        'rest_framework.throttling.AnonRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '10000/minute',
    }
}

# Email Configuration (SMTP)
# Default to Port 465 with SSL for high reliability and zero connection drops on cloud/Render
EMAIL_BACKEND = os.getenv('EMAIL_BACKEND', 'django.core.mail.backends.smtp.EmailBackend')
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', 465))
EMAIL_USE_SSL = os.getenv('EMAIL_USE_SSL', 'True').lower() in ('true', '1', 't', 'yes')
EMAIL_USE_TLS = False if EMAIL_USE_SSL else (os.getenv('EMAIL_USE_TLS', 'False').lower() in ('true', '1', 't', 'yes'))

EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', 'fouzfragrance02@gmail.com').strip()
# Strip spaces so 16-character Google App Passwords formatted as "xxxx xxxx xxxx xxxx" work seamlessly
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', 'mqybgujrtqbeshty').replace(' ', '').strip()
EMAIL_TIMEOUT = int(os.getenv('EMAIL_TIMEOUT', 15))

BUSINESS_CONTACT_EMAIL = os.getenv('BUSINESS_CONTACT_EMAIL', 'fouzfragrance02@gmail.com').strip()

DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'Fouz Fragrance <fouzfragrance02@gmail.com>').strip()
RESEND_API_KEY = os.getenv('RESEND_API_KEY', '').strip()
BREVO_API_KEY = os.getenv('BREVO_API_KEY', '').strip()


