from rest_framework import serializers
from apps.accounts.models import User, WalletHistory, Wallet
from apps.groups.models import Group
from apps.transcription_notes.models import Notes
from apps.subscriptions.models import CreditPurchase, CreditUsageHistory

class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_superuser', 'is_active']

class AdminUserListSerializer(serializers.ModelSerializer):
    profile_pic = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_superuser",
            "is_staff",
            "is_active",
            "date_joined",
            "last_login",
            "profile_pic",
        ]

    def get_profile_pic(self, obj):
        if obj.profile_pic:
            return obj.profile_pic.url
        return None

class AdminCreateUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "password",
            "is_active",
        ]

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    # 📧 Email validation
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value
    
    # 👤 Create user safely
    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            password=validated_data["password"],
            is_active=validated_data.get("is_active", True),
            is_superuser=validated_data.get("is_superuser", True)
        )
    
class AdminEditUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_active",
            "is_superuser",
        ]

    def update(self, instance, validated_data):
        instance.username = validated_data.get("username", instance.username)
        instance.email = validated_data.get("email", instance.email)
        instance.first_name = validated_data.get("first_name", instance.first_name)
        instance.last_name = validated_data.get("last_name", instance.last_name)
        instance.is_active = validated_data.get("is_active", instance.is_active)
        instance.is_superuser = validated_data.get("is_superuser", instance.is_superuser)

        instance.save()
        return instance
    
class WalletHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = WalletHistory
        fields = [
            "id",
            "transaction_type",
            "amount",
            "purpose",
            "reference_id",
            "status",
            "created_at",
            "updated_at"
        ]

class WalletSerializer(serializers.ModelSerializer):
    user = AdminUserSerializer(read_only=True)
    history = WalletHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Wallet
        fields = [
            "id",
            "user",
            "balance",
            "history",
            "created_at",
            "updated_at"
        ]

class AdminGroupSerializer(serializers.ModelSerializer):
    admin_name = serializers.SerializerMethodField()
    admin_id = serializers.SerializerMethodField()
    total_members = serializers.IntegerField(read_only=True)
    total_messages = serializers.IntegerField(read_only=True)

    class Meta:
        model = Group
        fields = [
            "id",
            "name",
            "description",
            "type",
            "status",
            "created_at",

            "admin_name",
            "admin_id",
            "total_members",
            "total_messages",
        ]

    def get_admin_name(self, obj):
        return obj.created_by.username if getattr(obj, "created_by", None) else None

    def get_admin_id(self, obj):
        return getattr(obj.created_by, "id", None)

class AdminNotesSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()

    class Meta:
        model = Notes
        fields = "__all__"

class AdminLiveTranscriptionSerializer(serializers.Serializer):
    user_id = serializers.UUIDField()
    username = serializers.CharField()
    total_count = serializers.IntegerField()

class AdminUploadStatsSerializer(serializers.Serializer):
    user_id = serializers.IntegerField(source='id')
    username = serializers.CharField()
    total_count = serializers.IntegerField()

class RecentPurchaseSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    bundle_name = serializers.CharField(source='Credit_bundle_id.name', read_only=True)

    class Meta:
        model = CreditPurchase
        fields = ['user_email', 'bundle_name', 'total_amount', 'status', 'created_at']
    
class CreditUsageHistorySerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = CreditUsageHistory
        fields = [
            'id', 
            'user', 
            'user_email', 
            'credits_used', 
            'purpose', 
            'created_at'
        ]

class AdminCreditPurchaseSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    bundle_name = serializers.CharField(source='Credit_bundle_id.name', read_only=True)

    class Meta:
        model = CreditPurchase
        fields = [
            'id', 
            'user', 
            'user_email', 
            'bundle_name', 
            'credits_purchased', 
            'total_amount', 
            'status', 
            'payment_id', 
            'created_at'
        ]