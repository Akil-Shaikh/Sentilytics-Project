from rest_framework import serializers
from .models import BatchComment, Comment, CorrectedSentiment

class BatchCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = BatchComment
        fields = ['id', 'user', 'comment_type', 'date_created', 'overall_sentiment']
        read_only_fields = ['id', 'user', 'date_created']

class CommentSerializer(serializers.ModelSerializer):
    feedback_verified=serializers.SerializerMethodField()
    class Meta:
        model = Comment
        fields = ['id','user','batch', 'comment', 'cleaned_text', 'sentiment', 'score', 'date_created', 'updated_at', 'is_updated','comment_type','feedback_verified']
        read_only_fields = ['id','user','batch', 'date_created', 'updated_at', 'is_updated','comment_type']
        
    def get_feedback_verified(self, obj):
        correction = CorrectedSentiment.objects.filter(comment=obj).first()
        return correction.feedback_verified if correction else None

# New Serializer for Corrected Sentiment
class CorrectedSentimentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CorrectedSentiment
        fields = ['id', 'user','comment', 'comment_text', 'predicted_sentiment', 'corrected_sentiment', 'corrected_at','feedback_verified']
        read_only_fields = ['id', 'corrected_at','feedback_verified']