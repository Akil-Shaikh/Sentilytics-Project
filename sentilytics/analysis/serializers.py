from rest_framework import serializers
from .models import SingleComment, BatchComment, Comment, CorrectedSentiment

class SingleCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SingleComment
        fields = ['id', 'user', 'comment', 'cleaned_text', 'sentiment', 'Score', 'date_created', 'updated_at', 'is_updated']
        read_only_fields = ['id', 'user', 'date_created', 'updated_at', 'is_updated']

class BatchCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = BatchComment
        fields = ['id', 'user', 'comment_type', 'date_created', 'over_all_sentiment']
        read_only_fields = ['id', 'user', 'date_created']

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'batch', 'comment', 'cleaned_text', 'sentiment', 'score', 'date_created', 'updated_at', 'is_updated']
        read_only_fields = ['id', 'batch', 'date_created', 'updated_at', 'is_updated']

# New Serializer for Corrected Sentiment
class CorrectedSentimentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CorrectedSentiment
        fields = ['id', 'user','batch', 'original_comment', 'predicted_sentiment', 'corrected_sentiment', 'corrected_at']
        read_only_fields = ['id', 'corrected_at']
