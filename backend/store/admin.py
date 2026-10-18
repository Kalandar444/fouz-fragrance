from django.contrib import admin, messages
from django.utils.html import format_html
from .models import (
    WebsiteSetting, HomepageBanner, Brand, Category, Collection,
    Product, ProductImage, ProductVariant, CollectionProduct,
    Order, OrderItem, ContactEnquiry
)
from .emails import send_order_notifications, send_test_email


@admin.register(WebsiteSetting)
class WebsiteSettingAdmin(admin.ModelAdmin):
    fieldsets = (
        ("Business Information", {
            'fields': ('business_name', 'tagline', 'location', 'phone', 'whatsapp', 'email', 'address', 'instagram_url')
        }),
        ("Storefront & Currency", {
            'fields': ('currency', 'free_shipping_threshold', 'standard_shipping_fee')
        }),
        ("Announcement Bar", {
            'fields': ('announcement_active', 'announcement_text')
        }),
        ("Branding Assets", {
            'fields': ('logo', 'logo_preview')
        }),
        ("Homepage Hero Banner", {
            'fields': ('hero_title', 'hero_subtitle', 'hero_button_text', 'hero_button_link', 'hero_image', 'hero_image_url')
        }),
    )
    readonly_fields = ('logo_preview',)

    def logo_preview(self, obj):
        if obj.logo:
            return format_html('<img src="{}" style="max-height: 80px; background: #eee; padding: 4px; border-radius: 4px;" />', obj.logo.url)
        return "No logo uploaded"
    logo_preview.short_description = "Current Logo"

    def has_add_permission(self, request):
        # Disallow adding more than one settings instance
        return not WebsiteSetting.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False

    actions = ['send_test_notification_email']

    @admin.action(description="Send Test Email to fouzfragranceae@gmail.com")
    def send_test_notification_email(self, request, queryset):
        res = send_test_email()
        if res['success']:
            self.message_user(request, f"Test email sent successfully to {res['recipient']}!", level=messages.SUCCESS)
        else:
            self.message_user(request, f"Test email failed: {res['message']}", level=messages.ERROR)


@admin.register(HomepageBanner)
class HomepageBannerAdmin(admin.ModelAdmin):
    list_display = ('title', 'button_text', 'button_link', 'sort_order', 'is_active', 'banner_preview')
    list_editable = ('sort_order', 'is_active')
    search_fields = ('title', 'subtitle')

    def banner_preview(self, obj):
        url = obj.get_image_url
        if url:
            return format_html('<img src="{}" style="max-height: 40px; border-radius: 3px;" />', url)
        return "No Image"
    banner_preview.short_description = "Preview"


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ('name', 'origin_country', 'founded_year', 'is_featured', 'logo_preview', 'banner_preview', 'products_count')
    list_filter = ('is_featured', 'origin_country')
    search_fields = ('name', 'description', 'history', 'fragrance_style')
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('logo_preview', 'banner_preview', 'products_count')

    fieldsets = (
        ("Basic Information", {
            'fields': ('name', 'slug', 'is_featured')
        }),
        ("Heritage & Story", {
            'fields': ('origin_country', 'founded_year', 'fragrance_style', 'description', 'history', 'specialties')
        }),
        ("Brand Logo", {
            'fields': ('logo', 'image_url', 'logo_preview')
        }),
        ("Brand Hero Banner", {
            'fields': ('banner_image', 'banner_image_url', 'banner_preview')
        }),
    )

    def logo_preview(self, obj):
        url = obj.get_logo_url
        if url:
            return format_html('<img src="{}" style="max-height: 35px; border-radius: 3px;" />', url)
        return "-"
    logo_preview.short_description = "Logo"

    def banner_preview(self, obj):
        url = obj.get_banner_url
        if url:
            return format_html('<img src="{}" style="max-height: 40px; border-radius: 3px;" />', url)
        return "-"
    banner_preview.short_description = "Banner"

    def products_count(self, obj):
        return obj.products.count()
    products_count.short_description = "Products"


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'image_preview', 'products_count')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}

    def image_preview(self, obj):
        url = obj.get_image_url
        if url:
            return format_html('<img src="{}" style="max-height: 35px; border-radius: 3px;" />', url)
        return "-"
    image_preview.short_description = "Image"

    def products_count(self, obj):
        return obj.products.count()
    products_count.short_description = "Products"


class CollectionProductInline(admin.TabularInline):
    model = CollectionProduct
    extra = 1
    autocomplete_fields = ['product']


