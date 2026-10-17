import uuid
from decimal import Decimal
from django.db import models
from django.utils.text import slugify


class WebsiteSetting(models.Model):
    """
    Singleton model to manage Fouz Fragrance business and storefront configuration.
    """
    business_name = models.CharField(max_length=200, default="Fouz Fragrance")
    tagline = models.CharField(max_length=255, default="Premium perfumes | Lasting impressions")
    location = models.CharField(max_length=100, default="UAE 🇦🇪")
    phone = models.CharField(max_length=50, default="+971 54 4540097")
    whatsapp = models.CharField(max_length=50, default="971544540097", help_text="WhatsApp number without spaces or plus sign")
    address = models.CharField(max_length=300, default="Gold souk, Dubai, United Arab Emirates")
    email = models.EmailField(default="fouzfragranceae@gmail.com")
    instagram_url = models.URLField(max_length=300, blank=True, default="https://www.instagram.com/fouzfragrance.ae")
    currency = models.CharField(max_length=10, default="AED")
    
    # Shipping rules
    free_shipping_threshold = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=Decimal("300.00"),
        help_text="Orders above or equal to this amount in AED get free delivery"
    )
    standard_shipping_fee = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=Decimal("25.00"),
        help_text="Standard UAE delivery fee when below free shipping threshold"
    )
    
    # Announcement Bar
    announcement_text = models.CharField(
        max_length=300, 
        default="Worldwide Delivery Available | 100% Authentic Luxury Niche Fragrances"
    )
    announcement_active = models.BooleanField(default=True)
    
    # Branding assets
    logo = models.ImageField(upload_to="branding/", null=True, blank=True)
    
    # Homepage hero content
    hero_title = models.CharField(max_length=200, default="Artisanal Elegance in Every Note")
    hero_subtitle = models.TextField(
        default="Discover an extraordinary curation of the world’s most prestigious niche perfumes, crafted with rare essences and timeless mastery. Worldwide Delivery Available."
    )
    hero_button_text = models.CharField(max_length=50, default="Explore Catalogue")
    hero_button_link = models.CharField(max_length=100, default="/shop")
    hero_image = models.ImageField(upload_to="banners/", null=True, blank=True)
    hero_image_url = models.URLField(max_length=500, blank=True, default="")

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Website & Business Setting"
        verbose_name_plural = "Website & Business Settings"

    def __str__(self):
        return f"{self.business_name} Settings"

    def save(self, *args, **kwargs):
        # Guarantee singleton pattern
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj


