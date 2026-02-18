import requests
import os
import time

GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/"
    "models/gemini-2.5-pro:generateContent"
)

def call_gemini(prompt: str) -> str:
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        return "❌ API key not configured."

    if not prompt.strip():
        return "⚠️ Please enter a valid question."

    try:
        # Retry mechanism (handles temporary failures)
        for attempt in range(3):

            response = requests.post(
                f"{GEMINI_URL}?key={api_key}",
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

            # Rate limit
            if response.status_code == 429:
                return (
                    "⚠️ Too many requests. Please wait a few seconds and try again."
                )

            # Temporary server issues → retry
            if response.status_code in [500, 503]:
                time.sleep(2)
                continue

            if response.status_code != 200:
                try:
                    error_data = response.json()
                    error_message = error_data.get("error", {}).get("message", "Unknown error")
                except Exception:
                    error_message = response.text

                print("Gemini error:", response.status_code, error_message)
                return f"❌ AI error: {error_message}"

            data = response.json()

            # Safety check (important)
            if "candidates" not in data or not data["candidates"]:
                return "⚠️ AI response blocked or empty."

            return data["candidates"][0]["content"]["parts"][0]["text"]

        return "❌ AI service temporarily unstable. Please try again."

    except requests.exceptions.Timeout:
        return "❌ AI request timed out."

    except Exception as e:
        print("Unexpected error:", str(e))
        return "❌ Something went wrong. Please try again later."
