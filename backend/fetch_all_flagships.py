import urllib.request
import json
import concurrent.futures
import time

with open('backend/amberiya_collections_parsed.json', 'r', encoding='utf-8') as f:
    collections = json.load(f)

print(f"Loaded {len(collections)} collections from amberiya_collections_parsed.json")

results = {}
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

def fetch_collection_products(item):
    handle = item['handle']
    url = f"https://www.amberiya.ae/collections/{handle}/products.json?limit=2"
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return handle, data.get('products', []), None
    except Exception as e:
        return handle, [], str(e)

start_time = time.time()
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
    futures = [executor.submit(fetch_collection_products, item) for item in collections]
    for future in concurrent.futures.as_completed(futures):
        handle, prods, err = future.result()
        results[handle] = {'products': prods, 'error': err}

elapsed = time.time() - start_time
successful = sum(1 for h, r in results.items() if len(r['products']) > 0)
print(f"Finished in {elapsed:.2f}s: {successful}/{len(collections)} collections have direct products.")

# Save results
with open('backend/amberiya_flagships_by_collection.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)
print("Saved to backend/amberiya_flagships_by_collection.json")
