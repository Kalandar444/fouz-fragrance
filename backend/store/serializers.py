import logging
from decimal import Decimal
from django.db import transaction
from django.utils.text import slugify
from rest_framework import serializers
from .models import (
    WebsiteSetting, HomepageBanner, Brand, Category, Collection,
    Product, ProductImage, ProductVariant, Order, OrderItem, ContactEnquiry
)
from .emails import send_order_notifications, send_contact_enquiry_notification

logger = logging.getLogger(__name__)


class WebsiteSettingSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()
    hero_image_url = serializers.SerializerMethodField()

    class Meta:
        model = WebsiteSetting
        fields = [
            'business_name', 'tagline', 'location', 'phone', 'whatsapp',
            'address', 'email', 'instagram_url', 'currency',
            'free_shipping_threshold', 'standard_shipping_fee',
            'announcement_text', 'announcement_active',
            'logo_url', 'hero_title', 'hero_subtitle', 'hero_button_text',
            'hero_button_link', 'hero_image_url'
        ]

    def get_logo_url(self, obj):
        if obj.logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.logo.url)
            return obj.logo.url
        return None

    def get_hero_image_url(self, obj):
        if obj.hero_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.hero_image.url)
            return obj.hero_image.url
        return obj.hero_image_url


class HomepageBannerSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = HomepageBanner
        fields = ['id', 'title', 'subtitle', 'button_text', 'button_link', 'image', 'sort_order']

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image:
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return obj.image_url


class BrandSerializer(serializers.ModelSerializer):
    logo = serializers.SerializerMethodField()
    banner = serializers.SerializerMethodField()
    products_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = Brand
        fields = [
            'id', 'name', 'slug', 'description', 'logo', 'banner',
            'origin_country', 'founded_year', 'fragrance_style',
            'history', 'specialties', 'is_featured', 'products_count'
        ]

    def get_logo(self, obj):
        # 1. If image_url is an external URL, return directly
        if obj.image_url and (str(obj.image_url).startswith('http://') or str(obj.image_url).startswith('https://')):
            return str(obj.image_url)
        # 2. If logo is an external URL string, return directly
        if obj.logo:
            logo_str = str(obj.logo)
            if logo_str.startswith('http://') or logo_str.startswith('https://'):
                return logo_str
            request = self.context.get('request')
            return request.build_absolute_uri(obj.logo.url) if request else obj.logo.url
        return obj.image_url or None

    def get_banner(self, obj):
        request = self.context.get('request')
        if obj.banner_image:
            return request.build_absolute_uri(obj.banner_image.url) if request else obj.banner_image.url
        return obj.banner_image_url



class CategorySerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    products_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'products_count']

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image:
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return obj.image_url


class CollectionSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    products_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = Collection
        fields = ['id', 'title', 'slug', 'description', 'image', 'is_featured', 'products_count']

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image:
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return obj.image_url


class ProductImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'image_url', 'alt_text', 'sort_order']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return obj.image_url


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ['id', 'title', 'size', 'price', 'compare_at_price', 'stock', 'sku']


class ProductListSerializer(serializers.ModelSerializer):
    brand_name = serializers.CharField(source='brand.name', read_only=True, default='')
    category_name = serializers.CharField(source='category.name', read_only=True, default='')
    image = serializers.SerializerMethodField()
    discount_percent = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'brand_name', 'category_name',
            'price', 'compare_at_price', 'currency', 'stock',
            'size_variant', 'is_published', 'is_exclusive', 'is_best_seller',
            'is_new_arrival', 'is_featured', 'image', 'discount_percent',
            'fragrance_family'
        ]

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.main_image:
            return request.build_absolute_uri(obj.main_image.url) if request else obj.main_image.url
        return obj.main_image_url


