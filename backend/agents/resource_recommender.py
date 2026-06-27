from backend.rag.retriever import retrieve_resources

def recommend_resources(gaps: list) -> list:
    """
    For each skill gap, find the top 3 learning resources from ChromaDB.
    """
    enriched_gaps = []
    
    for gap in gaps:
        resources = retrieve_resources(gap["skill"], k=1)
        enriched_gaps.append({
            "skill": gap["skill"],
            "importance": gap["importance"],
            "resources": resources
        })
    
    return enriched_gaps