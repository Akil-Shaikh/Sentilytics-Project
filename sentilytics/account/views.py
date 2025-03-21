from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import userSerializer
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from account.utils import is_valid_password,is_valid_email,is_valid_username

@api_view(['POST'])
def register(request):
    data = request.data
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    
    username_error = is_valid_username(username)
    if username_error:
        return Response({"error": username_error}, status=status.HTTP_400_BAD_REQUEST)

    email_error = is_valid_email(email)
    if email_error:
        return Response({"error": email_error}, status=status.HTTP_400_BAD_REQUEST)
    
    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)
    
    if User.objects.filter(email=email).exists():
        return Response({"error": "Email already registered"}, status=status.HTTP_400_BAD_REQUEST)
    
    password_error = is_valid_password(password)
    if password_error:
        return Response({"error": password_error}, status=status.HTTP_400_BAD_REQUEST)
    user = User.objects.create_user(
        username=data.get("username"),
        email=data.get("email"),
        password=data.get("password")
    )
    
    token, created = Token.objects.get_or_create(user=user)
    return Response({"success": "Registered successfully", "token": token.key},status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    request.user.auth_token.delete()
    return Response({"success": "Logged out successfully"},status=status.HTTP_200_OK)
