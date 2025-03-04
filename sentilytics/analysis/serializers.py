from rest_framework import serializers
from .models import SingleComment,BatchComment,Comment

class singleCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model=SingleComment
        fields = ['id', 'user', 'comment', 'cleaned_text', 'sentiment','Score','date_created']
        read_only_fields = ['id', 'user', 'date_created'] 


class BatchCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = BatchComment
        fields = ['id', 'user', 'comment_type', 'date_created','over_all_sentiment']
        read_only_fields=['__all__']

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'batch', 'comment', 'cleaned_text', 'sentiment','score', 'date_created']