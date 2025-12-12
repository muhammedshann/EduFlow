# habits/serializers.py
from rest_framework import serializers
from .models import Group, GroupMessage
from django.utils import timezone
from accounts.models import User

class GroupsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ["id","name","description","type","status","created_by","created_at"]

class GroupMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupMessage
        fields = ["id",'group', 'message', 'user', 'created_at']