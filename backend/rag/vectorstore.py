import os
from langchain_chroma import Chroma
from backend.rag.embeddings import get_embedding_model
from backend.config import CHROMA_DB_PATH

def get_vectorstore():
    # Defensive check: Ensure directory structure exists safely before initializing Chroma
    if CHROMA_DB_PATH and not os.path.exists(CHROMA_DB_PATH):
        os.makedirs(CHROMA_DB_PATH, exist_ok=True)
        
    return Chroma(
        collection_name="career_resources",
        embedding_function=get_embedding_model(),
        persist_directory=CHROMA_DB_PATH
    )