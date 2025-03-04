from django.urls import path

from .views import singleCommentAnalysis,user_single_comments,multipleCommentsAnalysis,user_batch,batch_comments,youtube_analysis
# generate_visualizations
urlpatterns = [
    path('analyze/single/',singleCommentAnalysis),
    path('get/single/user/',user_single_comments),
    path('analyze/multiple/',multipleCommentsAnalysis),
    path('analyze/multipleYoutube/',youtube_analysis),
    path('get/multiple/batch/',user_batch),
    path('get/multiple/batch/<int:batch_id>/',batch_comments),
]