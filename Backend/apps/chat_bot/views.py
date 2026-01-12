import os
import google.generativeai as genai
from rest_framework.views import APIView
from rest_framework.response import Response
from dotenv import load_dotenv
from .models import ChatBotMessage
from rest_framework.permissions import IsAuthenticated
from .serializers import ChatBotMessageSerializer

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class ChatBotView(APIView):
    def post(self, request):
        user_message = request.data.get("message")
        print('inside of notmal view ',user_message)
        
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        try:
            response = model.generate_content(user_message)
            return Response({"reply": response.text})
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class ChatHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        messages = (
            ChatBotMessage.objects
            .filter(user=request.user)
            .order_by("created_at")
        )

        serializer = ChatBotMessageSerializer(messages, many=True)
        return Response(serializer.data)
    
class ChatClearView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        messages = (
            ChatBotMessage.objects
            .filter(user=request.user)
        )
        messages.delete()

        return Response('chat cleared')