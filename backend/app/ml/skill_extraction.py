"""Skill extraction engine using controlled dictionary, alias resolution,
phrase boundary matching, and category classification.
"""

import re
from typing import List, Dict, Set
from app.ml.skills import (
    SKILL_TAXONOMY,
    SKILL_TO_CATEGORY,
    SKILL_ALIASES,
    ALL_CANONICAL_SKILLS
)

# Compile regex patterns for aliases sorted by descending length (longest match first)
# to avoid greedy substring collisions (e.g., "react native" before "react")
SORTED_ALIASES = sorted(SKILL_ALIASES.keys(), key=lambda x: len(x), reverse=True)


def extract_skills_from_text(text: str) -> List[Dict[str, str]]:
    """
    Extracts all recognized technical skills from raw or preprocessed text.
    Returns a list of dicts: [{"name": "Python", "category": "Programming Languages"}, ...]
    """
    if not text:
        return []

    detected_canonical_skills: Set[str] = set()
    normalized_text = f" {text.lower()} "

    # 1. First check special syntax terms with non-standard word boundaries
    special_patterns = {
        "C++": r"(?:(?<![a-zA-Z0-9])c\+\+(?![a-zA-Z0-9])|\bcpp\b|\bc\s+plus\s+plus\b)",
        "C#": r"(?:(?<![a-zA-Z0-9])c\#(?![a-zA-Z0-9])|\bcsharp\b|\bc\s+sharp\b)",
        ".NET": r"(?:(?<![a-zA-Z0-9])\.net\b|\bdotnet\b|\b\.net\s+core\b)",
        "Node.js": r"(?:(?<![a-zA-Z0-9])node\.js\b|\bnodejs\b|\bnode\s+js\b)",
        "React": r"(?:(?<![a-zA-Z0-9])react\.js\b|\breactjs\b|\breact\s+js\b|\breact\b)",
        "Vue": r"(?:(?<![a-zA-Z0-9])vue\.js\b|\bvuejs\b|\bvue\s+js\b|\bvue\b)",
        "Next.js": r"(?:(?<![a-zA-Z0-9])next\.js\b|\bnextjs\b|\bnext\s+js\b)",
        "CI/CD": r"(?:(?<![a-zA-Z0-9])ci/cd(?![a-zA-Z0-9])|\bcicd\b)",
        "Scikit-learn": r"(?:(?<![a-zA-Z0-9])scikit-learn\b|\bscikitlearn\b|\bscikit\s+learn\b|\bsklearn\b)",
        "Go": r"(?:\bgolang\b|\bgo\s+language\b|\bgo\s+programming\b)",
        "R": r"(?:\br\s+programming\b|\br\s+language\b|\br-lang\b)",
    }

    for canonical, regex_pat in special_patterns.items():
        if re.search(regex_pat, normalized_text, re.IGNORECASE):
            detected_canonical_skills.add(canonical)

    # 2. Match remaining aliases with safe boundary checking
    for alias in SORTED_ALIASES:
        canonical = SKILL_ALIASES[alias]
        if canonical in detected_canonical_skills:
            continue

        # Skip single-letter aliases from general boundary scan to prevent false positives
        if len(alias) <= 2 and alias not in ("ts", "js", "ml", "dl", "ai", "db"):
            continue

        pattern = r"\b" + re.escape(alias) + r"\b"
        if re.search(pattern, normalized_text, re.IGNORECASE):
            detected_canonical_skills.add(canonical)

    # 3. Direct canonical skill check (if exact canonical name appears)
    for canonical in ALL_CANONICAL_SKILLS:
        if canonical in detected_canonical_skills:
            continue
        if len(canonical) <= 2:
            continue
        pattern = r"\b" + re.escape(canonical.lower()) + r"\b"
        if re.search(pattern, normalized_text, re.IGNORECASE):
            detected_canonical_skills.add(canonical)

    # Build structured response sorted alphabetically
    result = []
    for skill in sorted(detected_canonical_skills):
        category = SKILL_TO_CATEGORY.get(skill, "General")
        result.append({
            "name": skill,
            "category": category
        })

    return result


def normalize_skill_name(raw_name: str) -> str:
    """Normalize a user-entered skill name to its canonical dictionary form if known."""
    cleaned = raw_name.strip()
    lower = cleaned.lower()
    if lower in SKILL_ALIASES:
        return SKILL_ALIASES[lower]
    for canonical in ALL_CANONICAL_SKILLS:
        if canonical.lower() == lower:
            return canonical
    return cleaned.title() if len(cleaned) > 2 else cleaned.upper()
