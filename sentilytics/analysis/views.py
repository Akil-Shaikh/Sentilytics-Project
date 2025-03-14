from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .models import SingleComment, BatchComment, Comment
from .serializers import SingleCommentSerializer,BatchCommentSerializer,CommentSerializer,CorrectedSentimentSerializer
from rest_framework.permissions import IsAuthenticated
from analysis.utils import sentiment_model,tfidf_vectorizer
from django.db.models import Count
from sentilytics.settings import YOUTUBE_API_KEY

from django.core.exceptions import ObjectDoesNotExist #?
import traceback

import pandas as pd
import re
from googleapiclient.discovery import build

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from wordcloud import WordCloud
from io import BytesIO
import base64

import nltk
from nltk.stem import WordNetLemmatizer
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
nltk.download("stopwords")
nltk.download("wordnet")
nltk.download('punkt_tab')

#cleaning class
class Preprocessor:
    def __init__(self):
        self.stop_words = set(stopwords.words("english"))
        self.lemmatizer = WordNetLemmatizer()
        self.regex_pattern = re.compile(r"http\S+|www\S+|@\w+|#\w+|[^\w\s]|\d+")

    def clean_text(self, text):
        text = text.lower()
        text = self.regex_pattern.sub("", text)
        tokens = word_tokenize(text)
        cleaned_tokens = []
        negate = False
        negation_words = {"not", "no", "never", "n't"}
        for word in tokens:
            if word in negation_words:
                negate = True
            elif negate:
                cleaned_tokens.append(
                    "not_" + self.lemmatizer.lemmatize(word)
                )  # Attach "not_" to next word
                negate = False
            elif word not in self.stop_words:
                cleaned_tokens.append(self.lemmatizer.lemmatize(word))

        return " ".join(cleaned_tokens)

#instance
pre = Preprocessor()

