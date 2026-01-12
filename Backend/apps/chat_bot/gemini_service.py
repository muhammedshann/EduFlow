import requests
import os

GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/"
    "models/gemini-flash-latest:generateContent"
)

def call_gemini(prompt: str) -> str:
    try :
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
        if response.status_code == 429:
            return (
                "⚠️ I'm getting too many requests right now.\n"
                "Please wait a few seconds and try again."
            )

        if response.status_code != 200:
            return "❌ AI service is temporarily unavailable."

        data = response.json()
        return data["candidates"][0]["content"]["parts"][0]["text"]

    except Exception:
        return "❌ Something went wrong. Please try again later."

    # response.raise_for_status()

    # return response.json()["candidates"][0]["content"]["parts"][0]["text"]
