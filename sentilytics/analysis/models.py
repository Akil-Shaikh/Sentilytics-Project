from django.db import models
from django.contrib.auth.models import User

# Batch Comment Model (for multiple and YouTube comments)
class BatchComment(models.Model):
    COMMENT_TYPE_CHOICES = [
        ('CSV File', 'CSV'),
        ('Excel File', 'Excel'),
        ('Youtube', 'YouTube'),
    ]
    SENTIMENT_CHOICES = [
        ('positive', 'positive'),
        ('negative', 'negative'),
        ('neutral', 'neutral'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Links to registered user
    batchname=models.CharField(max_length=30,blank=False,null=False)
    comment_type = models.CharField(max_length=20, choices=COMMENT_TYPE_CHOICES)  # Type of batch
    date_created = models.DateTimeField(auto_now_add=True)  # Timestamp
    overall_sentiment = models.CharField(max_length=20, choices=SENTIMENT_CHOICES, default='none')

    def __str__(self):
        return f"{self.user.username} - {self.comment_type} - {self.date_created}"

# Comment Model (stores individual comments from a batch)
class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    batch = models.ForeignKey(BatchComment, null= True,blank=True ,on_delete=models.CASCADE, related_name="comments")  # Links to batch
    comment = models.TextField()  # Original comment
    cleaned_text = models.TextField(blank=True, null=True)  # Preprocessed text
    sentiment = models.CharField(max_length=20)  # Sentiment result
    score = models.FloatField(default=0)
    date_created = models.DateTimeField(auto_now_add=True)  # Timestamp
    updated_at = models.DateTimeField(auto_now=True)
    is_updated = models.BooleanField(default=False)
    comment_type = models.CharField(max_length=20, choices=[('single', 'Single'), ('batch', 'Batch')], default='single')

    def __str__(self):
        if self.batch:
            return f"{self.batch.comment_type} - {self.sentiment}"
        return f"Single Comment - {self.sentiment}"

# New Model: Corrected Sentiment
class CorrectedSentiment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # User who corrected the sentiment
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name="corrected_comment")
    comment_text = models.TextField()  # Original comment text
    predicted_sentiment = models.CharField(max_length=20)  # Sentiment predicted by the model
    corrected_sentiment = models.CharField(max_length=20)  # User-corrected sentiment
    corrected_at = models.DateTimeField(auto_now_add=True)  # Timestamp of correction
    feedback_verified = models.BooleanField(null=True, blank=True)
    
    def save(self, *args, **kwargs):
        # If feedback_verified is False, revert the sentiment to original (prediction was correct)
        if self.feedback_verified is not None:
            if self.feedback_verified:
                self.comment.sentiment = self.corrected_sentiment
                self.comment.score = 0
            else:
                self.comment.sentiment = self.predicted_sentiment
            self.comment.save()

        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.user.username} corrected {self.predicted_sentiment} to {self.corrected_sentiment}"