from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import Transcription
from .serializers import TranscriptionCreateSerializer, NotesSerializer


class LiveTranscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        note_title = request.data.get("title")

        if not note_title:
            return Response(
                {"error": "note title is empty"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ✅ SAFE duplicate check
        already_saved = Transcription.objects.filter(
            user=request.user,
            type="live",
            title=note_title
        ).exists()

        if already_saved:
            return Response(
                {"error": "This title is already saved"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = TranscriptionCreateSerializer(
            data=request.data,
            context={"request": request}
        )

        if not serializer.is_valid():
            print(serializer.errors)
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        transcription = serializer.save()

        return Response(
            {"id": transcription.id},
            status=status.HTTP_201_CREATED
        )

class NotesView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request):
        notes = Transcription.objects.filter(user=request.user)
        serializer  = NotesSerializer(notes, many=True)
        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )
    
    def delete(self,request):
        note_id = request.data.get('id')
        if not note_id:
            return Response(
                'note not defined',
                status=status.HTTP_400_BAD_REQUEST
            )
        note = get_object_or_404(Transcription, id=note_id)
        note.delete()
        return Response(
            'note deleted',
            status=status.HTTP_200_OK
        )

class NoteDetailView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotesSerializer

    def get_queryset(self):
        return Transcription.objects.filter(user=self.request.user)
    
class NoteUpdateView(RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotesSerializer

    def get_queryset(self):
        return Transcription.objects.filter(user=self.request.user)