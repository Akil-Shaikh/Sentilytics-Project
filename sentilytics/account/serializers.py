from rest_framework import serializers
from django.contrib.auth.models import User

class userSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields=['id','username','email','password','is_active','is_superuser']
        extra_kwargs={"password":{'write_only':True}}
    def create(self, validated_data):
        user=User(username=validated_data['username'],email=validated_data['email'])
        user.set_password(validated_data['password'])
        user.save()
        return user