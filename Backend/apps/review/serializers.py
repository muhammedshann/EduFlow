from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    profile_pic = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            'id',
            'rating',
            'title',
            'comment',
            'created_at',
            'updated_at',
            'username',
            'profile_pic',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_username(self, obj):
        return obj.user.username if obj.user else None

    def get_profile_pic(self, obj):
        request = self.context.get("request")
        if request and obj.user and obj.user.profile_pic:
            return request.build_absolute_uri(obj.user.profile_pic.url)
        return None
