import os
import sys
import json
import re
from decimal import Decimal
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fouz_backend.settings')
django.setup()

from django.utils.text import slugify
from store.models import (
    Brand, Category, Collection, Product, CollectionProduct
)

print("Starting Option 1 Import: 170+ Brands & Flagship Fragrances from Amberiya...")

# 1. Load data files
with open('backend/amberiya_collections_parsed.json', 'r', encoding='utf-8') as f:
    collections_data = json.load(f)

with open('backend/amberiya_flagships_complete.json', 'r', encoding='utf-8') as f:
    flagships_data = json.load(f)

print(f"Loaded {len(collections_data)} collections.")

# 2. Setup Categories
category_names = [
    ("Extrait de Parfum", "extrait-de-parfum", "Highly concentrated artisanal perfumes with exceptional sillage and longevity."),
    ("Eau de Parfum", "eau-de-parfum", "Classic luxury perfumes with rich projection and elegance."),
    ("Parfum", "parfum", "Pure and intense perfume formulations from master perfumers."),
    ("Eau de Toilette", "eau-de-toilette", "Fresh, vibrant fragrances ideal for daytime and warmer climates."),
    ("Eau de Cologne", "eau-de-cologne", "Crisp citrus, herbal, and invigorating heritage scents."),
    ("Perfume Absolute & Oils", "perfume-absolute", "Rare concentrated fragrance absolutes and artisanal perfume attars."),
    ("Hair Mist", "hair-mist", "Enchanting scented hair mists enriched with nourishing luxury essences.")
]

categories_map = {}
for name, slug, desc in category_names:
    cat, _ = Category.objects.get_or_create(slug=slug, defaults={'name': name, 'description': desc})
    categories_map[name.lower()] = cat
    categories_map[slug] = cat

default_cat = categories_map["eau-de-parfum"]

def get_category_for_type(type_str, title_str):
    combined = f"{type_str or ''} {title_str or ''}".lower()
    if 'extrait' in combined:
        return categories_map["extrait-de-parfum"]
    if 'absolute' in combined or 'oil' in combined or 'attar' in combined:
        return categories_map["perfume-absolute"]
    if 'toilette' in combined:
        return categories_map["eau-de-toilette"]
    if 'cologne' in combined:
        return categories_map["eau-de-cologne"]
    if 'hair mist' in combined:
        return categories_map["hair-mist"]
    if 'parfum' in combined:
        return categories_map["eau-de-parfum"]
    return default_cat

# 3. Create or update core promotional collections
promo_collections = [
    ("Best Sellers", "best-sellers", "Our most coveted and acclaimed niche fragrances in Dubai and the UAE.", "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=900"),
    ("New Arrivals", "new-arrivals", "The latest releases and newest niche olfactory arrivals at Fouz Fragrance.", "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=900"),
    ("Exclusive Collection", "exclusive", "Ultra-rare, limited edition luxury extraits available exclusively at our boutique.", "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=900")
]

core_colls = {}
for title, slug, desc, img in promo_collections:
    c_obj, _ = Collection.objects.get_or_create(
        slug=slug,
        defaults={'title': title, 'description': desc, 'image_url': img, 'is_featured': True}
    )
    core_colls[slug] = c_obj

# 4. Import Brands, Collections, and Flagship Products
brands_created = 0
brands_updated = 0
collections_created = 0
products_created = 0
products_updated = 0

