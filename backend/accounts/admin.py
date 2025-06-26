from django.contrib import admin
from .models import Conversation, Message

# Register your models here.

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('user',)
    search_fields = ('user__username', 'user__email')
    list_filter = ('user',)

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('conversation', 'sender', 'timestamp')
    search_fields = ('conversation__user__username', 'content')
    list_filter = ('sender', 'timestamp')
    ordering = ('-timestamp',)