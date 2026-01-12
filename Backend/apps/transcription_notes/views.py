from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils.timezone import now

from .models import Notes,LiveTranscription
from .serializers import TranscriptionCreateSerializer, NotesSerializer


class LiveTranscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self,request):
        today = now().date()
        transcription, created = LiveTranscription.objects.get_or_create(user=request.user,created_at__date=today, defaults={"count": 1})

        if not created:
            transcription.count += 1
            transcription.save(update_fields=["count"])

        return Response(
            {
                "count_today": transcription.count,
            },
            status=200,
        )


class NoteCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        note_title = request.data.get("title")

        if not note_title:
            return Response(
                {"error": "note title is empty"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ✅ SAFE duplicate check
        already_saved = Notes.objects.filter(
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
        notes = Notes.objects.filter(user=request.user)
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
        note = get_object_or_404(Notes, id=note_id)
        note.delete()
        return Response(
            'note deleted',
            status=status.HTTP_200_OK
        )

class NoteDetailView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotesSerializer

    def get_queryset(self):
        return Notes.objects.filter(user=self.request.user)
    
class NoteUpdateView(RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotesSerializer

    def get_queryset(self):
        return Notes.objects.filter(user=self.request.user)