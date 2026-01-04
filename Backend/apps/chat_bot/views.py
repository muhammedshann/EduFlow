import os
import google.generativeai as genai
from rest_framework.views import APIView
from rest_framework.response import Response
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class ChatBotView(APIView):
    def post(self, request):
        print('--------------inside')
        user_message = request.data.get("message")
        print(user_message)
        
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        try:
            response = model.generate_content(user_message)
            return Response({"reply": response.text})
        except Exception as e:
            return Response({"error": str(e)}, status=500)