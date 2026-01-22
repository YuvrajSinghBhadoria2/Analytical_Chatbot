import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_chat(question):
    payload = {"question": question}
    response = requests.post(f"{BASE_URL}/chat", json=payload)
    print(f"Question: {question}")
    if response.status_code == 200:
        print(f"Answer: {response.json()['answer']}")
    else:
        print(f"Error: {response.status_code} - {response.text}")
    print("-" * 30)

if __name__ == "__main__":
    # Test 1: Performance Ranking
    test_chat("Which funds performed better depending on the yearly Profit and Loss of that fund?")
    
    # Test 2: Specific Fund (Ytum)
    test_chat("How many holdings does the Ytum fund have?")
    
    # Test 3: Specific Fund (Garfield)
    test_chat("Can you tell me about the performance of the Garfield fund?")
    
    # Test 4: Cross-file check
    test_chat("Does Heather have any trades?")
    
    # Test 5: Generic query
    test_chat("Which portfolio has the most records?")

