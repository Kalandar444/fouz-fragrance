import os
import json
import django
from django.utils.text import slugify

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fouz_backend.settings')
django.setup()

from store.models import Product, ProductImage, Brand, Category, Collection, CollectionProduct

json_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'frontend', 'src', 'data', 'vperfumesProducts.json')

with open(json_path, 'r', encoding='utf-8') as f:
    products = json.load(f)

print(f"Loaded {len(products)} authentic vperfumes products from JSON...")

print("Clearing old products from database...")
Product.objects.all().delete()

cat_default, _ = Category.objects.get_or_create(slug='perfumes', defaults={'name': 'Luxury Perfumes'})

col_best_sellers, _ = Collection.objects.get_or_create(slug='best-sellers', defaults={'title': 'Best Sellers'})
col_new_arrivals, _ = Collection.objects.get_or_create(slug='new-arrivals', defaults={'title': 'New Arrivals'})
col_exclusive, _ = Collection.objects.get_or_create(slug='exclusive', defaults={'title': 'Exclusive Collection'})

created = 0
for idx, p in enumerate(products):
    b_name = p.get('brand') or 'V Perfumes Luxury'
    b_obj, _ = Brand.objects.get_or_create(
        name=b_name,
        defaults={'slug': slugify(b_name), 'is_featured': True}
    )

    prod = Product.objects.create(
        name=p['name'],
        slug=p['slug'],
        brand=b_obj,
        category=cat_default,
        description=p.get('description', ''),
        price=p['price'],
        compare_at_price=p.get('compare_at_price'),
        main_image_url=p['image'],
        is_featured=True,
        is_best_seller=p.get('is_best_seller', False),
        is_new_arrival=p.get('is_new_arrival', False),
        is_exclusive=p.get('is_exclusive', False),
        stock=p.get('stock', 50),
        size_variant=p.get('size_variant', '100ml'),
        is_published=True
    )

    ProductImage.objects.create(
        product=prod,
        image_url=p['image'],
        sort_order=0
    )

    if prod.is_best_seller:
        CollectionProduct.objects.get_or_create(collection=col_best_sellers, product=prod)
    if prod.is_new_arrival:
        CollectionProduct.objects.get_or_create(collection=col_new_arrivals, product=prod)
    if prod.is_exclusive:
        CollectionProduct.objects.get_or_create(collection=col_exclusive, product=prod)

    created += 1

print(f"Successfully seeded {created} authentic vperfumes products into Django Database!")
first_prod = Product.objects.first()
print(f"First product in DB: {first_prod.name} | AED {first_prod.price} | Image: {first_prod.main_image_url}")
