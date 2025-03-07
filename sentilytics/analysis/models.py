from django.db import models
from django.contrib.auth.models import User

class SingleComment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Links to registered user
    comment = models.TextField()  # Original comment
    cleaned_text = models.TextField(blank=True, null=True)  # Preprocessed text after cleaning
    sentiment = models.CharField(max_length=20)  # Sentiment result (positive, negative, neutral)
    Score = models.FloatField(default=0)
    date_created = models.DateTimeField(auto_now_add=True)  # Timestamp
    updated_at = models.DateTimeField(auto_now=True)
    is_updated = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if self.pk and self.is_updated:
            raise ValueError("You can only update your comment once.")
        if self.pk:
            self.is_updated = True
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - {self.sentiment}"

# Batch Comment Model (for multiple and YouTube comments)
class BatchComment(models.Model):
    COMMENT_TYPE_CHOICES = [
        ('CSV File', 'CSV'),
        ('Excel File', 'Excel'),
        ('Youtube', 'YouTube'),
    ]
    SENTIMENT_CHOICES = [
        ('positive', '+ve'),
        ('negative', '-ve'),
        ('neutral', 'N/A'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Links to registered user
    comment_type = models.CharField(max_length=20, choices=COMMENT_TYPE_CHOICES)  # Type of batch
    date_created = models.DateTimeField(auto_now_add=True)  # Timestamp
    over_all_sentiment = models.CharField(max_length=20, choices=SENTIMENT_CHOICES, default='none')

    def __str__(self):
        return f"{self.user.username} - {self.comment_type} - {self.date_created}"

# Comment Model (stores individual comments from a batch)
class Comment(models.Model):
    batch = models.ForeignKey(BatchComment, on_delete=models.CASCADE, related_name="comments")  # Links to batch
    comment = models.TextField()  # Original comment
    cleaned_text = models.TextField(blank=True, null=True)  # Preprocessed text
    sentiment = models.CharField(max_length=20)  # Sentiment result
    score = models.FloatField(default=0)
    date_created = models.DateTimeField(auto_now_add=True)  # Timestamp
    updated_at = models.DateTimeField(auto_now=True)
    is_updated = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if self.pk and self.is_updated:
            raise ValueError("You can only update your comment once.")
        if self.pk:
            self.is_updated = True
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.batch.comment_type} - {self.sentiment}"

# New Model: Corrected Sentiment
class CorrectedSentiment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # User who corrected the sentiment
    batch = models.ForeignKey(BatchComment,null=True,blank=True ,on_delete=models.CASCADE) 
    original_comment = models.TextField()  # Original comment text
    predicted_sentiment = models.CharField(max_length=20)  # Sentiment predicted by the model
    corrected_sentiment = models.CharField(max_length=20)  # User-corrected sentiment
    corrected_at = models.DateTimeField(auto_now_add=True)  # Timestamp of correction

    def __str__(self):
        return f"{self.user.username} corrected {self.predicted_sentiment} to {self.corrected_sentiment}"
