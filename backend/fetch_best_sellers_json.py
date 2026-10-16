import urllib.request
import json
import time

print("Starting download of all Amberiya Best Sellers products...")
all_products = []
page = 1

while True:
    url = f"https://www.amberiya.ae/collections/best-sellers/products.json?limit=250&page={page}"
    print(f"Fetching page {page}: {url}")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    
    try:
        res = urllib.request.urlopen(req, timeout=15)
        data = json.loads(res.read().decode('utf-8'))
        products = data.get('products', [])
        if not products:
            print(f"Page {page} returned 0 products. Download complete.")
            break
        all_products.extend(products)
        print(f"  -> Retrieved {len(products)} products (Total so far: {len(all_products)})")
        page += 1
        time.sleep(0.3)
    except Exception as e:
        print(f"Error on page {page}: {e}")
        break

output_file = "backend/amberiya_best_sellers_all.json"
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(all_products, f, ensure_ascii=False, indent=2)

print(f"Successfully downloaded and saved {len(all_products)} best seller products to {output_file}!")
