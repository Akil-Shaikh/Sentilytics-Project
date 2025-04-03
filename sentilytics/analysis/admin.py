from django.contrib import admin
from .models import BatchComment, Comment, CorrectedSentiment
import csv
from django.http import HttpResponse
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'date_joined', 'is_staff', 'is_active','is_superuser')
    ordering = ('-date_joined',)
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)

def export_to_csv(modeladmin, request, queryset):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="exported_data.csv"'
    
    writer = csv.writer(response)
    
    # Write header row
    fields = [field.name for field in modeladmin.model._meta.fields]
    writer.writerow(fields)
    
    # Write data rows
    for obj in queryset:
        writer.writerow([getattr(obj, field) for field in fields])
    
    return response


@admin.register(BatchComment)
class BatchCommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'comment_type', 'overall_sentiment', 'date_created')
    search_fields = ('comment_type', 'overall_sentiment')
    list_filter = ('comment_type', 'overall_sentiment', 'date_created')
    readonly_fields = ('date_created',)
    actions = [export_to_csv]

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'batch_id', 'comment', 'sentiment', 'score', 'date_created', 'updated_at', 'is_updated','comment_type')
    search_fields = ('comment', 'sentiment','comment_type')
    list_filter = ('sentiment', 'is_updated', 'date_created','comment_type')
    readonly_fields = ('date_created', 'updated_at')
    actions = [export_to_csv]
    def batch_id(self, obj):
        return f'B-{obj.batch.id}' if obj.batch else None

@admin.register(CorrectedSentiment)
class CorrectedSentimentAdmin(admin.ModelAdmin):
    list_display = ('id', 'user','comment_text', 'predicted_sentiment', 'corrected_sentiment', 'corrected_at', 'feedback_verified', 'comment')
    search_fields = ('comment_text', 'predicted_sentiment', 'corrected_sentiment')
    list_filter = ('feedback_verified', 'corrected_at')
    readonly_fields = ('corrected_at',)
    list_editable=('feedback_verified',)
    list_per_page=20
    ordering=('-corrected_sentiment',)
    actions = [export_to_csv]