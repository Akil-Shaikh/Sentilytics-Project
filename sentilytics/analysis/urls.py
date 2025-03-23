from django.urls import path
from .views import (
    SingleCommentAnalysis,
    MultipleCommentsAnalysis,
    Batch,
    YoutubeCommentsAnalysis,
    DownloadAPIView,
    UserDashboardStats
)

# generate_visualizations
urlpatterns = [
    path('single/',SingleCommentAnalysis.as_view()),
    path('single/<int:pk>/',SingleCommentAnalysis.as_view()),
    path('analyze/multiple/',MultipleCommentsAnalysis.as_view()),
    path('analyze/multipleYoutube/',YoutubeCommentsAnalysis.as_view()),
    path('multiple/batch/',Batch.as_view()),
    path('multiple/batch/<int:batch_id>/',Batch.as_view()),
    path('multiple/batch/<int:batch_id>/<int:pk>/',Batch.as_view()),
    path('download/<int:batch_id>/',DownloadAPIView.as_view()),
    path("dashboard-stats/", UserDashboardStats.as_view(), name="user_dashboard_stats"),
]