import urllib.request
import re
import json
import os
from django.utils.text import slugify

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

# 1. Load V Perfumes brands
with open('frontend/src/data/vperfumesBrands.json', 'r', encoding='utf-8') as f:
    vp_brands = json.load(f)

brand_by_slug = {b['slug']: b for b in vp_brands}

# Brand pricing rules in UAE (AED)
brand_price_rules = {
    "creed": (850, 1250, 32),
    "roja": (980, 1450, 32),
    "amouage": (650, 950, 31),
    "tom-ford": (580, 850, 31),
    "clive-christian": (1100, 1600, 31),
    "parfums-de-marly": (690, 990, 30),
    "xerjoff": (720, 1050, 31),
    "initio": (750, 1100, 31),
    "kilian": (780, 1150, 32),
    "maison-francis-kurkdjian": (820, 1200, 31),
    "byredo": (620, 890, 30),
    "chanel": (490, 680, 28),
    "dior": (490, 690, 29),
    "hermes": (390, 560, 30),
    "bvlgari": (360, 540, 33),
    "yves-saint-laurent": (380, 560, 32),
    "giorgio-armani": (350, 520, 32),
    "versace": (289, 520, 44),
    "guerlain": (320, 490, 34),
    "dolce-gabbana": (280, 460, 39),
    "dolce-and-gabbana": (280, 460, 39),
    "paco-rabanne": (290, 450, 35),
    "carolina-herrera": (310, 470, 34),
    "jean-paul-gaultier": (320, 480, 33),
    "narciso-rodriguez": (310, 460, 32),
    "givenchy": (330, 490, 32),
    "roberto-cavalli": (220, 430, 48),
    "valentino": (370, 540, 31),
    "thierry-mugler": (310, 470, 34),
    "elie-saab": (280, 440, 36),
    "montblanc": (249, 430, 42),
    "azzaro": (240, 410, 41),
    "burberry": (230, 420, 45),
    "gucci": (340, 510, 33),
    "prada": (350, 520, 32),
    "davidoff": (95, 345, 72),
    "calvin-klein": (120, 290, 58),
    "hugo-boss": (190, 380, 50),
    "faiz-niche": (199, 545, 63),
    "holy-oud": (180, 420, 57),
    "lattafa": (95, 180, 47),
    "armaf": (140, 210, 33),
    "afnan": (135, 230, 41),
    "rasasi": (145, 260, 44),
    "ajmal": (130, 240, 45),
    "al-haramain": (160, 270, 40),
    "acqua-di-parisis": (104, 231, 55),
    "acqua-di-parma": (390, 580, 33),
    "hana": (80, 135, 40),
    "maison-de-l-avenir": (260, 650, 60),
    "24-the-fragrance": (109, 189, 42)
}

# Collect all perfume items from sitemaps 0 through 15
all_sitemap_products = []
print("1. Extracting products from sitemaps 0 to 15...")

for i in range(16):
    url = f"https://www.vperfumes.com/ae-en/sitemaps/products/{i}.xml"
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            xml = resp.read().decode('utf-8', errors='ignore')
            urls = re.findall(r'<url>(.*?)</url>', xml, re.DOTALL)
            count = 0
            for u in urls:
                loc_m = re.search(r'<loc>(.*?)</loc>', u)
                img_m = re.search(r'<image:loc>(.*?)</image:loc>', u)
                if loc_m and img_m:
                    loc = loc_m.group(1).strip()
                    img = img_m.group(1).strip()
                    slug = loc.rstrip('/').split('/')[-1]
                    all_sitemap_products.append({'slug': slug, 'image': img, 'sitemap': i})
                    count += 1
            print(f"Sitemap {i}: {count} products (Total: {len(all_sitemap_products)})")
    except Exception as e:
        print(f"Error {url}: {e}")

print(f"Total collected sitemap products: {len(all_sitemap_products)}")

