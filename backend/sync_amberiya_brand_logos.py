import os
import urllib.request
import json
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fouz_backend.settings')
django.setup()

from store.models import Brand
from django.utils.text import slugify

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

print("Fetching all brand collections & logo images from amberiya.ae...")
all_collections = []
for page in [1, 2, 3]:
    url = f'https://www.amberiya.ae/collections.json?limit=250&page={page}'
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            data = json.loads(r.read().decode('utf-8'))
            cols = data.get('collections', [])
            all_collections.extend(cols)
            print(f"Page {page}: fetched {len(cols)} collections")
            if len(cols) < 250:
                break
    except Exception as e:
        print(f"Error fetching page {page}: {e}")

print(f"Total collections fetched: {len(all_collections)}")

brand_map = {b.name.lower().strip(): b for b in Brand.objects.all()}
slug_map = {b.slug: b for b in Brand.objects.all()}

updated = 0
for col in all_collections:
    title = col.get('title', '').strip()
    handle = col.get('handle', '').strip()
    img = col.get('image')
    if not img or not img.get('src'):
        continue
    src = img['src']

    # Normalize URLs
    if src.startswith('//'):
        src = 'https:' + src

    brand = (
        brand_map.get(title.lower()) or 
        slug_map.get(slugify(handle)) or 
        slug_map.get(slugify(title))
    )
    if brand:
        brand.image_url = src
        brand.save(update_fields=['image_url'])
        updated += 1
    else:
        # Check normalized match
        cleaned_title = title.lower().replace('perfumes', '').replace('parfums', '').strip()
        matched = False
        for b_name, b_obj in brand_map.items():
            cleaned_b_name = b_name.replace('perfumes', '').replace('parfums', '').strip()
            if cleaned_title and (cleaned_title == cleaned_b_name or cleaned_title in cleaned_b_name or cleaned_b_name in cleaned_title):
                b_obj.image_url = src
                b_obj.save(update_fields=['image_url'])
                updated += 1
                matched = True
                break
        
        # If still not found, create new Brand with logo!
        if not matched:
            new_slug = slugify(handle or title)
            if not Brand.objects.filter(slug=new_slug).exists():
                new_b = Brand.objects.create(
                    name=title,
                    slug=new_slug,
                    image_url=src,
                    description=f"Prestigious luxury fragrance house celebrated for its exquisite creations.",
                    is_featured=True
                )
                brand_map[title.lower()] = new_b
                slug_map[new_slug] = new_b
                updated += 1

print(f"Total brands updated: {updated}")
total_brands = Brand.objects.count()
with_logos = Brand.objects.exclude(image_url='').count()
print(f"Database status: {with_logos} of {total_brands} brands have direct logo URLs!")

# Also check specific popular brands
for name in ['Amouage', 'Xerjoff', 'Creed', 'Byredo', 'Nishane', 'Clive Christian', 'Parfums de Marly', 'Acqua di Parma', 'Aawed']:
    b = Brand.objects.filter(name__iexact=name).first()
    if b:
        print(f"  {b.name} -> {b.image_url}")
