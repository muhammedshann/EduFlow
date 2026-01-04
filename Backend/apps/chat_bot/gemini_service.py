import requests
import os

GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/"
    "models/gemini-flash-latest:generateContent"
)

def call_gemini(prompt: str) -> str:
    response = requests.post(
        f"{GEMINI_URL}?key={os.getenv('GEMINI_API_KEY')}",
        headers={"Content-Type": "application/json"},
        json={
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ]
        },
        timeout=60
    )

    response.raise_for_status()

    return response.json()["candidates"][0]["content"]["parts"][0]["text"]
