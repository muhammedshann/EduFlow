from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView, RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils.timezone import now
from rest_framework.parsers import MultiPartParser, FormParser
from .tasks import transcribe_media

from .models import Notes,LiveTranscription, UploadTranscription
from .serializers import TranscriptionCreateSerializer, NotesSerializer, MediaUploadSerializer, NoteCreateSerializer


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
        note_type = request.data.get("type")

        if not note_title:
            return Response(
                {"error": "Note title is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ✅ duplicate check scoped to user, type, and title
        if Notes.objects.filter(user=request.user, type=note_type, title=note_title).exists():
            return Response(
                {"error": "A note with this title already exists in your records"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = NoteCreateSerializer(
            data=request.data,
            context={"request": request}
        )

        if serializer.is_valid():
            note = serializer.save()
            return Response(
                {"id": note.id, "message": "Note saved successfully"},
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
    
class MediaUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        serializer = MediaUploadSerializer(data=request.data)
        if serializer.is_valid():
            media = serializer.save(user=request.user)
            transcribe_media.delay(media.id)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MediaDetailView(APIView):
    def get(self, request, pk):
        media = UploadTranscription.objects.get(pk=pk)
        return Response(MediaUploadSerializer(media).data)