for item in collections_data:
    handle = item['handle']
    title = item['title'].strip()
    desc = item.get('description', '').strip()
    img_url = item.get('image_url', '').strip()

    if not title:
        continue

    # Create/update Brand
    brand_slug = slugify(handle) or slugify(title)
    brand, b_created = Brand.objects.get_or_create(
        slug=brand_slug,
        defaults={
            'name': title,
            'description': desc or f"Exquisite luxury niche perfumes handcrafted by {title}.",
            'image_url': img_url,
            'is_featured': True if handle in ['amouage', 'xerjoff', 'creed', 'parfums-de-marly', 'roja-parfums', 'clive-christian', 'byredo', 'initio-parfums', 'widian', 'the-spirit-of-dubai'] else False
        }
    )
    if not b_created:
        if not brand.image_url and img_url:
            brand.image_url = img_url
        if desc and (not brand.description or len(brand.description) < len(desc)):
            brand.description = desc
        brand.save()
        brands_updated += 1
    else:
        brands_created += 1

    # Create/update Collection
    coll_slug = handle
    collection, c_created = Collection.objects.get_or_create(
        slug=coll_slug,
        defaults={
            'title': title,
            'description': desc or f"Discover the complete fragrance collection from {title}.",
            'image_url': img_url,
            'is_featured': False
        }
    )
    if not c_created:
        if not collection.image_url and img_url:
            collection.image_url = img_url
            collection.save()
    else:
        collections_created += 1

    # Product data
    flagship_info = flagships_data.get(handle, {})
    prods = flagship_info.get('products', [])
    if not prods:
        continue

    for p_data in prods[:1]: # Take the flagship product
        prod_title = p_data.get('title', '').strip()
        if not prod_title:
            prod_title = f"{title} Signature Fragrance"

        # Pricing
        variants = p_data.get('variants', [])
        first_variant = variants[0] if variants else {}
        raw_price = first_variant.get('price') or '650'
        raw_compare = first_variant.get('compare_at_price')
        
        try:
            price = Decimal(str(raw_price).replace(',', '').strip())
        except Exception:
            price = Decimal("650.00")

        compare_at_price = None
        if raw_compare:
            try:
                compare_at_price = Decimal(str(raw_compare).replace(',', '').strip())
                if compare_at_price <= price:
                    compare_at_price = None
            except Exception:
                compare_at_price = None

        # Image
        images = p_data.get('images', [])
        p_img = images[0].get('src') if images else (img_url or '')
        if p_img and p_img.startswith('//'):
            p_img = 'https:' + p_img

        # Category
        p_type = p_data.get('product_type', '')
        category = get_category_for_type(p_type, prod_title)

        # Bottle Size
        size = first_variant.get('title', '100ml')
        if not size or size.lower() == 'default title':
            size_match = re.search(r'([0-9]+\s*ml)', prod_title, re.IGNORECASE)
            size = size_match.group(1) if size_match else '100ml'

        # Description
        body_html = p_data.get('body_html') or ''
        clean_desc = re.sub(r'<[^>]+>', ' ', body_html).strip()
        if not clean_desc or len(clean_desc) < 20:
            clean_desc = f"{prod_title} by {title} is an extraordinary luxury fragrance crafted with rare notes and exceptional longevity."

        # Slug
        base_prod_slug = slugify(prod_title) or f"fragrance-{handle}"
        
        # Check if product with this title or slug already exists
        existing_prod = Product.objects.filter(slug=base_prod_slug).first()
        if not existing_prod:
            existing_prod = Product.objects.filter(name=prod_title).first()

        is_exclusive = handle in ['spiritica', 'roja-parfums', 'clive-christian', 'the-spirit-of-dubai', 'strangelove-nyc']
        is_best_seller = handle in ['amouage', 'parfums-de-marly', 'xerjoff', 'creed', 'byredo', 'diptyque', 'baccarat', 'initio-parfums']
        is_new_arrival = handle in ['dannam-perfumes', 'aawed', 'spiritum', 'fomowa-paris', 'borntostandout', 'mind-games']

        if existing_prod:
            existing_prod.brand = brand
            existing_prod.category = category
            existing_prod.price = price
            if compare_at_price:
                existing_prod.compare_at_price = compare_at_price
            if p_img and not existing_prod.main_image_url:
                existing_prod.main_image_url = p_img
            existing_prod.save()
            prod_obj = existing_prod
            products_updated += 1
        else:
            # ensure unique slug
            unique_slug = base_prod_slug
            counter = 1
            while Product.objects.filter(slug=unique_slug).exists():
                unique_slug = f"{base_prod_slug}-{counter}"
                counter += 1

            prod_obj = Product.objects.create(
                name=prod_title,
                slug=unique_slug,
                brand=brand,
                category=category,
                price=price,
                compare_at_price=compare_at_price,
                currency="AED",
                stock=15,
                size_variant=size,
                description=clean_desc,
                main_image_url=p_img,
                is_published=True,
                is_exclusive=is_exclusive,
                is_best_seller=is_best_seller,
                is_new_arrival=is_new_arrival,
                is_featured=is_best_seller or is_exclusive
            )
            products_created += 1

        # Link to brand collection
        CollectionProduct.objects.get_or_create(collection=collection, product=prod_obj)

        # Link to promo collections if applicable
        if is_best_seller:
            CollectionProduct.objects.get_or_create(collection=core_colls['best-sellers'], product=prod_obj)
        if is_new_arrival:
            CollectionProduct.objects.get_or_create(collection=core_colls['new-arrivals'], product=prod_obj)
        if is_exclusive:
            CollectionProduct.objects.get_or_create(collection=core_colls['exclusive'], product=prod_obj)

print("\n=== IMPORT COMPLETE ===")
print(f"Brands Created: {brands_created}, Updated: {brands_updated} -> Total in DB: {Brand.objects.count()}")
print(f"Collections Created: {collections_created} -> Total in DB: {Collection.objects.count()}")
print(f"Products Created: {products_created}, Updated: {products_updated} -> Total in DB: {Product.objects.count()}")