# -----------------------------------------------------------------------------------------------------------------------------------------
#single comment analysis
class SingleCommentAnalysis(APIView):
    permission_classes=[IsAuthenticated]
    def post(self,request):
        try:
            data = request.data
            original_text = data["text"]
            cleaned_text = pre.clean_text(original_text)
            vec_text = tfidf_vectorizer.transform([cleaned_text])
            sentiment = sentiment_model.predict(vec_text)[0]
            score = sentiment_model.predict_proba(vec_text)[0]
            sentiment_map = {0:"negative",1:"neutral", 2:"positive"}
            comment_data = {
                "user": request.user.id,
                "comment": original_text,
                "cleaned_text": cleaned_text,
                "sentiment": sentiment_map[sentiment],
                "Score": round(score[sentiment], 2)
            }
            serializer = SingleCommentSerializer(data=comment_data)

            if serializer.is_valid():
                serializer.save(user=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response("Error generating analysis",status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request, pk):
        try:
            comment = SingleComment.objects.get(pk=pk)
        except SingleComment.DoesNotExist:
            return Response({"error": "Comment not found"}, status=status.HTTP_404_NOT_FOUND)

        if comment.is_updated:
            return Response({"error": "Sentiment has already been corrected once"}, status=status.HTTP_400_BAD_REQUEST)

        corrected_sentiment = request.data.get("sentiment")
        
        # Update the original SingleComment object
        if corrected_sentiment not in ["positive", "negative", "neutral"]:
            return Response({"error": "Invalid sentiment value"}, status=status.HTTP_400_BAD_REQUEST)
        
        if comment.sentiment==corrected_sentiment:
            return Response({"error": "same sentiment value as predicted"}, status=status.HTTP_400_BAD_REQUEST)
        print(request.user)
        corrected_data = {
            "user": request.user.id,
            "single_comment":comment.id,
            "comment": comment.comment,
            "predicted_sentiment": comment.sentiment,
            "corrected_sentiment": corrected_sentiment
        }
        corrected_serializer = CorrectedSentimentSerializer(data=corrected_data)
        
        if corrected_serializer.is_valid():
            corrected_serializer.save()
            comment.is_updated =True
            comment.save()
            return Response(corrected_data, status=status.HTTP_200_OK)

        return Response(corrected_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#get all single comments related to user
    def get(self,request):
        user_comments = SingleComment.objects.filter(user=request.user)
        serializer = SingleCommentSerializer(user_comments, many=True)
        return Response(serializer.data)


# -----------------------------------------------------------------------------------------------------------------------------------------
#multiple comments analysis
class MultipleCommentsAnalysis(APIView):
    permission_classes=[IsAuthenticated]
    def is_date(self,value):
        try:
            pd.to_datetime(value, errors='coerce')
            return True
        except:
            return False
    def post(self,request):
        try:
            # Ensure a file is uploaded
            if "file" not in request.FILES:
                return Response({"error": "CSV or Excel file is required."}, status=status.HTTP_400_BAD_REQUEST)

            file = request.FILES["file"]
            file_extension = file.name.split(".")[-1].lower()

            # Read file into DataFrame
            try:
                if file_extension == "csv":
                    df = pd.read_csv(file)
                    file_type = "CSV File"
                elif file_extension in ["xls", "xlsx"]:
                    df = pd.read_excel(file)
                    file_type = "Excel File"
                else:
                    return Response({"error": "Unsupported file format. Please upload a CSV or Excel file."}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({"error": f"Invalid file format: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

            # Ensure the column is provided
            column = request.data.get("column")
            if not column:
                return Response({"error": "Column name is required."}, status=status.HTTP_400_BAD_REQUEST)

            # Ensure the column exists in the DataFrame
            if column not in df.columns:
                return Response({"error": f"File must contain a '{column}' column."}, status=status.HTTP_400_BAD_REQUEST)
            
            # Ensure the file is not empty
            if df.empty or df[column].dropna().empty:
                return Response({"error": "Uploaded file is empty or does not contain valid comments."}, status=status.HTTP_400_BAD_REQUEST)

            # Ensure the file has 5 or more comments
            if df[column].shape[0] < 5:
                return Response({"error": "Uploaded file contain less then 5 valid comments."}, status=status.HTTP_400_BAD_REQUEST)
            
            # Ensure the column has string values instead of numbers
            if df[column].apply(lambda x: isinstance(x, (int, float))).mean() > 0.8:
                return Response({"error": "The selected column appears to contain mostly numbers. Please provide a valid text column."}, status=status.HTTP_400_BAD_REQUEST)
            
            # Ensure the column has string values instead of dates
            if df[column].apply(self.is_date).mean()> 0.8:
                return Response({"error": "The selected column appears to contain mostly dates. Please provide a valid text column."}, status=status.HTTP_400_BAD_REQUEST)
            
            # Preprocess text
            df["cleaned_text"] = df[column].astype(str).apply(pre.clean_text)

            # Perform Sentiment Analysis
            vec_text = tfidf_vectorizer.transform(df["cleaned_text"])
            df["sentiment"] = sentiment_model.predict(vec_text)
            sentiment_map = {0: "negative",1:"neutral",2: "positive"}
            df[["score_neg","score_neu", "score_p"]] = sentiment_model.predict_proba(vec_text)
            df["score_neg"] = df["score_neg"].round(2)
            df["score_neu"] = df["score_neu"].round(2)
            df["score_p"] = df["score_p"].round(2)
            df["sentiment"] = df["sentiment"].map(sentiment_map)

            # Sentiment Distribution Plot
            sentiment_counts = df["sentiment"].value_counts()
            buf_bar = BytesIO()
            buf_word = BytesIO()

            plt.figure(figsize=(6, 4),facecolor="lightblue")
            plt.bar(
                x=["Positive", "Negative", "Neutral"],
                height=[
                    sentiment_counts.get("positive", 0),
                    sentiment_counts.get("negative", 0),
                    sentiment_counts.get("neutral", 0),
                ],
                color=["g", "r", "grey"],
            )
            plt.title("Sentiment Distribution")
            plt.xlabel("Sentiment")
            plt.ylabel("Count")
            plt.savefig(buf_bar, format="png")
            plt.close()

            # Word Cloud Generation
            text = " ".join(df["cleaned_text"].dropna())
            if text.strip():  # Generate word cloud only if there is valid text
                wordcloud = WordCloud(width=600, height=400, background_color="floralwhite").generate(text)
                wordcloud.to_image().save(buf_word, format="PNG")
            else:
                buf_word = BytesIO()  # Empty image placeholder

            Base64_bar = base64.b64encode(buf_bar.getvalue()).decode("utf-8")
            Base64_word = base64.b64encode(buf_word.getvalue()).decode("utf-8")

            # Save Batch Analysis
            batch = BatchComment.objects.create(
                user=request.user, 
                comment_type=file_type, 
                over_all_sentiment=sentiment_counts.idxmax()
            )

            # Prepare comment objects for bulk creation
            comment_objects = [
                Comment(
                    batch=batch,
                    comment=row[column],
                    cleaned_text=row["cleaned_text"],
                    sentiment=row["sentiment"],
                    score=row["score_p"] if row["sentiment"] == "positive" else row["score_neg"] if row["sentiment"]=="negative" else row["score_neu"],
                )
                for _, row in df.iterrows()
            ]
            
            # Bulk save to database
            Comment.objects.bulk_create(comment_objects)

            # Serialize data
            batch_serializer = BatchCommentSerializer(batch)
            comments_serializer = CommentSerializer(comment_objects, many=True)

            return Response(
                {
                    "batch_id": batch_serializer.data['id'],
                    "analyzed_comments": comments_serializer.data,
                    "BarChart": "data:image/png;base64," + Base64_bar,
                    "wordcloud": "data:image/png;base64," + Base64_word,
                },
                status=201,
            )

        except KeyError as e:
            return Response({"error": f"Missing key: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError as e:
            return Response({"error": f"Invalid value: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        except ObjectDoesNotExist:
            return Response({"error": "Requested object does not exist."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            traceback.print_exc()  # Logs full traceback for debugging
            return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# -----------------------------------------------------------------------------------------------------------------------------------------
# Youtube comments analysis

class YoutubeCommentsAnalysis(APIView):
    permission_classes=[IsAuthenticated]
    def url_video_extract(self,url):
        pattern = r"(?:v=|\/)([0-9A-Za-z_-]{11}).*"
        match = re.search(pattern, url)
        return match.group(1) if match else None

    def post(self,request):
        video_url = request.data["vid_url"]
        if not video_url:
            return Response({"error": "No YouTube URL provided"}, status=status.HTTP_400_BAD_REQUEST)

        video_id = self.url_video_extract(video_url)

        if not video_id:
            return Response({"error": "Invalid YouTube URL"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)
            youtube_request = youtube.commentThreads().list(
                part="snippet",
                videoId=video_id,
                textFormat="plainText",
                maxResults=50,  # Fetch up to 50 comments
            )

            youtube_response = youtube_request.execute()
            comments = []

            for item in youtube_response.get("items", []):
                comment_text = item["snippet"]["topLevelComment"]["snippet"]["textDisplay"]
                comments.append(comment_text)

            # Convert list to DataFrame
            df = pd.DataFrame(comments, columns=["text"])
        except Exception as e:
            return Response({"error": f"Failed to fetch comments: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        df["cleaned_text"] = df["text"].astype(str).apply(pre.clean_text)
        vec_text = tfidf_vectorizer.transform(df["cleaned_text"])
        df["sentiment"] = sentiment_model.predict(vec_text)
        sentiment_map = {0: "negative",1:"neutral",2: "positive"}
        df[["score_neg","score_neu", "score_p"]] = sentiment_model.predict_proba(vec_text)
        df["score_neg"] = df["score_neg"].round(2)
        df["score_neu"] = df["score_neu"].round(2)
        df["score_p"] = df["score_p"].round(2)
        df["sentiment"] = df["sentiment"].map(sentiment_map)
        sentiment_counts = df["sentiment"].value_counts()
        buf_bar = BytesIO()
        buf_word = BytesIO()
        plt.bar(
                x=["Positive", "Negative", "Neutral"],
                height=[
                    sentiment_counts.get("positive",0),
                    sentiment_counts.get("negative",0),
                    sentiment_counts.get("neutral",0),
                ],
                color=["g", "r", "grey"],
            )
        plt.title("Sentiment Distribution")
        plt.xlabel("Sentiment")
        plt.ylabel("Count")
        plt.savefig(buf_bar, format="png")

        text = " ".join(df["cleaned_text"])
        wordcloud = WordCloud(width=600, height=400, background_color="floralwhite").generate(
                text
            )

        wordcloud.to_image().save(buf_word, format="PNG")
        Base64_bar = base64.b64encode(buf_bar.getvalue()).decode("utf-8")
        Base64_word = base64.b64encode(buf_word.getvalue()).decode("utf-8")
        batch = BatchComment.objects.create(user=request.user,comment_type="Youtube",over_all_sentiment=sentiment_counts.idxmax())
        
        comment_objects = [
            Comment(
                batch=batch,
                comment=row["text"],
                cleaned_text=row["cleaned_text"],
                sentiment=row["sentiment"],
                score=row["score_p"] if row["sentiment"] == "positive" else row["score_neg"] if row["sentiment"]=="negative" else row["score_neu"],
            )
            for _, row in df.iterrows()
        ]
        
        Comment.objects.bulk_create(comment_objects)

        batch_serializer = BatchCommentSerializer(batch)
        comments_serializer = CommentSerializer(comment_objects, many=True)

        return Response(
            {
                "batch_id": batch_serializer.data['id'],
                "analyzed_comments": comments_serializer.data,
                "BarChart": "data:image/png;base64," + Base64_bar,
                "wordcloud": "data:image/png;base64," + Base64_word,
            },
            status=201,
        )

# -----------------------------------------------------------------------------------------------------------------------------------------
#batch comments class
class Batch(APIView):
    
    permission_classes=[IsAuthenticated]

    def get(self,request, batch_id=None):
        # get all batches realated to the user
        if not batch_id:
            batches = BatchComment.objects.filter(user=request.user).order_by('-date_created')
            serializer = BatchCommentSerializer(batches, many=True)
            return Response(serializer.data)
        
        # In details batch comments
        try:
            batch = BatchComment.objects.get(id=batch_id, user=request.user)
        except BatchComment.DoesNotExist:
            return Response(
                {"error": "Batch not found or does not belong to the user."}, status=status.HTTP_404_NOT_FOUND
            )

        # Retrieve all related comments for the given batch
        comments = batch.comments.all()

        # Serialize the comments data
        serializer = CommentSerializer(comments, many=True)
        df=pd.DataFrame(serializer.data)
        sentiment_counts = df["sentiment"].value_counts()
        buf_bar = BytesIO()
        buf_word = BytesIO()
        # plt.figure(figsize=(6, 4))
        plt.figure(figsize=(6, 4),facecolor="lightblue")
        plt.bar(
                x=["Positive", "Negative", "Neutral"],
                height=[
                    sentiment_counts.get("positive",0),
                    sentiment_counts.get("negative",0),
                    sentiment_counts.get("neutral",0),
                ],
                color=["g", "r", "grey"],
            )
        plt.title("Sentiment Distribution")
        plt.xlabel("Sentiment")
        plt.ylabel("Count")
        plt.savefig(buf_bar, format="png")
        plt.close()
        text = " ".join(df["cleaned_text"])
        wordcloud = WordCloud(width=600, height=400, background_color="floralwhite").generate(
                text
            )

        wordcloud.to_image().save(buf_word, format="PNG")
        Base64_bar = base64.b64encode(buf_bar.getvalue()).decode("utf-8")
        Base64_word = base64.b64encode(buf_word.getvalue()).decode("utf-8")
        return Response(
            {
                "batch_id": batch.id,
                "comment_type": batch.comment_type,
                "date_created": batch.date_created,
                "comments": serializer.data,
                "BarChart": "data:image/png;base64," + Base64_bar,
                "wordcloud": "data:image/png;base64," + Base64_word,
            }
        )
    
    def patch(self, request,batch_id, pk=None):
        try:
            batch=BatchComment.objects.get(id=batch_id)
            comment = batch.comments.get(pk=pk)
        except BatchComment.DoesNotExist:
            return Response({"error" : "Batch not found"},status=status.HTTP_404_NOT_FOUND)
        except Comment.DoesNotExist:
            return Response({"error": "Comment not found"}, status=status.HTTP_404_NOT_FOUND)

        if comment.is_updated:
            return Response({"error": "Sentiment has already been corrected once"}, status=status.HTTP_400_BAD_REQUEST)

        corrected_sentiment = request.data.get("sentiment")
        
        # Update the original SingleComment object
        if corrected_sentiment not in ["positive", "negative", "neutral"]:
            return Response({"error": "Invalid sentiment value"}, status=status.HTTP_400_BAD_REQUEST)
        if comment.sentiment==corrected_sentiment:
            return Response({"error": "Same sentiment value as predicted"}, status=status.HTTP_400_BAD_REQUEST)
        corrected_data = {
            "user": request.user.id,
            "comment": comment.comment,
            "predicted_sentiment": comment.sentiment,
            "corrected_sentiment": corrected_sentiment,
            "batch_comment":comment.id
        }
        corrected_serializer = CorrectedSentimentSerializer(data=corrected_data)
        
        if corrected_serializer.is_valid():
            corrected_serializer.save()
            comment.is_updated = True
            comment.save()
            return Response(corrected_serializer.data, status=status.HTTP_200_OK)

        return Response(corrected_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
