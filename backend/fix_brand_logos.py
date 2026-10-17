import os
import re
import json
import urllib.parse
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fouz_backend.settings')
django.setup()

from store.models import Brand
from django.utils.text import slugify

# Load current brands json
brands_json_path = 'frontend/src/data/vperfumesBrands.json'
with open(brands_json_path, 'r', encoding='utf-8') as f:
    vp_brands = json.load(f)

# Collect all unique logo URLs
all_logo_urls = set()
for b in vp_brands:
    if b.get('logo'):
        all_logo_urls.add(b['logo'])
    if b.get('image_url'):
        all_logo_urls.add(b['image_url'])

print(f"Total unique logo URLs collected: {len(all_logo_urls)}")

def clean_key(text):
    text = urllib.parse.unquote(text).lower()
    text = re.sub(r'https?://[^/]+/(?:brands|images)/', '', text)
    text = re.sub(r'-\d+\.(?:webp|png|jpg|jpeg|svg)', '', text)
    text = re.sub(r'\.(?:webp|png|jpg|jpeg|svg)', '', text)
    text = re.sub(r'-logo|-icon|-parfum|-perfumes|-new|new-|-en', '', text)
    text = re.sub(r'[^a-z0-9]', '', text)
    return text

# Build logo lookup dictionary by cleaned filename
logo_by_key = {}
for url in all_logo_urls:
    filename = url.split('/')[-1]
    k = clean_key(filename)
    if k:
        logo_by_key[k] = url

# Explicit high-priority overrides for flagship luxury brands
KNOWN_MATCHES = {
    'faiz-niche': 'https://media.vperfumes.com/brands/FAIZ-NICHE-1728141513371.webp',
    'dior': 'https://media.vperfumes.com/brands/DIOR-1728141613990.webp',
    'chanel': 'https://media.vperfumes.com/brands/CHANEL-1728141470537.webp',
    'versace': 'https://media.vperfumes.com/brands/new-versace-icon.webp',
    'tom-ford': 'https://media.vperfumes.com/brands/TOM-FORD-1728141479498.webp',
    'creed': 'https://media.vperfumes.com/brands/CREED-1728141609692.webp',
    'bvlgari': 'https://media.vperfumes.com/brands/BVLGARI-1728141484199.webp',
    'gucci': 'https://media.vperfumes.com/brands/GUCCI-1728141656788.webp',
    'burberry': 'https://media.vperfumes.com/brands/BURBERRY-1728141592561.webp',
    'dolce-gabbana': 'https://media.vperfumes.com/brands/DOLCE-%26-GABBANA-1728141617051.webp',
    'dolce-and-gabbana': 'https://media.vperfumes.com/brands/DOLCE-%26-GABBANA-1728141617051.webp',
    'amouage': 'https://media.vperfumes.com/brands/AMOUAGE-1728141497121.webp',
    'calvin-klein': 'https://media.vperfumes.com/brands/CALVIN-KLEIN-1728141486025.webp',
    'elizabeth-arden': 'https://media.vperfumes.com/brands/ELIZABETH-ARDEN-1728141630976.webp',
    'clive-christian': 'https://media.vperfumes.com/brands/CLIVE-CHRISTIAN-1728143185915.webp',
    'dilkash': 'https://media.vperfumes.com/brands/DILKASH-1728143469680.webp',
    'holy-oud': 'https://media.vperfumes.com/brands/HOLY-OUD-1728141520551.webp',
    'ermenegildo-zegna': 'https://media.vperfumes.com/brands/ERMENEGILDO-ZEGNA-1728143187433.webp',
    'candy-crush': 'https://media.vperfumes.com/brands/CANDY-CRUSH-1728143218484.webp',
    'ford': 'https://media.vperfumes.com/brands/FORD-MUSTANG-1728143283815.webp',
    'mustang': 'https://media.vperfumes.com/brands/FORD-MUSTANG-1728143283815.webp',
    'ford-mustang': 'https://media.vperfumes.com/brands/FORD-MUSTANG-1728143283815.webp',
    'carolina-herrera': 'https://media.vperfumes.com/brands/CAROLINA-HERRERA-1728141598688.webp',
    'coach': 'https://media.vperfumes.com/brands/COACH-1728141623462.webp',
    'armaf': 'https://media.vperfumes.com/brands/ARMAF-1728143372364.webp',
    'dunhill': 'https://media.vperfumes.com/brands/DUNHILL-1728141620638.webp',
    'balenciaga': 'https://media.vperfumes.com/brands/BALENCIAGA-1728143161868.webp',
    'escada': 'https://media.vperfumes.com/brands/ESCADA-1728141635349.webp',
    'hugo-boss': 'https://media.vperfumes.com/brands/HUGO-BOSS-1728141662999.webp',
    'givenchy': 'https://media.vperfumes.com/brands/GIVENCHY-1728141653846.webp',
    'guerlain': 'https://media.vperfumes.com/brands/GUERLAIN-1728141658428.webp',
    'yves-saint-laurent': 'https://media.vperfumes.com/brands/YSL-1728141477154.webp',
    'ysl': 'https://media.vperfumes.com/brands/YSL-1728141477154.webp',
    'giorgio-armani': 'https://media.vperfumes.com/brands/GIORGIO-ARMANI-1728141489622.webp',
    'armani': 'https://media.vperfumes.com/brands/GIORGIO-ARMANI-1728141489622.webp',
    'lacoste': 'https://media.vperfumes.com/brands/LACOSTE-1728141680587.webp',
    'montblanc': 'https://media.vperfumes.com/brands/MONTBLANC-1728141708892.webp',
    'narciso-rodriguez': 'https://media.vperfumes.com/brands/NARCISO-RODRIGUEZ-1728141716301.webp',
    'paco-rabanne': 'https://media.vperfumes.com/brands/PACO-RABANNE-1728141724213.webp',
    'prada': 'https://media.vperfumes.com/brands/PRADA-1728141731637.webp',
    'roberto-cavalli': 'https://media.vperfumes.com/brands/ROBERTO-CAVALLI-1728141743588.webp',
    'thierry-mugler': 'https://media.vperfumes.com/brands/THIERRY-MUGLER-1728141759600.webp',
    'mugler': 'https://media.vperfumes.com/brands/THIERRY-MUGLER-1728141759600.webp',
    'valentino': 'https://media.vperfumes.com/brands/VALENTINO-1728141768407.webp',
    'chopard': 'https://media.vperfumes.com/brands/CHOPARD-1728141604928.webp',
    'cartier': 'https://media.vperfumes.com/brands/CARTIER-1728141600880.webp',
    'jaguar': 'https://media.vperfumes.com/brands/JAGUAR-1728141671953.webp',
    'davidoff': 'https://media.vperfumes.com/brands/DAVIDOFF-1728141611843.webp',
    'azzaro': 'https://media.vperfumes.com/brands/AZZARO-1728141584852.webp',
    'boucheron': 'https://media.vperfumes.com/brands/BOUCHERON-1728141588147.webp',
    'guess': 'https://media.vperfumes.com/brands/GUESS-1728141660600.webp',
}

