from rest_framework import serializers
from .models import BatchComment, Comment, CorrectedSentiment
from django.contrib.auth.models import User

class BatchCommentSerializer(serializers.ModelSerializer):
    username=serializers.SerializerMethodField()
    class Meta:
        model = BatchComment
        fields = ['id', 'user','batchname','comment_type', 'date_created', 'overall_sentiment','username']
        read_only_fields = ['id', 'user', 'date_created']
    def get_username(self,obj):
        return obj.user.username if obj.user else None
    
class CommentSerializer(serializers.ModelSerializer):
    username=serializers.SerializerMethodField()
    batchname=serializers.SerializerMethodField()
    feedback_verified=serializers.SerializerMethodField()
    corrected_sentiment=serializers.SerializerMethodField()
    predicted_sentiment=serializers.SerializerMethodField()
    class Meta:
        model = Comment
        fields = ['id','user','batch', 'comment', 'cleaned_text', 'sentiment', 'score', 'date_created', 'updated_at', 'is_updated','comment_type','feedback_verified','corrected_sentiment','predicted_sentiment','username','batchname']
        read_only_fields = ['id','user','batch', 'date_created', 'updated_at', 'is_updated','comment_type']
        
    def get_username(self,obj):
        return obj.user.username if obj.user else None
    def get_batchname(self,obj):
        return obj.batch.batchname if obj.batch else None
    def get_feedback_verified(self, obj):
        correction = CorrectedSentiment.objects.filter(comment=obj).first()
        return correction.feedback_verified if correction else None
    def get_corrected_sentiment(self, obj):
        correction = CorrectedSentiment.objects.filter(comment=obj).first()
        return correction.corrected_sentiment if correction else None
    def get_predicted_sentiment(self, obj):
        correction = CorrectedSentiment.objects.filter(comment=obj).first()
        return correction.predicted_sentiment if correction else None

# New Serializer for Corrected Sentiment
class CorrectedSentimentSerializer(serializers.ModelSerializer):
    class Meta:
        model = CorrectedSentiment
        fields = ['id', 'user','comment', 'comment_text', 'predicted_sentiment', 'corrected_sentiment', 'corrected_at','feedback_verified']
        read_only_fields = ['id', 'corrected_at','feedback_verified']