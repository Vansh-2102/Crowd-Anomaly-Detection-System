import requests
import time

# Your bot token
BOT_TOKEN = "8828558620:AAFlBuG9_g6RCGdlHqQ0oAq_dW09s3frnPE"

def get_updates():
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/getUpdates"
    response = requests.get(url)
    data = response.json()
    return data

if __name__ == "__main__":
    print("Checking for updates...")
    print("Please make sure you've sent a message to your bot recently!")
    print()
    
    for i in range(5):  # Check 5 times with 2-second delays
        data = get_updates()
        print(f"Attempt {i+1}/5:")
        print(f"Response: {data}")
        print()
        
        if data.get("ok") and data.get("result"):
            # Get the last update
            last_update = data["result"][-1]
            chat_id = last_update["message"]["chat"]["id"]
            print("="*50)
            print(f"YOUR CHAT ID IS: {chat_id}")
            print("="*50)
            print(f"Please update your .env file with TELEGRAM_CHAT_ID={chat_id}")
            break
        
        time.sleep(2)
