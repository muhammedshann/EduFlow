# habits/serializers.py
from rest_framework import serializers
from .models import Group, GroupMessage
from django.utils import timezone
from apps.accounts.models import User

class GroupsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ["id","name","description","type","status","created_by","created_at"]

class GroupMessageSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    profile_pic = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    timestamp = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = GroupMessage
        fields = [
            "id",
            "group",
            "message",
            "user",
            "username",
            "profile_pic",
            "image",
            "timestamp",
        ]

    def get_username(self, obj):
        if obj.user:
            return obj.user.username
        return None
    
    def get_profile_pic(self, obj):
        request = self.context.get("request")
        return request.build_absolute_uri(obj.user.profile_pic.url) if obj.user and obj.user.profile_pic else None
    
    def get_image(self, obj):
        if obj.image:
            request = self.context.get("request")
            return request.build_absolute_uri(obj.image.url)
        return None
