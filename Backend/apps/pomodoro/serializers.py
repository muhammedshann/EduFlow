from rest_framework import serializers
from .models import PomodoroSettings, PomodoroSession

class PomodoroSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PomodoroSettings
        fields = ['focus_minutes','break_minutes','status']

    def validate(self, attrs):
        focus = attrs.get('focus_minutes', self.instance.focus_minutes if self.instance else None)
        break_time = attrs.get('break_minutes', self.instance.break_minutes if self.instance else None)

        if focus is not None and focus < 1:
            raise serializers.ValidationError("Focus time must be at least 1 minute.")
        if break_time is not None and break_time < 1:
            raise serializers.ValidationError("Break time must be at least 1 minute.")
        return attrs
    
class PomodoroSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PomodoroSession
        fields = "__all__"
        read_only_fields = ("user",)