# Known multi-word / special prefix brands
def determine_brand(slug):
    s = slug.lower()

    # Specific brand prefix/keyword checks
    if s.startswith('faiz-niche'): return 'faiz-niche', 'Faiz Niche'
    if s.startswith('holy-oud'): return 'holy-oud', 'Holy Oud'
    if s.startswith('tom-ford') or s.startswith('tomford'): return 'tom-ford', 'Tom Ford'
    if s.startswith('dolce-') or s.startswith('dandg-') or s.startswith('dg-') or 'dolce-gabbana' in s or 'dolce-and-gabbana' in s:
        return 'dolce-gabbana', 'Dolce & Gabbana'
    if s.startswith('yves-saint-laurent') or s.startswith('ysl-'): return 'yves-saint-laurent', 'Yves Saint Laurent'
    if s.startswith('roberto-cavalli'): return 'roberto-cavalli', 'Roberto Cavalli'
    if s.startswith('jean-paul-gaultier') or s.startswith('jpg-'): return 'jean-paul-gaultier', 'Jean Paul Gaultier'
    if s.startswith('carolina-herrera') or s.startswith('ch-'): return 'carolina-herrera', 'Carolina Herrera'
    if s.startswith('paco-rabanne'): return 'paco-rabanne', 'Paco Rabanne'
    if s.startswith('narciso-rodriguez'): return 'narciso-rodriguez', 'Narciso Rodriguez'
    if s.startswith('clive-christian'): return 'clive-christian', 'Clive Christian'
    if s.startswith('parfums-de-marly'): return 'parfums-de-marly', 'Parfums de Marly'
    if s.startswith('acqua-di-parma'): return 'acqua-di-parma', 'Acqua Di Parma'
    if s.startswith('acqua-di-parisis'): return 'acqua-di-parisis', 'Acqua Di Parisis'
    if s.startswith('al-haramain') or s.startswith('haramain'): return 'al-haramain', 'Al Haramain'
    if s.startswith('hugo-boss') or s.startswith('boss-'): return 'hugo-boss', 'Hugo Boss'
    if s.startswith('calvin-klein') or s.startswith('ck-'): return 'calvin-klein', 'Calvin Klein'
    if s.startswith('giorgio-armani') or s.startswith('armani-'): return 'giorgio-armani', 'Giorgio Armani'
    if s.startswith('thierry-mugler') or s.startswith('mugler-'): return 'thierry-mugler', 'Thierry Mugler'
    if s.startswith('elie-saab'): return 'elie-saab', 'Elie Saab'
    if s.startswith('swiss-arabian'): return 'swiss-arabian', 'Swiss Arabian'
    if s.startswith('juliette-has-a-gun'): return 'juliette-has-a-gun', 'Juliette Has A Gun'
    if s.startswith('estee-lauder'): return 'estee-lauder', 'Estee Lauder'
    if s.startswith('bottega-veneta'): return 'bottega-veneta', 'Bottega Veneta'
    if s.startswith('elizabeth-arden'): return 'elizabeth-arden', 'Elizabeth Arden'
    if s.startswith('issey-miyake'): return 'issey-miyake', 'Issey Miyake'
    if s.startswith('24-the-fragrance'): return '24-the-fragrance', '24 The Fragrance'
    if s.startswith('maison-de-l-avenir'): return 'maison-de-l-avenir', "Maison de l'Avenir"

    # Single-word luxury brands
    first_word = s.split('-')[0]
    single_word_map = {
        'dior': ('dior', 'Dior'),
        'christian': ('dior', 'Dior'),
        'chanel': ('chanel', 'Chanel'),
        'versace': ('versace', 'Versace'),
        'amouage': ('amouage', 'Amouage'),
        'creed': ('creed', 'Creed'),
        'bvlgari': ('bvlgari', 'Bvlgari'),
        'gucci': ('gucci', 'Gucci'),
        'burberry': ('burberry', 'Burberry'),
        'givenchy': ('givenchy', 'Givenchy'),
        'guerlain': ('guerlain', 'Guerlain'),
        'davidoff': ('davidoff', 'Davidoff'),
        'dunhill': ('dunhill', 'Dunhill'),
        'guess': ('guess', 'Guess'),
        'hermes': ('hermes', 'Hermes'),
        'azzaro': ('azzaro', 'Azzaro'),
        'byredo': ('byredo', 'Byredo'),
        'armaf': ('armaf', 'Armaf'),
        'lattafa': ('lattafa', 'Lattafa'),
        'afnan': ('afnan', 'Afnan'),
        'rasasi': ('rasasi', 'Rasasi'),
        'ajmal': ('ajmal', 'Ajmal'),
        'valentino': ('valentino', 'Valentino'),
        'prada': ('prada', 'Prada'),
        'roja': ('roja', 'Roja Parfums'),
        'xerjoff': ('xerjoff', 'Xerjoff'),
        'initio': ('initio', 'Initio'),
        'kilian': ('kilian', 'Kilian'),
        'montblanc': ('montblanc', 'Montblanc'),
        'chopard': ('chopard', 'Chopard'),
        'cartier': ('cartier', 'Cartier'),
        'coach': ('coach', 'Coach'),
        'kenzo': ('kenzo', 'Kenzo'),
        'bentley': ('bentley', 'Bentley'),
        'jaguar': ('jaguar', 'Jaguar'),
        'ferrari': ('ferrari', 'Ferrari'),
        'montale': ('montale', 'Montale'),
        'mancera': ('mancera', 'Mancera'),
        'moschino': ('moschino', 'Moschino'),
        'narciso': ('narciso-rodriguez', 'Narciso Rodriguez')
    }

    if first_word in single_word_map:
        return single_word_map[first_word]

    # Check in vp_brands
    if first_word in brand_by_slug:
        return first_word, brand_by_slug[first_word]['name']

    return first_word, first_word.capitalize()

