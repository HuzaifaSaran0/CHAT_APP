from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import BaseUserManager



class CustomUserManager(BaseUserManager):
    def create_user(self, email, name, password=None, age=None, **extra_fields):
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, age=age, **extra_fields)
        # user.set_password(password)
        if password:  # 🔐 Only set password if provided
            user.set_password(password)
        else:
            user.set_unusable_password() 
        user.save()
        return user

    def create_superuser(self, email, name, password=None, age=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, name, password, age, **extra_fields)

class CustomUser(AbstractUser):
    # Remove username field and make email the unique identifier
    username = None
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100)
    age = models.PositiveIntegerField(
        null=True, 
        blank=True,
        choices=[(i, str(i)) for i in range(18, 81)]  # Choices from 18 to 80
    )
    # is_email_verified = models.BooleanField(default=False)

    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']
    
    objects = CustomUserManager()  # Add this line

    def __str__(self):
        return self.email

class Conversation(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)

    def __str__(self):
        return f"Conversation with {self.user.email}"

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE)
    sender = models.CharField(max_length=10)  # 'user' or 'assistant'
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']