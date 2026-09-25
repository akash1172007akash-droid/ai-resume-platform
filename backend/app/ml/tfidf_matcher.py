"""TF-IDF Vectorization and Cosine Similarity Matching Engine.

Mathematical explanation for interview & evaluation:
1. TF-IDF (Term Frequency - Inverse Document Frequency):
   - TF(t, d) = (Number of times term t appears in document d) / (Total terms in d)
   - IDF(t, D) = log( (1 + Total documents N) / (1 + Documents containing term t) ) + 1
   - TF-IDF(t, d, D) = TF(t, d) * IDF(t, D)
   - L2 normalized so each vector has unit length: ||v|| = 1

2. Cosine Similarity:
   - cosine_similarity(u, v) = (u · v) / (||u|| * ||v||)
   - For L2-normalized vectors: cosine_similarity(u, v) = u · v
   - Range: [0, 1], multiplied by 100 to yield a percentage [0.0%, 100.0%].

IMPORTANT:
This score is an automated textual similarity metric and does NOT represent
candidate qualification or hiring probability.
"""

from typing import Tuple, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.ml.text_preprocessing import preprocess_document


def compute_tfidf_similarity(resume_text: str, job_description_text: str) -> Tuple[float, Dict[str, Any]]:
    """
    Computes TF-IDF representations and cosine similarity between a resume and a job description.

    Returns:
        (similarity_percentage, metadata_dict)
        where similarity_percentage is a float rounded to 2 decimal places (e.g., 74.25).
    """
    # Preprocess both texts
    clean_resume = preprocess_document(resume_text)
    clean_job = preprocess_document(job_description_text)

    if not clean_resume.strip() or not clean_job.strip():
        return 0.0, {
            "top_shared_terms": [],
            "metric_name": "Job Match Score (Textual Similarity)",
            "disclaimer": "Automated text similarity metric; does not represent hiring probability."
        }

    # Custom token pattern that preserves symbols like C++, C#, .NET, and hyphens
    vectorizer = TfidfVectorizer(
        token_pattern=r"(?u)\b[\w\+\#\.\-]+\b",
        ngram_range=(1, 2),  # unigrams and bigrams (e.g., "machine learning", "fastapi")
        max_features=5000,
        sublinear_tf=True
    )

    try:
        tfidf_matrix = vectorizer.fit_transform([clean_resume, clean_job])
        # tfidf_matrix[0] is resume vector, tfidf_matrix[1] is job vector
        cosine_sim_matrix = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
        raw_score = float(cosine_sim_matrix[0][0])

        # Clamp between 0.0 and 1.0 and convert to percentage
        clamped_score = max(0.0, min(1.0, raw_score))
        similarity_percentage = round(clamped_score * 100, 2)

        # Extract top shared n-grams for transparency & explainability
        feature_names = vectorizer.get_feature_names_out()
        resume_vec = tfidf_matrix[0].toarray()[0]
        job_vec = tfidf_matrix[1].toarray()[0]
        shared_weights = resume_vec * job_vec
        top_indices = shared_weights.argsort()[::-1][:10]

        top_shared_terms = [
            feature_names[i] for i in top_indices if shared_weights[i] > 0
        ]

        metadata = {
            "top_shared_terms": top_shared_terms,
            "metric_name": "Job Match Score (Textual Similarity)",
            "disclaimer": "Automated text similarity metric; does not represent hiring probability."
        }

        return similarity_percentage, metadata

    except Exception:
        # Graceful fallback if empty vocabulary or singular matrix
        return 0.0, {
            "top_shared_terms": [],
            "metric_name": "Job Match Score (Textual Similarity)",
            "disclaimer": "Automated text similarity metric; does not represent hiring probability."
        }
