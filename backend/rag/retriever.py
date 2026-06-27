from backend.rag.vectorstore import get_vectorstore

def retrieve_resources(skill: str, k: int = 3):
    vectorstore = get_vectorstore()
    results = vectorstore.similarity_search(skill, k=5)

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

    return resources