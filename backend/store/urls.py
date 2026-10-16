from django.urls import path
from .views import (
    WebsiteSettingView, HomepageBannerListView, BrandListView, BrandDetailView,
    CategoryListView, CollectionListView, CollectionDetailView,
    ProductListView, ProductDetailView, CartValidateView,
    CreateOrderView, OrderDetailView, ContactEnquiryView
)

urlpatterns = [
    path('settings/', WebsiteSettingView.as_view(), name='api-settings'),
    path('banners/', HomepageBannerListView.as_view(), name='api-banners'),
    path('brands/', BrandListView.as_view(), name='api-brands'),
    path('brands/<slug:slug>/', BrandDetailView.as_view(), name='api-brand-detail'),
    path('categories/', CategoryListView.as_view(), name='api-categories'),
    path('collections/', CollectionListView.as_view(), name='api-collections'),
    path('collections/<slug:slug>/', CollectionDetailView.as_view(), name='api-collection-detail'),
    path('products/', ProductListView.as_view(), name='api-products'),
    path('products/<slug:slug>/', ProductDetailView.as_view(), name='api-product-detail'),
    path('cart/validate/', CartValidateView.as_view(), name='api-cart-validate'),
    path('orders/create/', CreateOrderView.as_view(), name='api-order-create'),
    path('orders/<str:reference>/', OrderDetailView.as_view(), name='api-order-detail'),
    path('contact/', ContactEnquiryView.as_view(), name='api-contact'),
]
