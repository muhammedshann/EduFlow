from django.utils.timezone import now
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils.timezone import now
from django.utils import timezone
from .serializer import GroupsSerializer, GroupMessageSerializer
from datetime import timedelta
from .models import Group, GroupMember, GroupMessage
import uuid
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from rest_framework.parsers import MultiPartParser, FormParser


class GroupsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request):
        public_groups = Group.objects.filter(type='public')
        created_groups = Group.objects.filter(created_by = request.user)
        joined_groups = Group.objects.filter(members__user = request.user).exclude(created_by=request.user)

        return Response({
            "created_groups": GroupsSerializer(created_groups, many=True).data,
            "joined_groups": GroupsSerializer(joined_groups, many=True).data,
            "public_groups": GroupsSerializer(public_groups, many=True).data,
        })
    
    def post(self, request):
        user = request.user
        name = request.data.get('name')
        description = request.data.get('description')
        type = request.data.get('type')

        if not name:
            return Response({"error": "Group name required"}, status=400)
        
        group = Group.objects.create(
            id=uuid.uuid4().hex[:12],
            name=name,
            description=description,
            type=type,
            created_by=user
        )

        GroupMember.objects.create(
            id=uuid.uuid4().hex[:12],
            group=group,
            user=user,
            role="member"
        )

        return Response({"message": "Group created", "group_id": group.id}, status=201)

class GroupDetailsView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self,request):
        group_id = request.data.get('id')

        if not group_id:
            return Response({"error": "Group ID is required"}, status=400)
        
        try :
            group = Group.objects.get(id=group_id)
        except Group.DoesNotExist:
            return Response({"error": "Group not found"}, status=404)
    
        member, created = GroupMember.objects.get_or_create(group=group,user=request.user, defaults={"role": "member"})

        group_messages = GroupMessage.objects.filter(group=group)

        users_count = GroupMember.objects.filter(group=group).count()
        serializer = GroupsSerializer(group)
        group_message_serializer = GroupMessageSerializer(group_messages, many=True, context={"request": request})

        return Response({'group': serializer.data,'users_count': users_count,'group_messages':group_message_serializer.data}, status=200)

class LeaveGroupView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        group_id = request.data.get('id')
        if not group_id:
            return Response({"error": "Group ID is required"}, status=400)

        try:
            group = Group.objects.get(id = group_id)
        except Group.DoesNotExist:
            return Response({"error": "Group not found"}, status=404)
        
        try:
            member = GroupMember.objects.get(group=group, user=request.user)
        except GroupMember.DoesNotExist:
            return Response({"error": "You are not a member of this group"}, status=400)
        member.delete()

        remining_members = GroupMember.objects.filter(group=group).count()
        if group.created_by == request.user:
            group.created_by = None
            group.save()
        if group.type == 'private':
            if remining_members == 0:
                group.delete()
        return Response({"message": "Successfully left the group"},status=200)
    

class sendImageGroupView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        group_id = request.data.get("group_id")
        image = request.FILES.get("image")

        if not group_id:
            return Response({"error": "group_id missing"}, status=400)

        if not image:
            return Response({"error": "image missing"}, status=400)

        msg = GroupMessage.objects.create(
            group_id=group_id,
            user=request.user,
            image=image
        )

        channel_layer = get_channel_layer()

        async_to_sync(channel_layer.group_send)(
            f"chat_{group_id}",
            {
                "type": "chat_message",
                "message": None,
                "image": request.build_absolute_uri(msg.image.url),
                "username": request.user.username,
                "timestamp": msg.created_at.isoformat(),
            }
        )

        return Response({"success": True}, status=201)