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
from django.db import transaction
from store.models import Brand, Category, Product, ProductImage, ProductVariant

def clean_html(raw_html):
    if not raw_html:
        return ""
    cleanr = re.compile('<.*?>')
    text = re.sub(cleanr, ' ', raw_html)
    # clean extra whitespace
    return ' '.join(text.split())

def run_import():
    json_path = 'backend/amberiya_best_sellers_all.json'
    if not os.path.exists(json_path):
        print(f"Error: {json_path} does not exist yet. Please wait for download to finish.")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        products_data = json.load(f)

    total_count = len(products_data)
    print(f"Loaded {total_count} products from {json_path}. Starting database import...")

    # Pre-cache Categories
    category_defaults = [
        ("Extrait de Parfum", "extrait-de-parfum", "Highly concentrated artisanal perfumes with exceptional sillage and longevity."),
        ("Eau de Parfum", "eau-de-parfum", "Classic luxury perfumes with rich projection and elegance."),
        ("Parfum", "parfum", "Pure and intense perfume formulations from master perfumers."),
        ("Eau de Toilette", "eau-de-toilette", "Fresh, vibrant fragrances ideal for daytime and warmer climates."),
        ("Eau de Cologne", "eau-de-cologne", "Crisp citrus, herbal, and invigorating heritage scents."),
        ("Perfume Absolute & Oils", "perfume-absolute", "Rare concentrated fragrance absolutes and artisanal perfume attars."),
        ("Hair Mist", "hair-mist", "Enchanting scented hair mists enriched with nourishing luxury essences."),
        ("Discovery Set", "discovery-set", "Curated discovery sets and luxury miniature collections.")
    ]
    categories_cache = {}
    for name, slug, desc in category_defaults:
        cat, _ = Category.objects.get_or_create(slug=slug, defaults={'name': name, 'description': desc})
        categories_cache[name.lower()] = cat
        categories_cache[slug] = cat

    def get_category(type_str, title_str):
        comb = f"{type_str or ''} {title_str or ''}".lower()
        if 'discovery' in comb or 'set' in comb or 'sample' in comb:
            return categories_cache.get("discovery-set")
        if 'extrait' in comb:
            return categories_cache.get("extrait-de-parfum")
        if 'absolute' in comb or 'oil' in comb or 'attar' in comb:
            return categories_cache.get("perfume-absolute")
        if 'toilette' in comb:
            return categories_cache.get("eau-de-toilette")
        if 'cologne' in comb:
            return categories_cache.get("eau-de-cologne")
        if 'hair mist' in comb:
            return categories_cache.get("hair-mist")
        return categories_cache.get("eau-de-parfum")

    # Pre-cache Brands
    brands_cache = {b.name.lower(): b for b in Brand.objects.all()}

    # Pre-cache existing Products by slug and name
    existing_products_by_slug = {p.slug: p for p in Product.objects.all()}
    existing_products_by_name = {p.name.lower(): p for p in Product.objects.all()}

    created_count = 0
    updated_count = 0
    batch_size = 100

    for i in range(0, total_count, batch_size):
        batch = products_data[i:i + batch_size]
        with transaction.atomic():
            for p_data in batch:
                title = (p_data.get('title') or '').strip()
                if not title:
                    continue

                handle = (p_data.get('handle') or slugify(title)).strip()
                vendor_name = (p_data.get('vendor') or '').strip()
                product_type = p_data.get('product_type') or ''

                # Brand resolution
                brand = None
                if vendor_name:
                    v_key = vendor_name.lower()
                    if v_key in brands_cache:
                        brand = brands_cache[v_key]
                    else:
                        brand_slug = slugify(vendor_name)
                        # ensure slug uniqueness
                        cnt = 1
                        orig_slug = brand_slug
                        while Brand.objects.filter(slug=brand_slug).exists():
                            brand_slug = f"{orig_slug}-{cnt}"
                            cnt += 1
                        brand = Brand.objects.create(name=vendor_name, slug=brand_slug)
                        brands_cache[v_key] = brand

                category = get_category(product_type, title)

                # Variant info
                variants = p_data.get('variants', [])
                price = Decimal("350.00")
                compare_at = None
                sku = ""
                size_variant = "100ml"

                if variants:
                    v0 = variants[0]
                    try:
                        p_val = v0.get('price')
                        if p_val:
                            price = Decimal(str(p_val))
                    except Exception:
                        pass
                    try:
                        cp_val = v0.get('compare_at_price')
                        if cp_val:
                            compare_at = Decimal(str(cp_val))
                    except Exception:
                        pass
                    sku = v0.get('sku') or ''
                    v_title = v0.get('title') or ''
                    if v_title and v_title.lower() != 'default title':
                        size_variant = v_title

                # Images
                images = p_data.get('images', [])
                main_image_url = images[0].get('src') if images else ''

                # Description
                raw_desc = p_data.get('body_html') or ''
                desc = clean_html(raw_desc)

                # Check if product exists
                product = existing_products_by_slug.get(handle) or existing_products_by_name.get(title.lower())

                if product:
                    product.is_best_seller = True
                    if not product.main_image_url and main_image_url:
                        product.main_image_url = main_image_url
                    if price and price > 0:
                        product.price = price
                    if compare_at:
                        product.compare_at_price = compare_at
                    if brand and not product.brand:
                        product.brand = brand
                    if category and not product.category:
                        product.category = category
                    product.save(update_fields=['is_best_seller', 'main_image_url', 'price', 'compare_at_price', 'brand', 'category'])
                    updated_count += 1
                else:
                    # Generate unique slug
                    prod_slug = handle
                    slug_cnt = 1
                    while prod_slug in existing_products_by_slug or Product.objects.filter(slug=prod_slug).exists():
                        prod_slug = f"{handle}-{slug_cnt}"
                        slug_cnt += 1

                    product = Product.objects.create(
                        name=title,
                        slug=prod_slug,
                        brand=brand,
                        category=category,
                        description=desc,
                        price=price,
                        compare_at_price=compare_at,
                        sku=sku,
                        size_variant=size_variant,
                        is_best_seller=True,
                        is_published=True,
                        stock=15,
                        main_image_url=main_image_url
                    )
                    existing_products_by_slug[prod_slug] = product
                    existing_products_by_name[title.lower()] = product
                    created_count += 1

                # Save extra images if any
                if len(images) > 1 and product:
                    for img_idx, img_obj in enumerate(images[1:5], start=1):
                        img_src = img_obj.get('src')
                        if img_src:
                            ProductImage.objects.get_or_create(
                                product=product,
                                image_url=img_src,
                                defaults={'alt_text': f"{title} - View {img_idx}", 'sort_order': img_idx}
                            )

        print(f"Processed {min(i + batch_size, total_count)} / {total_count} products (Created: {created_count}, Updated: {updated_count})")

    print("\n==============================================")
    print(f"IMPORT COMPLETE!")
    print(f"Total Best Sellers processed: {total_count}")
    print(f"New products created: {created_count}")
    print(f"Existing products marked as Best Seller: {updated_count}")
    print(f"Total Best Sellers now in DB: {Product.objects.filter(is_best_seller=True).count()}")
    print("==============================================")

if __name__ == '__main__':
    run_import()
