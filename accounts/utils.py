from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.urls import reverse
import re

def generate_verification_link(user, request):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    relative_link = reverse('verify_email', kwargs={'uidb64': uid, 'token': token})
    return request.build_absolute_uri(relative_link)

def is_image_url(text):
    image_pattern = re.compile(r'(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|bmp))$', re.IGNORECASE)
    return bool(image_pattern.match(text.strip()))

def is_audio_url(text):
    audio_pattern = re.compile(r'(https?:\/\/.*\.(?:mp3|wav|ogg|m4a))$', re.IGNORECASE)
    return bool(audio_pattern.match(text.strip()))