class ProductDetailSerializer(serializers.ModelSerializer):
    brand = BrandSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    image = serializers.SerializerMethodField()
    discount_percent = serializers.ReadOnlyField()
    related_products = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'brand', 'category', 'description',
            'fragrance_family', 'fragrance_notes_top', 'fragrance_notes_heart',
            'fragrance_notes_base', 'price', 'compare_at_price', 'currency',
            'sku', 'stock', 'size_variant', 'is_published', 'is_exclusive',
            'is_best_seller', 'is_new_arrival', 'is_featured', 'image',
            'images', 'variants', 'discount_percent', 'seo_title',
            'seo_description', 'created_at', 'related_products'
        ]

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.main_image:
            return request.build_absolute_uri(obj.main_image.url) if request else obj.main_image.url
        return obj.main_image_url

    def get_related_products(self, obj):
        # Fetch related products from same brand or category
        qs = Product.objects.filter(is_published=True).exclude(pk=obj.pk)
        if obj.brand:
            qs_brand = qs.filter(brand=obj.brand)
            if qs_brand.count() >= 4:
                return ProductListSerializer(qs_brand[:4], many=True, context=self.context).data
        if obj.category:
            qs_cat = qs.filter(category=obj.category)
            if qs_cat.exists():
                return ProductListSerializer(qs_cat[:4], many=True, context=self.context).data
        return ProductListSerializer(qs[:4], many=True, context=self.context).data


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product_name', 'brand_name', 'variant_title',
            'price', 'quantity', 'subtotal', 'product_image_url'
        ]


class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'order_reference', 'customer_name', 'customer_phone', 'customer_email',
            'country', 'delivery_address', 'city', 'state_emirate', 'postal_code',
            'delivery_instructions', 'subtotal', 'shipping_fee', 'total_amount',
            'currency', 'payment_method', 'status', 'created_at', 'items',
            'business_email_sent', 'customer_email_sent', 'email_delivery_log'
        ]


class CartItemInputSerializer(serializers.Serializer):
    product_id = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    variant_id = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    quantity = serializers.IntegerField(min_value=1, default=1)
    name = serializers.CharField(required=False, allow_blank=True, default='')
    brand = serializers.CharField(required=False, allow_blank=True, default='')
    variant_title = serializers.CharField(required=False, allow_blank=True, default='100ml')
    price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True, default=Decimal('199.00'))
    image = serializers.CharField(required=False, allow_blank=True, default='')
    slug = serializers.CharField(required=False, allow_blank=True, default='')


