import json
import os
from langchain_core.documents import Document
from backend.rag.vectorstore import get_vectorstore

def ingest_courses():
    # Works from any working directory — Docker, local, scripts/
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    courses_path = os.path.join(base_dir, "knowledge_base", "courses.json")

    with open(courses_path, "r") as f:
        courses = json.load(f)

    documents = []
    for course in courses:
        doc = Document(
            page_content=course["description"],
            metadata={
                "title": course["title"],
                "url": course["url"],
                "platform": course["platform"],
                "skill": course["skill"]
            }
        )
        documents.append(doc)

    vectorstore = get_vectorstore()
    vectorstore.add_documents(documents)
    print(f"✅ Ingested {len(documents)} courses into ChromaDB")

if __name__ == "__main__":
    ingest_courses()