def parse_product(item, item_id):
    slug = item['slug']
    img = item['image']
    b_slug, b_name = determine_brand(slug)

    # Clean title
    words = slug.split('-')
    title_words = []
    for w in words:
        if w.lower() in {'in', 'uae', 'online', 'free', 'shipping'}:
            continue
        if w.lower() == 'edp': title_words.append('EDP')
        elif w.lower() == 'edt': title_words.append('EDT')
        elif w.lower() == 'edc': title_words.append('EDC')
        elif re.match(r'^\d+(?:ml|g|oz)$', w.lower()): title_words.append(w.upper())
        elif w.lower() in {'for', 'and', 'de', 'la', 'le'}: title_words.append(w.lower())
        else: title_words.append(w.capitalize())
    title = " ".join(title_words)
    if title_words and title_words[0].lower() in {'for', 'and', 'de', 'la', 'le'}:
        title = title.capitalize()

    # Pricing
    if b_slug in brand_price_rules:
        base, mrp, disc = brand_price_rules[b_slug]
        var = ((item_id * 17) % 31) - 15
        p = max(55, base + var)
        comp = max(p + 35, mrp + var * 2)
        pct = round((comp - p) / comp * 100)
    else:
        p = 160 + ((item_id * 23) % 180)
        comp = int(p * 1.5)
        pct = round((comp - p) / comp * 100)

    # Size
    size_m = re.search(r'(\d+[\.]?\d*\s*(?:ml|g|oz))', slug, re.I)
    size_var = size_m.group(1).upper() if size_m else "100ML"

    # Category
    cat = "Eau de Parfum"
    if 'extrait' in slug.lower(): cat = "Extrait de Parfum"
    elif 'edp' in slug.lower(): cat = "Eau de Parfum"
    elif 'edt' in slug.lower(): cat = "Eau de Toilette"
    elif 'edc' in slug.lower() or 'cologne' in slug.lower(): cat = "Eau de Cologne"
    elif 'parfum' in slug.lower(): cat = "Parfum"
    elif 'attar' in slug.lower(): cat = "Perfume Oil"

    sold_cnt = 90 + ((item_id * 29 + 13) % 760)

    is_excl = b_slug in {'hana', 'maison-de-l-avenir', 'holy-oud', 'faiz-niche', 'acqua-di-parma'} or (item_id % 7 == 0)

    return {
        "id": item_id,
        "name": title,
        "slug": slug,
        "brand": b_name,
        "brand_slug": b_slug,
        "price": p,
        "compare_at_price": comp,
        "original_price": comp,
        "discount_percent": pct,
        "sold_count": sold_cnt,
        "sold_info": f"{sold_cnt} sold in the last 3 months",
        "image": img,
        "main_image_url": img,
        "images": [{"image_url": img}],
        "description": f"{title} available at Fouz Fragrance Gold Souk Dubai. 100% Original Guaranteed with fast delivery across UAE.",
        "category": cat,
        "size_variant": size_var,
        "is_featured": item_id <= 24,
        "is_best_seller": True,
        "is_new_arrival": item_id % 5 == 0,
        "is_exclusive": is_excl,
        "in_stock": True,
        "stock": 30 + (item_id % 40)
    }

# 2. Prioritize key brands so EVERY clicked brand logo has plenty of products!
key_priority_brands = [
    'faiz-niche', 'dior', 'chanel', 'versace', 'tom-ford', 'amouage', 'creed',
    'bvlgari', 'gucci', 'burberry', 'dolce-gabbana', 'yves-saint-laurent',
    'paco-rabanne', 'givenchy', 'guerlain', 'davidoff', 'dunhill', 'guess',
    'roberto-cavalli', 'hugo-boss', 'hermes', 'azzaro', 'byredo', 'holy-oud',
    'acqua-di-parisis', 'armaf', 'lattafa', 'afnan', 'rasasi', 'ajmal', 'al-haramain',
    'valentino', 'prada', 'montblanc', 'carolina-herrera', 'jean-paul-gaultier',
    'narciso-rodriguez', 'clive-christian', 'parfums-de-marly', 'xerjoff', 'roja',
    'thierry-mugler', 'elie-saab', 'chopard', 'cartier', 'coach', 'kenzo', 'mancera', 'montale'
]

