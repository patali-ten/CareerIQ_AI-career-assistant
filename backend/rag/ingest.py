import json
from langchain_core.documents import Document
from backend.rag.vectorstore import get_vectorstore

def ingest_courses():
    with open("backend/knowledge_base/courses.json", "r") as f:
        courses = json.load(f)
    
    documents = []
    for course in courses:
        doc = Document(
            page_content=course["description"],  # This gets embedded as a vector
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