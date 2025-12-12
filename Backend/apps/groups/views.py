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
        group_message_serializer = GroupMessageSerializer(group_messages, many=True)

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