import urllib.request
import re
import json
import os

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

print("1. Loading existing 64 products from frontend/src/data/vperfumesProducts.json...")
existing_path = "frontend/src/data/vperfumesProducts.json"
existing_products = []
if os.path.exists(existing_path):
    with open(existing_path, "r", encoding="utf-8") as f:
        existing_products = json.load(f)
print(f"Loaded {len(existing_products)} existing products.")

existing_slugs = set(p['slug'] for p in existing_products)

# Multi-word brands list for clean brand recognition
multi_word_brands = [
    "Faiz Niche", "Tom Ford", "Roberto Cavalli", "Maison Margiela", "Acqua Di Parma",
    "Acqua Di", "Dolce & Gabbana", "Yves Saint Laurent", "Jean Paul Gaultier",
    "Paco Rabanne", "Carolina Herrera", "Narciso Rodriguez", "Elie Saab",
    "Thierry Mugler", "Parfums De Marly", "Juliette Has A Gun", "Agent Provocateur",
    "Swiss Arabian", "Armaf Niche", "Estee Lauder", "Atelier Cologne", "Penhaligon's",
    "Jo Malone", "Santa Maria Novella", "Maison Francis Kurkdjian", "Clive Christian",
    "Roja Parfums", "Floraïku", "Xerjoff Casamorati", "Sospiro Parfums", "Le Labo",
    "Byredo", "Vilhelm Parfumerie", "Kilian Paris", "Initio Parfums", "Thomas Kosmala",
    "Mancera Paris", "Montale Paris", "Memo Paris", "BDK Parfums", "Amouage", "Rasasi",
    "Lattafa", "Afnan", "Al Haramain", "Ajmal", "Franck Boclet", "Jacques Bogart",
    "David Beckham", "Salvatore Ferragamo", "Ermenegildo Zegna", "Van Cleef & Arpels"
]

def parse_slug_to_product(slug, image_url, item_id):
    size_match = re.search(r'(\d+[\.]?\d*\s*(?:ml|g|oz))', slug, re.I)
    size_variant = size_match.group(1).upper() if size_match else "100ML"
    
    cat = "Eau de Parfum"
    if 'extrait' in slug.lower():
        cat = "Extrait de Parfum"
    elif 'edp' in slug.lower():
        cat = "Eau de Parfum"
    elif 'edt' in slug.lower():
        cat = "Eau de Toilette"
    elif 'edc' in slug.lower() or 'cologne' in slug.lower():
        cat = "Eau de Cologne"
    elif 'parfum' in slug.lower():
        cat = "Parfum"
    elif 'attar' in slug.lower() or 'oil' in slug.lower():
        cat = "Perfume Oil"
        
    words = slug.split('-')
    
    slug_brand = ""
    for mb in multi_word_brands:
        mb_slug = mb.lower().replace('&', '').replace("'", '').replace(' ', '-')
        mb_slug_alt = mb.lower().replace('&', 'and').replace("'", '').replace(' ', '-')
        if slug.lower().startswith(mb_slug) or slug.lower().startswith(mb_slug_alt):
            slug_brand = mb
            break
            
    if not slug_brand:
        slug_brand = words[0].capitalize()
        if slug_brand.lower() == 'ysl':
            slug_brand = 'Yves Saint Laurent'
        elif slug_brand.lower() == 'ch':
            slug_brand = 'Carolina Herrera'
        elif slug_brand.lower() == 'd&g':
            slug_brand = 'Dolce & Gabbana'
        elif slug_brand.lower() == 'jpg':
            slug_brand = 'Jean Paul Gaultier'

    title_words = []
    skip_tokens = {'in', 'uae', 'online', 'free', 'shipping'}
    for w in words:
        if w.lower() in skip_tokens:
            continue
        if w.lower() == 'edp':
            title_words.append('EDP')
        elif w.lower() == 'edt':
            title_words.append('EDT')
        elif w.lower() == 'edc':
            title_words.append('EDC')
        elif re.match(r'^\d+(?:ml|g|oz)$', w.lower()):
            title_words.append(w.upper())
        elif w.lower() == 'for':
            title_words.append('For')
        elif w.lower() == 'women':
            title_words.append('Women')
        elif w.lower() == 'men':
            title_words.append('Men')
        elif w.lower() == 'unisex':
            title_words.append('Unisex')
        else:
            title_words.append(w.capitalize())
            
    title = " ".join(title_words)
    
    base_price = 110 + ((item_id * 41 + 59) % 490)
    discount_pct = 30 + ((item_id * 17 + 11) % 35)
    compare_at = int(base_price / (1 - (discount_pct / 100.0)))
    sold_cnt = 80 + ((item_id * 31 + 23) % 820)
    
    return {
        "id": item_id,
        "name": title,
        "slug": slug,
        "brand": slug_brand,
        "price": base_price,
        "compare_at_price": compare_at,
        "original_price": compare_at,
        "discount_percent": discount_pct,
        "sold_count": sold_cnt,
        "sold_info": f"{sold_cnt} sold in the last 3 months",
        "image": image_url,
        "main_image_url": image_url,
        "images": [{"image_url": image_url}],
        "description": f"{title} available at Fouz Fragrance Gold Souk Dubai. 100% Original Guaranteed with fast delivery across UAE.",
        "category": cat,
        "size_variant": size_variant,
        "is_featured": item_id <= 12,
        "is_best_seller": item_id % 4 == 0,
        "is_new_arrival": item_id % 5 == 0,
        "is_exclusive": item_id % 6 == 0,
        "in_stock": True,
        "stock": 25 + (item_id % 50)
    }

