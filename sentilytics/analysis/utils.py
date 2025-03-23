import os
import pickle
from django.conf import settings
import nltk
from nltk.stem import WordNetLemmatizer
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import re
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from wordcloud import WordCloud
from io import BytesIO
nltk.download("stopwords")
nltk.download("wordnet")
nltk.download('punkt_tab')

MODEL_PATH=os.path.join(settings.BASE_DIR,"analysis/Models/sentiment_model.pkl")
VECTORIZER_PATH=os.path.join(settings.BASE_DIR,"analysis/Models/tfidf_vectorizer.pkl")

with open(MODEL_PATH, "rb") as model_file:
    sentiment_model = pickle.load(model_file)

with open(VECTORIZER_PATH, "rb") as vectorizer_file:
    tfidf_vectorizer = pickle.load(vectorizer_file)

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
            elif word not in self.stop_words:
                if negate:
                    cleaned_tokens.append("not_" + self.lemmatizer.lemmatize(word))
                    negate=False
                else:
                    cleaned_tokens.append(self.lemmatizer.lemmatize(word))

        return " ".join(cleaned_tokens)



def generateWordcloud(data):
    df=pd.DataFrame(data)
    buf_word=BytesIO()
    text = " ".join(df["cleaned_text"].dropna())
    if text.strip():  # Generate word cloud only if there is valid text
        wordcloud = WordCloud(width=600, height=400, background_color="floralwhite").generate(text)
        wordcloud.to_image().save(buf_word, format="PNG")
    buf_word.seek(0)
    return buf_word
    
#instances
pre=Preprocessor()