class HomepageBanner(models.Model):
    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=300, blank=True)
    button_text = models.CharField(max_length=50, default="Shop Now")
    button_link = models.CharField(max_length=200, default="/shop")
    image = models.ImageField(upload_to="banners/", null=True, blank=True)
    image_url = models.URLField(max_length=500, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['sort_order', 'id']
        verbose_name = "Homepage Banner"
        verbose_name_plural = "Homepage Banners"

    def __str__(self):
        return self.title

    @property
    def get_image_url(self):
        if self.image:
            return self.image.url
        return self.image_url


class Brand(models.Model):
    name = models.CharField(max_length=150, unique=True)
    slug = models.SlugField(max_length=160, unique=True, blank=True)
    description = models.TextField(blank=True, help_text="Brand overview and introduction")
    
    # Visual assets
    logo = models.ImageField(upload_to="brands/logos/", null=True, blank=True)
    image_url = models.URLField(max_length=500, blank=True, help_text="Brand logo URL")
    banner_image = models.ImageField(upload_to="brands/banners/", null=True, blank=True)
    banner_image_url = models.URLField(max_length=500, blank=True, help_text="Brand banner image URL")
    
    # Heritage and Brand Story
    origin_country = models.CharField(max_length=100, blank=True, default="France", help_text="e.g. France, Italy, Oman, United Kingdom, UAE")
    founded_year = models.CharField(max_length=50, blank=True, help_text="e.g. 1983, 1760, 1916")
    fragrance_style = models.CharField(max_length=255, blank=True, help_text="e.g. Artisanal Haute Parfumerie, Rare Oriental Ouds, Fresh Citrus Accords")
    history = models.TextField(blank=True, help_text="Detailed heritage, history and background of the perfume house")
    specialties = models.TextField(blank=True, help_text="Signature notes, rare materials, master perfumers, craftsmanship specialties")
    
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        verbose_name = "Brand"
        verbose_name_plural = "Brands"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    @property
    def get_logo_url(self):
        if self.logo:
            return self.logo.url
        return self.image_url

    @property
    def get_banner_url(self):
        if self.banner_image:
            return self.banner_image.url
        return self.banner_image_url


class Category(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=130, unique=True, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="categories/", null=True, blank=True)
    image_url = models.URLField(max_length=500, blank=True)

    class Meta:
        ordering = ['name']
        verbose_name = "Category"
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    @property
    def get_image_url(self):
        if self.image:
            return self.image.url
        return self.image_url


class Collection(models.Model):
    title = models.CharField(max_length=150, unique=True)
    slug = models.SlugField(max_length=160, unique=True, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="collections/", null=True, blank=True)
    image_url = models.URLField(max_length=500, blank=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['title']
        verbose_name = "Collection"
        verbose_name_plural = "Collections"

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    @property
    def get_image_url(self):
        if self.image:
            return self.image.url
        return self.image_url


class Product(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True, blank=True)
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    collections = models.ManyToManyField(Collection, through='CollectionProduct', blank=True, related_name='products')
    
    description = models.TextField(blank=True)
    fragrance_family = models.CharField(max_length=150, blank=True, default="Niche Fragrance")
    fragrance_notes_top = models.CharField(max_length=300, blank=True)
    fragrance_notes_heart = models.CharField(max_length=300, blank=True)
    fragrance_notes_base = models.CharField(max_length=300, blank=True)
    
    price = models.DecimalField(max_digits=10, decimal_places=2)
    compare_at_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=10, default="AED")
    sku = models.CharField(max_length=100, blank=True)
    stock = models.PositiveIntegerField(default=15)
    size_variant = models.CharField(max_length=80, default="100ml", help_text="Default bottle size, e.g., 50ml, 100ml")
    
    # Storefront flags
    is_published = models.BooleanField(default=True)
    is_exclusive = models.BooleanField(default=False, help_text="Featured in Exclusive collection")
    is_best_seller = models.BooleanField(default=False, help_text="Featured in Best Sellers section")
    is_new_arrival = models.BooleanField(default=False, help_text="Featured in New Arrivals section")
    is_featured = models.BooleanField(default=False, help_text="Showcase prominently on homepage")
    
    # Imagery
    main_image = models.ImageField(upload_to="products/", null=True, blank=True)
    main_image_url = models.URLField(max_length=500, blank=True)
    
    # SEO
    seo_title = models.CharField(max_length=255, blank=True)
    seo_description = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Product"
        verbose_name_plural = "Products"

    def __str__(self):
        brand_str = f"[{self.brand.name}] " if self.brand else ""
        return f"{brand_str}{self.name} - {self.price} {self.currency}"

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    @property
    def get_image_url(self):
        if self.main_image:
            return self.main_image.url
        return self.main_image_url

    @property
    def is_in_stock(self):
        return self.stock > 0

    @property
    def discount_percent(self):
        if self.compare_at_price and self.compare_at_price > self.price:
            discount = ((self.compare_at_price - self.price) / self.compare_at_price) * 100
            return int(round(discount))
        return 0


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to="products/gallery/", null=True, blank=True)
    image_url = models.URLField(max_length=500, blank=True)
    alt_text = models.CharField(max_length=200, blank=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['sort_order', 'id']
        verbose_name = "Product Gallery Image"
        verbose_name_plural = "Product Gallery Images"

    def __str__(self):
        return f"Image for {self.product.name}"

    @property
    def get_image_url(self):
        if self.image:
            return self.image.url
        return self.image_url


class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    title = models.CharField(max_length=100, default="100ml", help_text="Variant name, e.g. 50ml, 100ml")
    size = models.CharField(max_length=50, default="100ml")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    compare_at_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stock = models.PositiveIntegerField(default=10)
    sku = models.CharField(max_length=100, blank=True)

    class Meta:
        verbose_name = "Product Variant"
        verbose_name_plural = "Product Variants"

    def __str__(self):
        return f"{self.product.name} ({self.title}) - {self.price} AED"


class CollectionProduct(models.Model):
    collection = models.ForeignKey(Collection, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']
        unique_together = ('collection', 'product')
        verbose_name = "Collection Product"
        verbose_name_plural = "Collection Products"

    def __str__(self):
        return f"{self.product.name} in {self.collection.title}"


class Order(models.Model):
    UAE_EMIRATES = [
        ('Dubai', 'Dubai'),
        ('Abu Dhabi', 'Abu Dhabi'),
        ('Sharjah', 'Sharjah'),
        ('Ajman', 'Ajman'),
        ('Ras Al Khaimah', 'Ras Al Khaimah'),
        ('Fujairah', 'Fujairah'),
        ('Umm Al Quwain', 'Umm Al Quwain'),
    ]

    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Confirmed', 'Confirmed'),
        ('Processing', 'Processing'),
        ('Out for Delivery', 'Out for Delivery'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
    ]

    order_reference = models.CharField(max_length=40, unique=True, db_index=True)
    customer_name = models.CharField(max_length=200)
    customer_phone = models.CharField(max_length=50)
    customer_email = models.EmailField(blank=True)
    delivery_address = models.TextField()
    city = models.CharField(max_length=100)
    state_emirate = models.CharField(max_length=50, choices=UAE_EMIRATES, default='Dubai')
    postal_code = models.CharField(max_length=20, blank=True)
    delivery_instructions = models.TextField(blank=True)
    
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_fee = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default="AED")
    
    payment_method = models.CharField(max_length=50, default="Cash on Delivery")
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Pending')
    
    # Email notification tracking
    business_email_sent = models.BooleanField(default=False)
    customer_email_sent = models.BooleanField(default=False)
    email_delivery_log = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Order"
        verbose_name_plural = "Orders"

    def __str__(self):
        return f"Order #{self.order_reference} - {self.customer_name} ({self.total_amount} {self.currency})"

    @classmethod
    def generate_order_reference(cls):
        import datetime
        now = datetime.datetime.now()
        date_str = now.strftime('%Y%m%d')
        unique_suffix = uuid.uuid4().hex[:6].upper()
        return f"FF-{date_str}-{unique_suffix}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    product_name = models.CharField(max_length=255)
    brand_name = models.CharField(max_length=150, blank=True)
    variant_title = models.CharField(max_length=100, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    product_image_url = models.CharField(max_length=500, blank=True)

    class Meta:
        verbose_name = "Order Item"
        verbose_name_plural = "Order Items"

    def __str__(self):
        return f"{self.quantity}x {self.product_name} ({self.order.order_reference})"


class ContactEnquiry(models.Model):
    name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=50, blank=True)
    subject = models.CharField(max_length=200)
    message = models.TextField()
    is_resolved = models.BooleanField(default=False)
    email_sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Contact Enquiry"
        verbose_name_plural = "Contact Enquiries"

    def __str__(self):
        return f"Enquiry from {self.name}: {self.subject}"
