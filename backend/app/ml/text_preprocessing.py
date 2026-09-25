"""NLP text preprocessing pipeline designed specifically for technical resumes and job descriptions.
Safely preserves technical punctuation and symbols like C++, C#, .NET, Node.js, and CI/CD.
"""

import re
from typing import List

# Essential English stopwords that do NOT collide with technical skills
# (Notice we exclude 'c', 'r', 'go', 'it', 'all' to prevent accidental skill stripping)
TECHNICAL_SAFE_STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "am", "an", "and", "any", "are", 
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", 
    "but", "by", "could", "did", "do", "does", "doing", "down", "during", "each", "few", 
    "for", "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers", 
    "herself", "him", "himself", "his", "how", "i", "if", "in", "into", "is", "its", 
    "itself", "me", "more", "most", "my", "myself", "nor", "of", "off", "on", "once", 
    "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", 
    "same", "she", "should", "so", "some", "such", "than", "that", "the", "their", 
    "theirs", "them", "themselves", "then", "there", "these", "they", "this", "those", 
    "through", "to", "too", "under", "until", "up", "very", "was", "we", "were", "what", 
    "when", "where", "which", "while", "who", "whom", "why", "with", "would", "you", 
    "your", "yours", "yourself", "yourselves"
}

# Protected technical tokens mapped to temporary tokens to avoid corruption during cleaning
PROTECTED_TERMS_MAP = {
    "c++": "TOKEN_CPPLUS",
    "c#": "TOKEN_CSHARP",
    ".net": "TOKEN_DOTNET",
    "asp.net": "TOKEN_ASPDOTNET",
    "node.js": "TOKEN_NODEJS",
    "react.js": "TOKEN_REACTJS",
    "vue.js": "TOKEN_VUEJS",
    "next.js": "TOKEN_NEXTJS",
    "express.js": "TOKEN_EXPRESSJS",
    "ci/cd": "TOKEN_CICD",
    "scikit-learn": "TOKEN_SCIKITLEARN"
}

REVERSE_PROTECTED_TERMS_MAP = {v: k for k, v in PROTECTED_TERMS_MAP.items()}


def clean_text(raw_text: str) -> str:
    """
    Cleans raw extracted text:
    1. Lowers case
    2. Protects technical terms with dots/plus/hash
    3. Replaces bullet points, newlines, and symbols with spaces
    4. Normalizes whitespace
    5. Restores technical terms
    """
    if not raw_text:
        return ""

    text = raw_text.lower()

    # Step 1: Protect special technical terms
    for term, placeholder in PROTECTED_TERMS_MAP.items():
        # Match standalone term or surrounded by non-alphanumeric
        pattern = re.escape(term)
        text = re.sub(r"(?<![a-zA-Z0-9])" + pattern + r"(?![a-zA-Z0-9])", f" {placeholder} ", text)

    # Step 2: Remove unwanted punctuation, bullet points, special characters
    # Keep alphanumeric, spaces, and placeholder underscores
    text = re.sub(r"[^\w\s_]", " ", text)

    # Step 3: Normalize whitespace
    text = re.sub(r"\s+", " ", text).strip()

    # Step 4: Restore protected terms
    for placeholder, term in REVERSE_PROTECTED_TERMS_MAP.items():
        text = re.sub(r"\b" + placeholder.lower() + r"\b", term, text)

    return text


def tokenize_and_filter_stopwords(text: str) -> List[str]:
    """Tokenize cleaned text and remove safe stopwords."""
    tokens = text.split()
    filtered = [tok for tok in tokens if tok not in TECHNICAL_SAFE_STOPWORDS and len(tok) > 1 or tok in ("c", "r")]
    return filtered


def preprocess_document(raw_text: str) -> str:
    """Full preprocessing pipeline returning clean, normalized text ready for vectorization."""
    cleaned = clean_text(raw_text)
    tokens = tokenize_and_filter_stopwords(cleaned)
    return " ".join(tokens)
