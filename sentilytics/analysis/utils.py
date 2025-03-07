import os
import pickle
from django.conf import settings

MODEL_PATH=os.path.join(settings.BASE_DIR,"analysis/Models/sentiment_model.pkl")
VECTORIZER_PATH=os.path.join(settings.BASE_DIR,"analysis/Models/tfidf_vectorizer.pkl")

with open(MODEL_PATH, "rb") as model_file:
    sentiment_model = pickle.load(model_file)

with open(VECTORIZER_PATH, "rb") as vectorizer_file:
    tfidf_vectorizer = pickle.load(vectorizer_file)