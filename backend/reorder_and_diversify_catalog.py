import json
import os
import django
import sys

sys.path.insert(0, 'backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fouz_backend.settings')
django.setup()

from store.models import Product

# 1. Load current 2537 products
json_path = 'frontend/src/data/vperfumesProducts.json'
with open(json_path, 'r', encoding='utf-8') as f:
    products = json.load(f)

print(f"Loaded {len(products)} products from {json_path}")

# Separate Faiz Niche Silk Route Intense as flagship #1
silk_route = None
other_products = []
for p in products:
    if 'silk-route' in p.get('slug', '').lower() and not silk_route:
        silk_route = p
    else:
        other_products.append(p)

if not silk_route:
    silk_route = products[0]
    other_products = products[1:]

# Niche luxury brands that qualify for Exclusive
EXCLUSIVE_BRANDS = {
    'faiz niche', 'creed', 'amouage', 'xerjoff', 'clive christian',
    'tom ford', 'bvlgari', 'guerlain', 'acqua di parma', 'diptyque',
    'byredo', 'kilian', 'nishane', 'roja', 'parfums de marly'
}

# Top global bestseller brands
BESTSELLER_BRANDS = {
    'dior', 'chanel', 'creed', 'versace', 'tom ford', 'bvlgari',
    'gucci', 'burberry', 'dolce & gabbana', 'yves saint laurent',
    'amouage', 'faiz niche', 'givenchy', 'guerlain', 'paco rabanne',
    'giorgio armani', 'dunhill', 'azzaro', 'montblanc', 'prada',
    'carolina herrera', 'hugo boss', 'cartier', 'chopard', 'valentino'
}

# New arrival brands
NEW_ARRIVAL_BRANDS = {
    'amouage', 'dior', 'tom ford', 'chanel', 'versace', 'creed',
    'dolce & gabbana', 'faiz niche', 'xerjoff', 'guerlain', 'gucci',
    'clive christian', 'givenchy', 'yves saint laurent', 'burberry'
}

# Group products by brand
from collections import defaultdict
by_brand = defaultdict(list)
for p in other_products:
    b_name = (p.get('brand') or 'Other').strip()
    by_brand[b_name].append(p)

# Priority order for round-robin interleaving
PRIORITY_BRANDS = [
    'Dior', 'Chanel', 'Creed', 'Versace', 'Tom Ford',
    'Bvlgari', 'Gucci', 'Burberry', 'Dolce & Gabbana', 'Amouage',
    'Yves Saint Laurent', 'Xerjoff', 'Clive Christian', 'Guerlain', 'Givenchy',
    'Faiz Niche', 'Paco Rabanne', 'Dunhill', 'Azzaro', 'Montblanc',
    'Carolina Herrera', 'Hugo Boss', 'Cartier', 'Chopard', 'Valentino'
]

# Order brand keys: priority brands first, then others sorted by count
other_brand_keys = [b for b in by_brand.keys() if b not in PRIORITY_BRANDS]
other_brand_keys.sort(key=lambda b: len(by_brand[b]), reverse=True)
all_ordered_brand_keys = [b for b in PRIORITY_BRANDS if b in by_brand] + other_brand_keys

# Round-robin interleaving to create a diverse luxury catalog
interleaved = [silk_route]
silk_route['id'] = 1
silk_route['is_exclusive'] = True
silk_route['is_best_seller'] = True
silk_route['is_new_arrival'] = False

def perfume_rank(item):
    name = (item.get('name') or '').lower()
    is_accessory = any(x in name for x in ['deodorant', 'hair mist', 'shower gel', 'body lotion', 'mini set', 'mini'])
    is_edp = any(x in name for x in ['extrait', 'parfum', 'edp', 'edt'])
    return (not is_accessory, is_edp, item.get('price', 0))

# Copy and rank queues
queues = {b: sorted(by_brand[b], key=perfume_rank, reverse=True) for b in all_ordered_brand_keys}

while any(queues.values()):
    for b in all_ordered_brand_keys:
        if queues[b]:
            item = queues[b].pop(0)
            item['id'] = len(interleaved) + 1
            
            b_lower = (item.get('brand') or '').lower()
            name_lower = (item.get('name') or '').lower()
            is_accessory = any(x in name_lower for x in ['deodorant', 'hair mist', 'shower gel'])
            idx = len(interleaved)
            
            # Smart flag distribution
            # Exclusive: true if brand in EXCLUSIVE_BRANDS and not an accessory
            is_excl = any(eb in b_lower for eb in EXCLUSIVE_BRANDS) and not is_accessory and (idx % 2 == 1)
            
            # Best Seller: true if brand in BESTSELLER_BRANDS and not an accessory
            is_best = any(bb in b_lower for bb in BESTSELLER_BRANDS) and not is_accessory and (idx % 2 == 0 or idx <= 15)
            
            # New Arrival: true if brand in NEW_ARRIVAL_BRANDS and not an accessory
            is_new = any(nb in b_lower for nb in NEW_ARRIVAL_BRANDS) and not is_accessory and (idx % 3 == 0)
            
            item['is_exclusive'] = bool(is_excl)
            item['is_best_seller'] = bool(is_best)
            item['is_new_arrival'] = bool(is_new)
            
            interleaved.append(item)

print(f"Total interleaved catalog size: {len(interleaved)} (Target: 2537)")

# Verify top 8 in each category
top_excl = [x['brand'] + ' - ' + x['name'] for x in interleaved if x.get('is_exclusive')][:8]
top_best = [x['brand'] + ' - ' + x['name'] for x in interleaved if x.get('is_best_seller')][:8]
top_new = [x['brand'] + ' - ' + x['name'] for x in interleaved if x.get('is_new_arrival')][:8]

print("\n--- TOP 8 EXCLUSIVE FRAGRANCES ---")
for i, item in enumerate(top_excl, 1):
    print(f"{i}. {item}")

print("\n--- TOP 8 BEST SELLERS ---")
for i, item in enumerate(top_best, 1):
    print(f"{i}. {item}")

print("\n--- TOP 8 NEW ARRIVALS ---")
for i, item in enumerate(top_new, 1):
    print(f"{i}. {item}")

# Save to JSON files
with open('frontend/src/data/vperfumesProducts.json', 'w', encoding='utf-8') as f:
    json.dump(interleaved, f, indent=2, ensure_ascii=False)

with open('frontend/public/products.json', 'w', encoding='utf-8') as f:
    json.dump(interleaved, f, indent=2, ensure_ascii=False)

with open('backend/seed_products_2537.json', 'w', encoding='utf-8') as f:
    json.dump(interleaved, f, indent=2, ensure_ascii=False)

print("\nUpdated all JSON catalog files!")

# Update database products using bulk_update for instant speed
print("Updating database Product objects...")
slug_to_item = {item['slug']: item for item in interleaved}
all_db_products = list(Product.objects.filter(slug__in=slug_to_item.keys()))
for p_obj in all_db_products:
    item = slug_to_item[p_obj.slug]
    p_obj.is_exclusive = item['is_exclusive']
    p_obj.is_best_seller = item['is_best_seller']
    p_obj.is_new_arrival = item['is_new_arrival']

Product.objects.bulk_update(all_db_products, ['is_exclusive', 'is_best_seller', 'is_new_arrival'], batch_size=500)
print(f"Database Product records updated: {len(all_db_products)}!")
