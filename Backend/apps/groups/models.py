from django.db import models
from apps.accounts.models import User
import uuid

class Group(models.Model):
    STATUS_CHOICES = (
        ("active", "Active"),
        ("archived", "Archived"),
    )

    TYPE_CHOICES = (
        ("private", "Private"),
        ("public", "Public"),
    )

    id = models.CharField(primary_key=True, max_length=50)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    type = models.CharField(max_length=255, choices=TYPE_CHOICES, blank=True, null=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")

    created_by = models.ForeignKey(User,on_delete=models.CASCADE, null=True, related_name="groups_created")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class GroupMember(models.Model):
    ROLE_CHOICES = (
        ("member", "Member"),
        ("admin", "Admin"),
    )

    id = models.CharField(primary_key=True, max_length=50, default=uuid.uuid4)

    group = models.ForeignKey(Group,on_delete=models.CASCADE,related_name="members")
    user = models.ForeignKey(User,on_delete=models.CASCADE,related_name="group_memberships")

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="member")
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("group", "user")

    def __str__(self):
        return f"{self.user} in {self.group} ({self.role})"

class GroupMessage(models.Model):
    id = models.CharField(primary_key=True, max_length=50, default=uuid.uuid4, editable=False)

    group = models.ForeignKey(Group,on_delete=models.CASCADE,related_name="messages")
    user = models.ForeignKey(User,on_delete=models.SET_NULL,null=True,blank=True,related_name="group_messages")

    message = models.TextField()
    image = models.ImageField(upload_to="group_messages/images/",blank=True,null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Msg in {self.group.name} by {self.user}"
