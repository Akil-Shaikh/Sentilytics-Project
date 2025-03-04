from rest_framework.response import Response
import pickle
from nltk.stem import WordNetLemmatizer
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import re
import nltk
import pandas as pd
from .models import SingleComment, BatchComment, Comment
from .serializers import singleCommentSerializer,BatchCommentSerializer,CommentSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from wordcloud import WordCloud
from io import BytesIO
from googleapiclient.discovery import build
import base64
from sentilytics.settings import YOUTUBE_API_KEY
from rest_framework.exceptions import ValidationError
from django.core.exceptions import ObjectDoesNotExist
import traceback
nltk.download("stopwords")
nltk.download("wordnet")
nltk.download('punkt_tab')

# importing models
with open("C:/Users/akil/Desktop/Trained Model/Models/tfidf_vectorizer.pkl", "rb") as file:
    tfidf_model = pickle.load(file)
with open("C:/Users/akil/Desktop/Trained Model/Models/sentiment_model.pkl", "rb") as file:
    sentiment_model = pickle.load(file)

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
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def singleCommentAnalysis(request):
    try:
        data = request.data
        original_text = data["text"]
        cleaned_text = pre.clean_text(original_text)
        vec_text = tfidf_model.transform([cleaned_text])
        sentiment = sentiment_model.predict(vec_text)[0]
        score = sentiment_model.predict_proba(vec_text)[0]
        sentiment_map = {1: "positive", 0: "negative"}
        comment_data = {
            "user": request.user.id,
            "comment": original_text,
            "cleaned_text": cleaned_text,
            "sentiment": sentiment_map[sentiment] if cleaned_text else "none",
            "Score": round(score[sentiment], 2) if not cleaned_text == "none" else 0,
        }
        serializer = singleCommentSerializer(data=comment_data)

        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    except Exception as e:
        return Response("Error generating analysis",status=400)


# -----------------------------------------------------------------------------------------------------------------------------------------
#multiple comments analysis
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def multipleCommentsAnalysis(request):
    try:
        # Ensure a file is uploaded
        if "file" not in request.FILES:
            return Response({"error": "CSV or Excel file is required."}, status=400)

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
                return Response({"error": "Unsupported file format. Please upload a CSV or Excel file."}, status=400)
        except Exception as e:
            return Response({"error": f"Invalid file format: {str(e)}"}, status=400)

        # Ensure the column is provided
        column = request.data.get("column")
        if not column:
            return Response({"error": "Column name is required."}, status=400)

        # Ensure the column exists in the DataFrame
        if column not in df.columns:
            return Response({"error": f"File must contain a '{column}' column."}, status=400)

        # Ensure the file is not empty
        if df.empty or df[column].dropna().empty:
            return Response({"error": "Uploaded file is empty or does not contain valid comments."}, status=400)

        # Preprocess text
        df["cleaned_text"] = df[column].astype(str).apply(pre.clean_text)

        # Perform Sentiment Analysis
        vec_text = tfidf_model.transform(df["cleaned_text"])
        df["sentiment"] = sentiment_model.predict(vec_text)
        sentiment_map = {1: "positive", 0: "negative"}
        df[["score_n", "score_p"]] = sentiment_model.predict_proba(vec_text)
        df["score_n"] = df["score_n"].round(2)
        df["score_p"] = df["score_p"].round(2)
        df["sentiment"] = df["sentiment"].map(sentiment_map)

        # Handle empty cleaned text cases
        df.loc[df["cleaned_text"] == "", ["sentiment", "score_p", "score_n"]] = ["none", 0, 0]

        # Sentiment Distribution Plot
        sentiment_counts = df["sentiment"].value_counts()
        buf_bar = BytesIO()
        buf_word = BytesIO()

        plt.figure(figsize=(6, 4),facecolor="lightblue")
        plt.bar(
            x=["Positive", "Negative", "None"],
            height=[
                sentiment_counts.get("positive", 0),
                sentiment_counts.get("negative", 0),
                sentiment_counts.get("none", 0),
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
            over_all_sentiment=sentiment_counts.idxmax() if not sentiment_counts.empty else "none"
        )

        # Prepare comment objects for bulk creation
        comment_objects = [
            Comment(
                batch=batch,
                comment=row[column],
                cleaned_text=row["cleaned_text"],
                sentiment=row["sentiment"],
                score=row["score_p"] if row["sentiment"] == "positive" else row["score_n"],
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
                "batch_info": batch_serializer.data,
                "analyzed_comments": comments_serializer.data,
                "BarChart": "data:image/png;base64," + Base64_bar,
                "wordcloud": "data:image/png;base64," + Base64_word,
            },
            status=201,
        )

    except KeyError as e:
        return Response({"error": f"Missing key: {str(e)}"}, status=400)
    except ValueError as e:
        return Response({"error": f"Invalid value: {str(e)}"}, status=400)
    except ObjectDoesNotExist:
        return Response({"error": "Requested object does not exist."}, status=404)
    except Exception as e:
        traceback.print_exc()  # Logs full traceback for debugging
        return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=500)

