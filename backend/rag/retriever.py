import json
import os
import re
from backend.rag.vectorstore import get_vectorstore

_COURSES_PATH = os.path.join(os.path.dirname(__file__), "..", "knowledge_base", "courses.json")
_STOPWORDS = {"and", "or", "the", "a", "an", "of", "in", "on", "for", "to", "with"}


def _keyword_search_courses(skill: str, k: int) -> list:
    """Fallback when ChromaDB has no/empty results: search courses.json directly
    for any course whose title/skill/description contains a word from the skill name."""
    with open(_COURSES_PATH, "r", encoding="utf-8") as f:
        courses = json.load(f)

    skill_lower = skill.lower()
    skill_words = [w for w in re.findall(r"[a-z0-9+#]+", skill_lower) if w not in _STOPWORDS and len(w) > 2]
    if not skill_words:
        skill_words = [skill_lower]

    seen_titles = set()
    resources = []
    for course in courses:
        haystack = " ".join([
            course.get("title", ""),
            course.get("skill", ""),
            course.get("description", ""),
        ]).lower()

        if skill_lower in haystack or any(word in haystack for word in skill_words):
            title = course.get("title", "")
            if title in seen_titles:
                continue
            seen_titles.add(title)
            resources.append({
                "title": title,
                "url": course.get("url", ""),
                "platform": course.get("platform", ""),
                "skill_covered": skill
            })
            if len(resources) == k:
                break

    return resources


def retrieve_resources(skill: str, k: int = 3):
    try:
        vectorstore = get_vectorstore()
        results = vectorstore.similarity_search(skill, k=5)
    except Exception as e:
        print(f"Warning: ChromaDB search failed for '{skill}' — {e}")
        results = []

    seen_titles = set()
    resources = []
    for doc in results:
        title = doc.metadata.get("title", "")
        if title in seen_titles:
            continue
        seen_titles.add(title)
        resources.append({
            "title": title,
            "url": doc.metadata.get("url", ""),
            "platform": doc.metadata.get("platform", ""),
            "skill_covered": skill
        })
        if len(resources) == k:
            break

    if not resources:
        resources = _keyword_search_courses(skill, k)

    return resources