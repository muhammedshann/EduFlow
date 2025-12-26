from rest_framework import serializers
from .models import Review
    
class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    profile_pic = serializers.SerializerMethodField()
    class Meta:
        model = Review
        fields = ['id','user','rating','title','comment','created_at','updated_at','username','profile_pic']
    
    def get_username(self, obj):
        if obj.user:
            return obj.user.username
        return None
    
    def get_profile_pic(self, obj):
        request = self.context.get("request")
        return request.build_absolute_uri(obj.user.profile_pic.url) if obj.user and obj.user.profile_pic else None