# -----------------------------------------------------------------------------------------------------------------------------------------

def url_video_extract(url):
    pattern = r"(?:v=|\/)([0-9A-Za-z_-]{11}).*"
    match = re.search(pattern, url)
    return match.group(1) if match else None

# Youtube comments analysis
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def youtube_analysis(request):
    video_url = request.data["vid_url"]
    if not video_url:
        return Response({"error": "No YouTube URL provided"}, status=400)

    video_id = url_video_extract(video_url)

    if not video_id:
        return Response({"error": "Invalid YouTube URL"}, status=400)

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
        return Response({"error": f"Failed to fetch comments: {str(e)}"}, status=500)
    df["cleaned_text"] = df["text"].astype(str).apply(pre.clean_text)
    vec_text = tfidf_model.transform(df["cleaned_text"])
    df["sentiment"] = sentiment_model.predict(vec_text)
    sentiment_map = {1: "positive", 0: "negative"}
    df[["score_n", "score_p"]] = sentiment_model.predict_proba(vec_text)
    df["score_n"] = df["score_n"].round(2)
    df["score_p"] = df["score_p"].round(2)
    df["sentiment"] = df["sentiment"].map(sentiment_map)
    df.loc[df["cleaned_text"] == "", ["sentiment", "score_p", "score_n"]] = [
        "none",
        0,
        0,
    ]
    sentiment_counts = df["sentiment"].value_counts()
    buf_bar = BytesIO()
    buf_word = BytesIO()
    plt.bar(
            x=["Positive", "Negative", "None"],
            height=[
                sentiment_counts.get("positive",0),
                sentiment_counts.get("negative",0),
                sentiment_counts.get("none",0),
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
            score=row["score_p"] if row["sentiment"] == "positive" else row["score_n"],
        )
        for _, row in df.iterrows()
    ]
    
    Comment.objects.bulk_create(comment_objects)

    batch_serializer = BatchCommentSerializer(batch)
    comments_serializer = CommentSerializer(comment_objects, many=True)

    return Response(
        {
            "batch_info": batch_serializer.data,
            "analyzed_comments": comments_serializer.data,
            "BarChart": "data:image/png;base64," + Base64_bar,
            "wordcloud": "data:image/png;base64," + Base64_word,
        },
        status=201,
    )

# -----------------------------------------------------------------------------------------------------------------------------------------
#get all single comments related to user
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_single_comments(request):
    user_comments = SingleComment.objects.filter(user=request.user)
    serializer = singleCommentSerializer(user_comments, many=True)
    return Response(serializer.data)

# -----------------------------------------------------------------------------------------------------------------------------------------
# get all batches realated to the user
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_batch(request):
    batches = BatchComment.objects.filter(user=request.user)
    serializer = BatchCommentSerializer(batches, many=True)
    return Response(serializer.data)

# -----------------------------------------------------------------------------------------------------------------------------------------
# In details batch comments
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def batch_comments(request, batch_id):
    try:
        batch = BatchComment.objects.get(id=batch_id, user=request.user)
    except BatchComment.DoesNotExist:
        return Response(
            {"error": "Batch not found or does not belong to the user."}, status=404
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
            x=["Positive", "Negative", "None"],
            height=[
                sentiment_counts.get("positive",0),
                sentiment_counts.get("negative",0),
                sentiment_counts.get("none",0),
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