print("2. Extracting sitemaps 0 to 4...")
sitemap_items = []
for i in range(5):
    sm_url = f"https://www.vperfumes.com/ae-en/sitemaps/products/{i}.xml"
    try:
        req = urllib.request.Request(sm_url, headers=headers)
        with urllib.request.urlopen(req, timeout=20) as resp:
            xml = resp.read().decode('utf-8', errors='ignore')
            url_blocks = re.findall(r'<url>(.*?)</url>', xml, re.DOTALL)
            for b in url_blocks:
                loc_m = re.search(r'<loc>(.*?)</loc>', b)
                img_m = re.search(r'<image:loc>(.*?)</image:loc>', b)
                if loc_m and img_m:
                    loc = loc_m.group(1).strip()
                    img = img_m.group(1).strip()
                    slug = loc.rstrip('/').split('/')[-1]
                    sitemap_items.append({'slug': slug, 'image': img})
            print(f"Loaded sitemap {i}: {len(sitemap_items)} items so far.")
    except Exception as e:
        print(f"Error {sm_url}: {e}")

TARGET_TOTAL = 2537
final_products = list(existing_products)

# Update IDs of existing products to start from 1
for idx, p in enumerate(final_products):
    p['id'] = idx + 1

next_id = len(final_products) + 1

perfume_keywords = ['edp', 'edt', 'parfum', 'extrait', 'cologne', 'eau-de', 'eau-fraiche', 'attar', 'perfume', 'fragrance']

for item in sitemap_items:
    if len(final_products) >= TARGET_TOTAL:
        break
    slug = item['slug']
    img = item['image']
    
    if slug in existing_slugs:
        continue
    if not any(k in slug.lower() for k in perfume_keywords):
        continue
    if not img or not img.startswith('http'):
        continue
        
    prod = parse_slug_to_product(slug, img, next_id)
    final_products.append(prod)
    existing_slugs.add(slug)
    next_id += 1

print(f"Generated total products: {len(final_products)}")

# If slightly under 2537, include other items from sitemap
if len(final_products) < TARGET_TOTAL:
    for item in sitemap_items:
        if len(final_products) >= TARGET_TOTAL:
            break
        slug = item['slug']
        img = item['image']
        if slug in existing_slugs or not img:
            continue
        prod = parse_slug_to_product(slug, img, next_id)
        final_products.append(prod)
        existing_slugs.add(slug)
        next_id += 1

print(f"Final Count: {len(final_products)} products! Target: {TARGET_TOTAL}")

# Save to frontend/src/data/vperfumesProducts.json
with open('frontend/src/data/vperfumesProducts.json', 'w', encoding='utf-8') as f:
    json.dump(final_products, f, indent=2, ensure_ascii=False)
print("Saved frontend/src/data/vperfumesProducts.json")

# Also save to frontend/public/products.json
with open('frontend/public/products.json', 'w', encoding='utf-8') as f:
    json.dump(final_products, f, indent=2, ensure_ascii=False)
print("Saved frontend/public/products.json")

# Also save to backend/seed_products_2537.json
with open('backend/seed_products_2537.json', 'w', encoding='utf-8') as f:
    json.dump(final_products, f, indent=2, ensure_ascii=False)
print("Saved backend/seed_products_2537.json")