class CreateOrderSerializer(serializers.Serializer):
    customer_name = serializers.CharField(max_length=200)
    customer_phone = serializers.CharField(max_length=50)
    customer_email = serializers.EmailField(required=False, allow_blank=True)
    country = serializers.CharField(max_length=100, default='United Arab Emirates', required=False, allow_blank=True)
    delivery_address = serializers.CharField()
    city = serializers.CharField(max_length=100)
    state_emirate = serializers.CharField(max_length=100, default='Dubai', required=False, allow_blank=True)
    postal_code = serializers.CharField(max_length=20, required=False, allow_blank=True)
    delivery_instructions = serializers.CharField(required=False, allow_blank=True)
    items = CartItemInputSerializer(many=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Your cart is empty.")
        return value

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        settings_obj = WebsiteSetting.load()

        with transaction.atomic():
            subtotal = Decimal("0.00")
            verified_order_items = []

            for item_input in items_data:
                p_id_raw = item_input.get('product_id')
                product_id = int(p_id_raw) if (p_id_raw is not None and str(p_id_raw).isdigit()) else None
                v_id_raw = item_input.get('variant_id')
                variant_id = int(v_id_raw) if (v_id_raw is not None and str(v_id_raw).isdigit()) else None
                quantity = item_input.get('quantity', 1)
                item_name = item_input.get('name') or ''
                item_brand = item_input.get('brand') or ''
                item_slug = item_input.get('slug') or ''
                item_image = item_input.get('image') or ''
                item_variant = item_input.get('variant_title') or '100ml'
                client_price = item_input.get('price')

                product = None
                if product_id:
                    product = Product.objects.filter(id=product_id, is_published=True).first()
                if not product and item_slug:
                    product = Product.objects.filter(slug=item_slug, is_published=True).first()
                if not product and item_name:
                    product = Product.objects.filter(name__iexact=item_name, is_published=True).first()

                if product:
                    unit_price = product.price if client_price is None else Decimal(str(client_price))
                    variant_title = product.size_variant or item_variant
                    prod_name = product.name
                    brand_name = product.brand.name if product.brand else item_brand
                    image_url = product.get_image_url or item_image

                    if variant_id:
                        variant = ProductVariant.objects.filter(id=variant_id, product=product).first()
                        if variant:
                            unit_price = variant.price
                            variant_title = variant.title

                    # Deduct stock if available
                    if product.stock >= quantity:
                        product.stock -= quantity
                        product.save(update_fields=['stock'])
                else:
                    # Auto-create product record if missing so order is NEVER dropped
                    unit_price = Decimal(str(client_price)) if client_price else Decimal('199.00')
                    variant_title = item_variant
                    prod_name = item_name or f"Luxury Fragrance #{product_id or 1}"
                    brand_name = item_brand or "Fouz Fragrance"
                    image_url = item_image

                    default_brand = None
                    if item_brand:
                        default_brand = Brand.objects.filter(slug=slugify(item_brand)).first() or Brand.objects.filter(name__iexact=item_brand).first()
                    if not default_brand:
                        default_brand = Brand.objects.filter(slug='fouz-fragrance').first() or Brand.objects.first()

                    default_cat = Category.objects.filter(slug='perfumes').first() or Category.objects.first()
                    slug_cand = item_slug or f"order-item-{product_id or 1}"
                    product = Product.objects.filter(slug=slug_cand).first()
                    if not product:
                        product = Product.objects.create(
                            name=prod_name,
                            slug=slug_cand,
                            brand=default_brand,
                            category=default_cat,
                            price=unit_price,
                            main_image_url=image_url,
                            stock=50,
                            is_published=True
                        )

                item_subtotal = unit_price * quantity
                subtotal += item_subtotal

                verified_order_items.append({
                    'product': product,
                    'product_name': prod_name,
                    'brand_name': brand_name,
                    'variant_title': variant_title,
                    'price': unit_price,
                    'quantity': quantity,
                    'subtotal': item_subtotal,
                    'product_image_url': image_url
                })

            # Calculate shipping charges based on settings
            if subtotal >= settings_obj.free_shipping_threshold:
                shipping_fee = Decimal("0.00")
            else:
                shipping_fee = settings_obj.standard_shipping_fee

            total_amount = subtotal + shipping_fee
            order_reference = Order.generate_order_reference()

            # Determine country & payment method
            cust_country = validated_data.get('country', 'United Arab Emirates') or 'United Arab Emirates'
            is_uae = cust_country.strip().lower() in ('united arab emirates', 'uae', 'emirates')
            pay_method = 'Cash on Delivery (UAE)' if is_uae else 'International Order (Cash / Card on Delivery)'

            # Create Order
            order = Order.objects.create(
                order_reference=order_reference,
                customer_name=validated_data['customer_name'],
                customer_phone=validated_data['customer_phone'],
                customer_email=validated_data.get('customer_email', ''),
                country=cust_country,
                delivery_address=validated_data['delivery_address'],
                city=validated_data['city'],
                state_emirate=validated_data.get('state_emirate', 'Dubai') or 'Dubai',
                postal_code=validated_data.get('postal_code', ''),
                delivery_instructions=validated_data.get('delivery_instructions', ''),
                subtotal=subtotal,
                shipping_fee=shipping_fee,
                total_amount=total_amount,
                currency=settings_obj.currency,
                payment_method=pay_method,
                status='Pending'
            )

            # Create Order Items
            for item in verified_order_items:
                OrderItem.objects.create(
                    order=order,
                    product=item['product'],
                    product_name=item['product_name'],
                    brand_name=item['brand_name'],
                    variant_title=item['variant_title'],
                    price=item['price'],
                    quantity=item['quantity'],
                    subtotal=item['subtotal'],
                    product_image_url=item['product_image_url']
                )

        # Dispatch email notification directly to ensure guaranteed delivery (fail-safe wrapped)
        try:
            send_order_notifications(order)
        except Exception as email_err:
            logger.error(
                f"Safe email handling: Error dispatching order notifications for #{order.order_reference}: {email_err}",
                exc_info=True
            )

        return order


class ContactEnquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactEnquiry
        fields = ['id', 'name', 'email', 'phone', 'subject', 'message', 'created_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        enquiry = super().create(validated_data)
        send_contact_enquiry_notification(enquiry)
        return enquiry
