from decimal import Decimal
from django.db.models import Q
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .models import (
    WebsiteSetting, HomepageBanner, Brand, Category, Collection,
    Product, ProductVariant, Order, ContactEnquiry
)
from .serializers import (
    WebsiteSettingSerializer, HomepageBannerSerializer,
    BrandSerializer, CategorySerializer, CollectionSerializer,
    ProductListSerializer, ProductDetailSerializer,
    OrderDetailSerializer, CreateOrderSerializer, ContactEnquirySerializer
)


class WebsiteSettingView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        settings_obj = WebsiteSetting.load()
        serializer = WebsiteSettingSerializer(settings_obj, context={'request': request})
        return Response(serializer.data)


class HomepageBannerListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = HomepageBanner.objects.filter(is_active=True).order_by('sort_order', 'id')
    serializer_class = HomepageBannerSerializer
    pagination_class = None


class BrandListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = Brand.objects.all().order_by('name')
    serializer_class = BrandSerializer
    pagination_class = None


class BrandDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        target_slug = (slug or '').lower().strip()
        slug_map = {
            'christian-dior': 'dior',
            'christian': 'dior',
            'bvlgari-le-gemme': 'bvlgari',
            'bulgari': 'bvlgari',
            'dolce-and-gabbana': 'dolce-gabbana',
            'd-and-g': 'dolce-gabbana',
            'd-g': 'dolce-gabbana',
            'dandg': 'dolce-gabbana',
            'dolce': 'dolce-gabbana',
            'ysl': 'yves-saint-laurent',
            'ck': 'calvin-klein',
            'boss': 'hugo-boss',
            'jpg': 'jean-paul-gaultier',
            'ch': 'carolina-herrera',
            'tomford': 'tom-ford',
            'haramain': 'al-haramain',
        }
        target_slug = slug_map.get(target_slug, target_slug)

        brand = Brand.objects.filter(slug=target_slug).first()
        if not brand:
            brand = Brand.objects.filter(slug=slug).first()
        if not brand:
            brand = Brand.objects.filter(name__iexact=slug.replace('-', ' ')).first()
        if not brand:
            # Try finding by name containing target slug words
            first_word = target_slug.split('-')[0]
            brand = Brand.objects.filter(name__icontains=first_word).first()
        if not brand:
            return Response({"error": "Brand not found"}, status=status.HTTP_404_NOT_FOUND)

        brand_data = BrandSerializer(brand, context={'request': request}).data
        products = Product.objects.filter(brand=brand, is_published=True).select_related('brand', 'category')
        if not products.exists():
            first_word = brand.name.split()[0] if brand.name else ''
            products = Product.objects.filter(
                Q(brand__name__iexact=brand.name) |
                Q(slug__startswith=brand.slug) |
                Q(name__icontains=first_word),
                is_published=True
            ).select_related('brand', 'category')

        # Filter by search
        search = request.query_params.get('search')
        if search:
            products = products.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )

        # In stock filter
        if request.query_params.get('in_stock') == 'true':
            products = products.filter(stock__gt=0)

        # Ordering
        ordering = request.query_params.get('ordering')
        if ordering == 'price_asc':
            products = products.order_by('price')
        elif ordering == 'price_desc':
            products = products.order_by('-price')
        elif ordering == 'name_asc':
            products = products.order_by('name')
        else:
            products = products.order_by('-created_at')

        total_count = products.count()

        # Support optional page & page_size
        page_param = request.query_params.get('page')
        page_size_param = request.query_params.get('page_size', 24)

        if page_param:
            try:
                page_num = int(page_param)
                page_size = min(int(page_size_param), 120)
                from math import ceil
                total_pages = ceil(total_count / page_size) if total_count > 0 else 1
                start = (page_num - 1) * page_size
                end = start + page_size
                paginated_prods = products[start:end]
                products_data = ProductListSerializer(paginated_prods, many=True, context={'request': request}).data
                return Response({
                    "brand": brand_data,
                    "products": products_data,
                    "count": total_count,
                    "total_pages": total_pages,
                    "current_page": page_num,
                    "page_size": page_size
                })
            except Exception:
                pass

        products_data = ProductListSerializer(products, many=True, context={'request': request}).data

        return Response({
            "brand": brand_data,
            "products": products_data,
            "count": total_count,
            "total_pages": 1,
            "current_page": 1,
            "page_size": total_count
        })


class CategoryListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    pagination_class = None


class CollectionListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    queryset = Collection.objects.all().order_by('title')
    serializer_class = CollectionSerializer
    pagination_class = None


class CollectionDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        try:
            collection = Collection.objects.get(slug=slug)
        except Collection.DoesNotExist:
            return Response({"error": "Collection not found"}, status=status.HTTP_404_NOT_FOUND)

        collection_data = CollectionSerializer(collection, context={'request': request}).data
        products = collection.products.filter(is_published=True).order_by('-created_at')
        products_data = ProductListSerializer(products, many=True, context={'request': request}).data

        return Response({
            "collection": collection_data,
            "products": products_data
        })


from rest_framework.pagination import PageNumberPagination


class StandardProductPagination(PageNumberPagination):
    page_size = 24
    page_size_query_param = 'page_size'
    max_page_size = 120

    def paginate_queryset(self, queryset, request, view=None):
        if request.query_params.get('paginate') == 'false':
            return None
        return super().paginate_queryset(queryset, request, view)

    def get_paginated_response(self, data):
        return Response({
            'count': self.page.paginator.count,
            'total_pages': self.page.paginator.num_pages,
            'current_page': self.page.number,
            'page_size': self.get_page_size(self.request),
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        })


class ProductListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProductListSerializer
    pagination_class = StandardProductPagination

    def get_queryset(self):
        qs = Product.objects.filter(is_published=True).select_related('brand', 'category')
        params = self.request.query_params

        # Filter by Exclusive
        if params.get('exclusive') == 'true':
            qs = qs.filter(is_exclusive=True)

        # Filter by Best Sellers
        if params.get('best_sellers') == 'true':
            qs = qs.filter(is_best_seller=True)

        # Filter by New Arrivals
        if params.get('new_arrivals') == 'true':
            qs = qs.filter(is_new_arrival=True)

        # Filter by Featured
        if params.get('featured') == 'true':
            qs = qs.filter(is_featured=True)

        # Filter by Brand
        brand_param = params.get('brand')
        if brand_param:
            qs = qs.filter(Q(brand__slug=brand_param) | Q(brand__name__iexact=brand_param))

        # Filter by Category
        cat_param = params.get('category')
        if cat_param:
            qs = qs.filter(Q(category__slug=cat_param) | Q(category__name__iexact=cat_param))

        # Filter by Collection
        col_param = params.get('collection')
        if col_param:
            qs = qs.filter(collections__slug=col_param)

        # Price range filters
        min_price = params.get('min_price')
        if min_price:
            try:
                qs = qs.filter(price__gte=Decimal(min_price))
            except Exception:
                pass

        max_price = params.get('max_price')
        if max_price:
            try:
                qs = qs.filter(price__lte=Decimal(max_price))
            except Exception:
                pass

        # In Stock filter
        if params.get('in_stock') == 'true':
            qs = qs.filter(stock__gt=0)

        # Search query
        search_query = params.get('search')
        if search_query:
            qs = qs.filter(
                Q(name__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(brand__name__icontains=search_query) |
                Q(category__name__icontains=search_query) |
                Q(fragrance_family__icontains=search_query)
            )

        # Ordering
        ordering = params.get('ordering')
        if ordering == 'price_asc':
            qs = qs.order_by('price')
        elif ordering == 'price_desc':
            qs = qs.order_by('-price')
        elif ordering == 'newest':
            qs = qs.order_by('id')
        elif ordering == 'name_asc':
            qs = qs.order_by('name')
        else:
            qs = qs.order_by('id')

        return qs.distinct()


class ProductDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        try:
            product = Product.objects.select_related('brand', 'category').prefetch_related('images', 'variants').get(
                slug=slug, is_published=True
            )
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProductDetailSerializer(product, context={'request': request})
        return Response(serializer.data)


class CartValidateView(APIView):
    """
    Validates cart items against live database prices, stock, and calculates current subtotal + shipping.
    Does not modify inventory or place orders.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        items_data = request.data.get('items', [])
        settings_obj = WebsiteSetting.load()
        
        validated_items = []
        subtotal = Decimal("0.00")
        has_stock_error = False

        for item in items_data:
            p_id = item.get('product_id')
            v_id = item.get('variant_id')
            qty = int(item.get('quantity', 1))

            try:
                product = Product.objects.get(id=p_id, is_published=True)
            except Product.DoesNotExist:
                continue

            unit_price = product.price
            variant_title = product.size_variant
            stock_available = product.stock

            if v_id:
                try:
                    variant = ProductVariant.objects.get(id=v_id, product=product)
                    unit_price = variant.price
                    variant_title = variant.title
                    stock_available = variant.stock
                except ProductVariant.DoesNotExist:
                    pass

            item_subtotal = unit_price * qty
            subtotal += item_subtotal
            in_stock = stock_available >= qty

            if not in_stock:
                has_stock_error = True

            validated_items.append({
                'product_id': product.id,
                'variant_id': v_id,
                'name': product.name,
                'brand': product.brand.name if product.brand else '',
                'variant_title': variant_title,
                'unit_price': float(unit_price),
                'quantity': qty,
                'item_subtotal': float(item_subtotal),
                'image': product.get_image_url,
                'stock_available': stock_available,
                'in_stock': in_stock,
            })

        shipping_fee = Decimal("0.00") if subtotal >= settings_obj.free_shipping_threshold else settings_obj.standard_shipping_fee
        total_amount = subtotal + shipping_fee

        return Response({
            'items': validated_items,
            'subtotal': float(subtotal),
            'shipping_fee': float(shipping_fee),
            'total_amount': float(total_amount),
            'currency': settings_obj.currency,
            'free_shipping_threshold': float(settings_obj.free_shipping_threshold),
            'has_stock_error': has_stock_error,
        })


class CreateOrderView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CreateOrderSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            try:
                order = serializer.save()
                return Response({
                    "message": "Your order has been received. Payment will be collected in cash upon delivery.",
                    "order_reference": order.order_reference,
                    "total_amount": float(order.total_amount),
                    "currency": order.currency,
                    "customer_name": order.customer_name,
                    "customer_email": order.customer_email,
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OrderDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, reference):
        try:
            order = Order.objects.prefetch_related('items').get(order_reference=reference)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = OrderDetailSerializer(order, context={'request': request})
        return Response(serializer.data)


class ContactEnquiryView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    queryset = ContactEnquiry.objects.all()
    serializer_class = ContactEnquirySerializer

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return Response({
            "message": "Thank you for contacting Fouz Fragrance. Your message has been received, and our team will get back to you shortly.",
            "data": response.data
        }, status=status.HTTP_201_CREATED)
