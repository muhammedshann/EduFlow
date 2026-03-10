import os
import aiohttp
import asyncio
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# Changed to flash for testing. Change back to pro once you confirm it works!
GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/"
    "models/gemini-2.5-flash:generateContent"
)

async def call_gemini(prompt: str) -> str:
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        logger.error("API Key missing from environment variables.")
        return "❌ API key not configured."

    if not prompt.strip():
        return "⚠️ Please enter a valid question."

    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }

    try:
        # Natively async HTTP client
        async with aiohttp.ClientSession() as session:
            for attempt in range(3):
                async with session.post(
                    f"{GEMINI_URL}?key={api_key}",
                    headers=headers,
                    json=payload,
                    timeout=60
                ) as response:

                    if response.status == 429:
                        logger.warning("Hit Gemini rate limit (429).")
                        return "⚠️ Too many requests. Please check your AI API quota."

                    if response.status in [500, 503]:
                        await asyncio.sleep(2)
                        continue

                    data = await response.json()

                    if response.status != 200:
                        error_msg = data.get("error", {}).get("message", "Unknown error")
                        logger.error(f"Gemini API Error {response.status}: {error_msg}")
                        return f"❌ AI error: {error_msg}"

                    if "candidates" not in data or not data["candidates"]:
                        logger.warning("Empty candidates. Likely blocked by safety settings.")
                        return "⚠️ AI response blocked or empty."

                    return data["candidates"][0]["content"]["parts"][0]["text"]

            return "❌ AI service temporarily unstable after 3 retries."

    except asyncio.TimeoutError:
        logger.error("Gemini API request timed out.")
        return "❌ AI request timed out."

    except Exception as e:
        logger.error(f"Unexpected error in call_gemini: {str(e)}")
        return "❌ Something went wrong. Please try again later."