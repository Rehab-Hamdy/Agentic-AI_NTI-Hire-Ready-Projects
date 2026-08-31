# Arabic Sentiment Analysis — Hotel Reviews

Sentiment classification of Arabic-language hotel reviews from the [HARD (Hotel Arabic Reviews Dataset)](https://github.com/elnagara/HARD-Arabic-Dataset), comparing classical ML models against an LSTM deep learning model across multiple text-preprocessing strategies.

## Overview

This notebook builds an end-to-end pipeline for Arabic sentiment analysis:

1. Load and explore the HARD balanced hotel-reviews dataset
2. Analyze text quality/noise (English text, numbers, URLs, emojis, diacritics, elongated words, etc.)
3. Clean and normalize Arabic text using seven progressively aggressive preprocessing versions
4. Vectorize each version with TF-IDF
5. Train and evaluate 7+ classical ML models per preprocessing version
6. Train and evaluate an LSTM neural network
7. Compare the best classical model against the LSTM

## Dataset

- **Source:** [HARD-Arabic-Dataset](https://github.com/elnagara/HARD-Arabic-Dataset) (balanced-reviews.zip), cloned automatically at runtime
- **Labels:** Reviews rated 4–5 → `positive`, 1–2 → `negative` (derived from the `rating` column; ratings of 3 are excluded/neutral)
- Duplicate rows and unused columns (`no`, `Hotel name`, `user type`, `room type`, `nights`) are dropped during preprocessing

## Text Cleaning Pipeline

Seven preprocessing versions are produced to compare their effect on model performance:

| Version | Description |
|---|---|
| `review_v1_basic` | URLs and HTML entities removed, whitespace normalized |
| `review_v2_clean` | Full cleaning: URLs, HTML, diacritics, letter normalization (أ/إ/آ→ا, ى→ي, ؤ→و, ئ→ي), repeated-character collapsing, punctuation removed |
| `review_v3_no_emoji` | v2 + emojis removed |
| `review_v4_arabic_only` | v3 + English text and numbers stripped, Arabic-only text |
| `review_v5_no_numbers` | v2 + numbers removed |
| `review_v6_stopwords` | v2 + Arabic stopwords removed (negation words preserved: لا, ليس, لم, لن, ما, غير, etc.) |
| `review_v7_stemming` | v6 + ISRI stemming applied |

## Modeling

### Classical ML (TF-IDF features, max 10,000 features, 1–2 grams)
Each model is trained and evaluated on **each** of the 7 preprocessing versions (56 total experiments):
- Logistic Regression
- Multinomial Naive Bayes
- Complement Naive Bayes
- Linear SVM
- SGD Classifier
- Decision Tree
- Random Forest

**Metrics:** Accuracy, Precision, Recall, F1, ROC-AUC

### Deep Learning
- **Architecture:** Embedding (128-dim) → LSTM (128 units, dropout 0.2) → Dense (64, ReLU) → Dropout (0.5) → Dense (1, sigmoid)
- **Input:** Tokenized/padded sequences (vocab size 30,000, max length 60) from the `review_v6_stopwords` version
- **Training:** Adam optimizer, binary cross-entropy loss, early stopping on validation loss (patience=3)

## Requirements

```
pandas
numpy
matplotlib
seaborn
scikit-learn
nltk
tensorflow
```

NLTK Arabic stopwords are downloaded within the notebook (`nltk.download('stopwords')`).

## Usage

Run the notebook top to bottom in Jupyter/Colab. The first cell clones the dataset repository automatically, so no manual data download is needed. GPU is recommended for the LSTM training section.

## Results

The notebook produces a ranked comparison table (`results_df`) across all 56 classical experiments plus the LSTM, sorted by F1 score, along with visualizations (bar charts of F1/ROC-AUC/Accuracy/Precision/Recall by preprocessing version and model, and confusion matrices for the best classical model and the LSTM). See the notebook output for the specific best-performing configuration.