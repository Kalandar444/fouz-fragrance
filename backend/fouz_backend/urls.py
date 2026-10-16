"""
URL configuration for fouz_backend project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# Customize Django Admin Header and Title for Fouz Fragrance
admin.site.site_header = "✨ Fouz Fragrance — Administration ✨"
admin.site.site_title = "Fouz Fragrance Admin"
admin.site.index_title = "Luxury Store & Operations Management"

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('store.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
