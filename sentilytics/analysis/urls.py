from django.urls import path

from .views import SingleCommentAnalysis,MultipleCommentsAnalysis,Batch,YoutubeCommentsAnalysis
# generate_visualizations
urlpatterns = [
    path('single/',SingleCommentAnalysis.as_view()),
    path('single/<int:pk>/',SingleCommentAnalysis.as_view()),
    # path('get/single/user/',user_single_comments),
    path('analyze/multiple/',MultipleCommentsAnalysis.as_view()),
    path('analyze/multipleYoutube/',YoutubeCommentsAnalysis.as_view()),
    path('multiple/batch/',Batch.as_view()),
    path('multiple/batch/<int:batch_id>/',Batch.as_view()),
    path('multiple/batch/<int:batch_id>/<int:pk>/',Batch.as_view()),
]