# Update all brands
matched_count = 0
unmatched = []

for b in vp_brands:
    slug = b['slug'].lower()
    name_clean = clean_key(b['name'])
    
    # 1. Check known matches
    if slug in KNOWN_MATCHES:
        correct_logo = KNOWN_MATCHES[slug]
        b['logo'] = correct_logo
        b['image_url'] = correct_logo
        matched_count += 1
        continue
    
    # 2. Check exact key match
    if name_clean in logo_by_key:
        correct_logo = logo_by_key[name_clean]
        b['logo'] = correct_logo
        b['image_url'] = correct_logo
        matched_count += 1
        continue
    
    # 3. Check partial key match
    found = False
    for lk, lurl in logo_by_key.items():
        if len(lk) >= 4 and (lk == name_clean or lk in name_clean or name_clean in lk):
            b['logo'] = lurl
            b['image_url'] = lurl
            matched_count += 1
            found = True
            break
            
    if not found:
        # If no verified match found, clear the wrong logo so text fallback or correct logo is used
        b['logo'] = ''
        b['image_url'] = ''
        unmatched.append(b['name'])

print(f"Matched {matched_count} brands with verified logos! {len(unmatched)} brands had no verified match and cleared.")

# Save to frontend and backend JSON files
with open('frontend/src/data/vperfumesBrands.json', 'w', encoding='utf-8') as f:
    json.dump(vp_brands, f, indent=2, ensure_ascii=False)

with open('frontend/public/brands.json', 'w', encoding='utf-8') as f:
    json.dump(vp_brands, f, indent=2, ensure_ascii=False)

with open('backend/seed_brands.json', 'w', encoding='utf-8') as f:
    json.dump(vp_brands, f, indent=2, ensure_ascii=False)

# Update database Brand objects
db_updated = 0
for b in vp_brands:
    slug = b['slug']
    brand_objs = Brand.objects.filter(slug=slug)
    for bo in brand_objs:
        bo.logo = b['logo']
        bo.image_url = b['image_url']
        bo.save(update_fields=['logo', 'image_url'])
        db_updated += 1

print(f"Database Brand objects updated: {db_updated}")

# Test the top 10 display brands
top10_slugs = [
    'faiz-niche', 'dior', 'chanel', 'versace', 'tom-ford',
    'creed', 'bvlgari', 'gucci', 'burberry', 'dolce-gabbana'
]
print("\n--- TOP 10 DISPLAY BRANDS VERIFICATION ---")
for s in top10_slugs:
    bo = Brand.objects.filter(slug=s).first()
    if bo:
        print(f"{bo.name} ({bo.slug}) -> {bo.logo}")
    else:
        print(f"Slug {s} not found in DB!")