@admin.register(Collection)
class CollectionAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'is_featured', 'image_preview', 'products_count')
    list_filter = ('is_featured',)
    search_fields = ('title', 'description')
    prepopulated_fields = {'slug': ('title',)}
    inlines = [CollectionProductInline]

    def image_preview(self, obj):
        url = obj.get_image_url
        if url:
            return format_html('<img src="{}" style="max-height: 35px; border-radius: 3px;" />', url)
        return "-"
    image_preview.short_description = "Image"

    def products_count(self, obj):
        return obj.products.count()
    products_count.short_description = "Products"


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 2
    fields = ('image', 'image_url', 'alt_text', 'sort_order', 'preview')
    readonly_fields = ('preview',)

    def preview(self, obj):
        url = obj.get_image_url
        if url:
            return format_html('<img src="{}" style="max-height: 45px; border-radius: 3px;" />', url)
        return "-"


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    fields = ('title', 'size', 'price', 'compare_at_price', 'stock', 'sku')


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'brand', 'price_display', 'stock', 'size_variant',
        'is_exclusive', 'is_best_seller', 'is_new_arrival', 'is_published', 'thumbnail'
    )
    list_filter = (
        'is_published', 'is_exclusive', 'is_best_seller', 'is_new_arrival',
        'is_featured', 'brand', 'category'
    )
    list_editable = ('is_exclusive', 'is_best_seller', 'is_new_arrival', 'is_published')
    search_fields = ('name', 'description', 'brand__name', 'sku')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductVariantInline, ProductImageInline]
    actions = [
        'make_exclusive', 'remove_exclusive',
        'make_best_seller', 'remove_best_seller',
        'make_new_arrival', 'remove_new_arrival',
        'publish_products', 'unpublish_products'
    ]

    fieldsets = (
        ("Basic Information", {
            'fields': ('name', 'slug', 'brand', 'category', 'description')
        }),
        ("Fragrance Character & Olfactory Notes", {
            'fields': ('fragrance_family', 'fragrance_notes_top', 'fragrance_notes_heart', 'fragrance_notes_base')
        }),
        ("Pricing & Inventory", {
            'fields': ('price', 'compare_at_price', 'currency', 'stock', 'sku', 'size_variant')
        }),
        ("Storefront Showcase & Flags", {
            'fields': ('is_published', 'is_exclusive', 'is_best_seller', 'is_new_arrival', 'is_featured')
        }),
        ("Primary Product Image", {
            'fields': ('main_image', 'main_image_url', 'thumbnail')
        }),
        ("SEO Settings", {
            'fields': ('seo_title', 'seo_description'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('thumbnail', 'created_at', 'updated_at')

    def price_display(self, obj):
        if obj.compare_at_price:
            return format_html('<span style="font-weight: bold; color: #1a1a1a;">{} {}</span> <del style="color: #999; font-size: 11px;">{}</del>', obj.price, obj.currency, obj.compare_at_price)
        return f"{obj.price} {obj.currency}"
    price_display.short_description = "Price"

    def thumbnail(self, obj):
        url = obj.get_image_url
        if url:
            return format_html('<img src="{}" style="max-height: 45px; border-radius: 4px; border: 1px solid #ddd;" />', url)
        return "No image"
    thumbnail.short_description = "Image"

    # Custom Admin Actions
    @admin.action(description="Mark selected as Exclusive")
    def make_exclusive(self, request, queryset):
        queryset.update(is_exclusive=True)

    @admin.action(description="Remove Exclusive tag")
    def remove_exclusive(self, request, queryset):
        queryset.update(is_exclusive=False)

    @admin.action(description="Mark selected as Best Sellers")
    def make_best_seller(self, request, queryset):
        queryset.update(is_best_seller=True)

    @admin.action(description="Remove Best Seller tag")
    def remove_best_seller(self, request, queryset):
        queryset.update(is_best_seller=False)

    @admin.action(description="Mark selected as New Arrivals")
    def make_new_arrival(self, request, queryset):
        queryset.update(is_new_arrival=True)

    @admin.action(description="Remove New Arrival tag")
    def remove_new_arrival(self, request, queryset):
        queryset.update(is_new_arrival=False)

    @admin.action(description="Publish selected products")
    def publish_products(self, request, queryset):
        queryset.update(is_published=True)

    @admin.action(description="Unpublish selected products")
    def unpublish_products(self, request, queryset):
        queryset.update(is_published=False)


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product_name', 'brand_name', 'variant_title', 'price', 'quantity', 'subtotal', 'item_preview')
    can_delete = False

    def item_preview(self, obj):
        if obj.product_image_url:
            return format_html('<img src="{}" style="max-height: 40px; border-radius: 3px;" />', obj.product_image_url)
        return "-"
    item_preview.short_description = "Image"


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'order_reference', 'customer_name', 'customer_phone', 'country', 'state_emirate',
        'total_display', 'status_badge', 'business_email_badge', 'created_at'
    )
    list_filter = ('status', 'country', 'state_emirate', 'business_email_sent', 'created_at')
    search_fields = ('order_reference', 'customer_name', 'customer_phone', 'customer_email', 'country', 'delivery_address')
    readonly_fields = (
        'order_reference', 'customer_name', 'customer_phone', 'customer_email',
        'country', 'delivery_address', 'city', 'state_emirate', 'postal_code',
        'delivery_instructions', 'subtotal', 'shipping_fee', 'total_amount',
        'currency', 'payment_method', 'business_email_sent', 'customer_email_sent',
        'email_delivery_log', 'created_at', 'updated_at'
    )
    inlines = [OrderItemInline]
    actions = [
        'resend_order_emails',
        'send_test_order_email',
        'mark_as_confirmed',
        'mark_as_processing',
        'mark_as_out_for_delivery',
        'mark_as_delivered',
        'mark_as_cancelled'
    ]

    fieldsets = (
        ("Order Identification & Status", {
            'fields': ('order_reference', 'status', 'payment_method', 'created_at')
        }),
        ("Customer & Delivery Destination", {
            'fields': (
                'customer_name', 'customer_phone', 'customer_email',
                'country', 'state_emirate', 'city', 'delivery_address', 'postal_code', 'delivery_instructions'
            )
        }),
        ("Financial Totals", {
            'fields': ('subtotal', 'shipping_fee', 'total_amount', 'currency')
        }),
        ("Email Notification Tracking", {
            'fields': ('business_email_sent', 'customer_email_sent', 'email_delivery_log')
        }),
    )

    def total_display(self, obj):
        return format_html('<strong>{} {}</strong>', obj.total_amount, obj.currency)
    total_display.short_description = "Total"

    def status_badge(self, obj):
        colors = {
            'Pending': '#e67e22',
            'Confirmed': '#2980b9',
            'Processing': '#8e44ad',
            'Out for Delivery': '#f39c12',
            'Delivered': '#27ae60',
            'Cancelled': '#c0392b',
        }
        color = colors.get(obj.status, '#555')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px; font-weight: bold; font-size: 11px;">{}</span>',
            color, obj.status
        )
    status_badge.short_description = "Status"

    def business_email_badge(self, obj):
        if obj.business_email_sent:
            return format_html('<span style="color: #27ae60; font-weight: bold;">✔ Sent</span>')
        return format_html('<span style="color: #c0392b; font-weight: bold;">✖ Failed / Pending</span>')
    business_email_badge.short_description = "Email Alert"

    @admin.action(description="Resend Order Notification Emails")
    def resend_order_emails(self, request, queryset):
        success_count = 0
        for order in queryset:
            if send_order_notifications(order):
                success_count += 1
        self.message_user(request, f"Notification emails processed. Successfully dispatched for {success_count} order(s).")

    @admin.action(description="Send Test Order Notification Email to fouzfragranceae@gmail.com")
    def send_test_order_email(self, request, queryset):
        res = send_test_email()
        if res['success']:
            self.message_user(request, f"Test notification email dispatched successfully to {res['recipient']}!", level=messages.SUCCESS)
        else:
            self.message_user(request, f"Failed: {res['message']}", level=messages.ERROR)

    @admin.action(description="Mark status as Confirmed")
    def mark_as_confirmed(self, request, queryset):
        queryset.update(status='Confirmed')

    @admin.action(description="Mark status as Processing")
    def mark_as_processing(self, request, queryset):
        queryset.update(status='Processing')

    @admin.action(description="Mark status as Out for Delivery")
    def mark_as_out_for_delivery(self, request, queryset):
        queryset.update(status='Out for Delivery')

    @admin.action(description="Mark status as Delivered")
    def mark_as_delivered(self, request, queryset):
        queryset.update(status='Delivered')

    @admin.action(description="Mark status as Cancelled")
    def mark_as_cancelled(self, request, queryset):
        queryset.update(status='Cancelled')


@admin.register(ContactEnquiry)
class ContactEnquiryAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'subject', 'is_resolved', 'email_sent', 'created_at')
    list_filter = ('is_resolved', 'email_sent', 'created_at')
    search_fields = ('name', 'email', 'subject', 'message')
    readonly_fields = ('name', 'email', 'phone', 'subject', 'message', 'created_at')
