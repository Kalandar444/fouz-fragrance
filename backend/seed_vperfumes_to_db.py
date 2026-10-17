import os
import json
import django
from django.utils.text import slugify

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fouz_backend.settings')
django.setup()

from store.models import Product, ProductImage, Brand, Category, Collection, CollectionProduct

# 1. Load brands
brands_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'seed_brands.json')
if not os.path.exists(brands_path):
    brands_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'frontend', 'src', 'data', 'vperfumesBrands.json')

with open(brands_path, 'r', encoding='utf-8') as f:
    vp_brands = json.load(f)

# Save copy to backend/seed_brands.json
with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'seed_brands.json'), 'w', encoding='utf-8') as f:
    json.dump(vp_brands, f, indent=2, ensure_ascii=False)

print(f"Loaded {len(vp_brands)} authentic V Perfumes brands...")

# Seed / update brands in DB
brand_obj_map = {}
for b in vp_brands:
    bs = b['slug']
    bname = b['name']
    blogo = b.get('logo') or b.get('image_url') or ''
    b_desc = f"Discover luxury perfumes and signature fragrances by {bname}."

    b_obj = Brand.objects.filter(slug=bs).first()
    if not b_obj:
        b_obj = Brand.objects.filter(name__iexact=bname).first()

    if b_obj:
        b_obj.name = bname
        b_obj.slug = bs
        b_obj.logo = blogo
        b_obj.image_url = blogo
        b_obj.description = b_desc
        b_obj.is_featured = b.get('is_featured', False)
        b_obj.save()
    else:
        b_obj = Brand.objects.create(
            name=bname,
            slug=bs,
            logo=blogo,
            image_url=blogo,
            description=b_desc,
            is_featured=b.get('is_featured', False)
        )
    brand_obj_map[bs] = b_obj
    brand_obj_map[bname.lower()] = b_obj

print(f"Synced {len(brand_obj_map)} brands in database!")

# 2. Load products
json_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'seed_products_2537.json')
if not os.path.exists(json_path):
    json_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'frontend', 'src', 'data', 'vperfumesProducts.json')

with open(json_path, 'r', encoding='utf-8') as f:
    products = json.load(f)

print(f"Loaded {len(products)} products from {json_path}...")

print("Clearing old products from database...")
from django.db import transaction

with transaction.atomic():
    Product.objects.all().delete()

    cat_default, _ = Category.objects.get_or_create(slug='perfumes', defaults={'name': 'Luxury Perfumes'})
    col_best_sellers, _ = Collection.objects.get_or_create(slug='best-sellers', defaults={'title': 'Best Sellers'})
    col_new_arrivals, _ = Collection.objects.get_or_create(slug='new-arrivals', defaults={'title': 'New Arrivals'})
    col_exclusive, _ = Collection.objects.get_or_create(slug='exclusive', defaults={'title': 'Exclusive Collection'})

    created = 0
    for idx, p in enumerate(products):
        bslug = p.get('brand_slug') or slugify(p.get('brand') or 'brand')
        bname = p.get('brand') or 'V Perfumes'
        
        b_obj = brand_obj_map.get(bslug) or brand_obj_map.get(bname.lower())
        if not b_obj:
            b_obj = Brand.objects.filter(slug=bslug).first() or Brand.objects.filter(name__iexact=bname).first()
            if not b_obj:
                unique_name = bname
                suffix = 1
                while Brand.objects.filter(name__iexact=unique_name).exists():
                    unique_name = f"{bname} {suffix}"
                    suffix += 1
                unique_slug = bslug
                suffix = 1
                while Brand.objects.filter(slug=unique_slug).exists():
                    unique_slug = f"{bslug}-{suffix}"
                    suffix += 1
                b_obj = Brand.objects.create(name=unique_name, slug=unique_slug, is_featured=True)
            brand_obj_map[bslug] = b_obj
            brand_obj_map[bname.lower()] = b_obj

        prod_slug = p['slug']
        if Product.objects.filter(slug=prod_slug).exists():
            prod_slug = f"{prod_slug}-{idx+1}"

        prod = Product.objects.create(
            name=p['name'],
            slug=prod_slug,
            brand=b_obj,
            category=cat_default,
            description=p.get('description', ''),
            price=p['price'],
            compare_at_price=p.get('compare_at_price'),
            main_image_url=p['image'],
            is_featured=(idx < 24),
            is_best_seller=p.get('is_best_seller', True),
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
        if created % 500 == 0:
            print(f"Seeded {created}/{len(products)} products...", flush=True)

print(f"Successfully seeded {created} products and linked all brands in database!", flush=True)