selected_products = []
seen_slugs = set()

# Flagship #1: Faiz Niche Silk Route Intense
flagship = {
    "id": 1,
    "name": "Faiz Niche Silk Route Intense Extrait De Parfum 160ML",
    "slug": "faiz-niche-silk-route-intense-extrait-de-parfum-unisex-160ml",
    "brand": "Faiz Niche",
    "brand_slug": "faiz-niche",
    "price": 199,
    "compare_at_price": 545,
    "original_price": 545,
    "discount_percent": 63,
    "sold_count": 720,
    "sold_info": "720 sold in the last 3 months",
    "image": "https://media.vperfumes.com/products/faiz-niche-silk-route-intense-extraite-de-parfum-160ml-2.webp",
    "main_image_url": "https://media.vperfumes.com/products/faiz-niche-silk-route-intense-extraite-de-parfum-160ml-2.webp",
    "images": [{"image_url": "https://media.vperfumes.com/products/faiz-niche-silk-route-intense-extraite-de-parfum-160ml-2.webp"}],
    "description": "Faiz Niche Silk Route Intense Extraite De Parfum Unisex 160ML in UAE. 100% Original Guaranteed.",
    "category": "Extrait de Parfum",
    "size_variant": "160ML",
    "is_featured": True,
    "is_best_seller": True,
    "is_new_arrival": True,
    "is_exclusive": True,
    "in_stock": True,
    "stock": 45
}
selected_products.append(flagship)
seen_slugs.add(flagship['slug'])

# Add priority brands products (up to 35 per brand)
for pb in key_priority_brands:
    added_for_b = 0
    for item in all_sitemap_products:
        slug = item['slug']
        if slug in seen_slugs:
            continue
        b_slug, _ = determine_brand(slug)
        if b_slug == pb:
            prod = parse_product(item, len(selected_products) + 1)
            selected_products.append(prod)
            seen_slugs.add(slug)
            added_for_b += 1
            if added_for_b >= 35:
                break
    print(f"Added {added_for_b} products for priority brand {pb}")

print(f"Selected priority products: {len(selected_products)}")

# Fill remainder from all_sitemap_products up to 2537
for item in all_sitemap_products:
    if len(selected_products) >= 2537:
        break
    slug = item['slug']
    if slug in seen_slugs:
        continue
    prod = parse_product(item, len(selected_products) + 1)
    selected_products.append(prod)
    seen_slugs.add(slug)

print(f"Final Count of balanced catalog: {len(selected_products)} products! Target: 2537")

# Save to all catalog files
with open('frontend/src/data/vperfumesProducts.json', 'w', encoding='utf-8') as f:
    json.dump(selected_products, f, indent=2, ensure_ascii=False)
with open('frontend/public/products.json', 'w', encoding='utf-8') as f:
    json.dump(selected_products, f, indent=2, ensure_ascii=False)
with open('backend/seed_products_2537.json', 'w', encoding='utf-8') as f:
    json.dump(selected_products, f, indent=2, ensure_ascii=False)

# Update product counts in vp_brands
brand_counts = {}
for p in selected_products:
    bs = p['brand_slug']
    brand_counts[bs] = brand_counts.get(bs, 0) + 1

for b in vp_brands:
    bs = b['slug']
    b['product_count'] = brand_counts.get(bs, 0)
    b['is_featured'] = b['product_count'] >= 5

# Sort brands so active ones come first
vp_brands_sorted = sorted(vp_brands, key=lambda x: (x['product_count'] > 0, x['product_count']), reverse=True)
with open('frontend/src/data/vperfumesBrands.json', 'w', encoding='utf-8') as f:
    json.dump(vp_brands_sorted, f, indent=2, ensure_ascii=False)
with open('frontend/public/brands.json', 'w', encoding='utf-8') as f:
    json.dump(vp_brands_sorted, f, indent=2, ensure_ascii=False)
with open('backend/seed_brands.json', 'w', encoding='utf-8') as f:
    json.dump(vp_brands_sorted, f, indent=2, ensure_ascii=False)

print("Updated all files with balanced brand catalog!")
