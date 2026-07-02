import requests
import time

url = "http://localhost:8000/demo"

start_time = time.time()
for i in range(10):
    elapsed = time.time() - start_time
    print(f"Request {i+1}: Elapsed time: {elapsed:.1f}s")
    response = requests.post(url)
    print(f"  Status: {response.status_code}")
    time.sleep(0.5)  # Wait 0.5 second between requests (fast)
