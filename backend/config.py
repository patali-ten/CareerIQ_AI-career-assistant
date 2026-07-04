import os
from dotenv import load_dotenv

# Explicitly find the base directory to ensure .env is always loaded properly
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, ".env"))

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
CHROMA_DB_PATH = os.getenv("CHROMA_DB_PATH", "./chroma_db")

GEMINI_MODEL = "gemini-2.5-flash"

# FIX: Change text-embedding-004 to gemini-embedding-001
EMBEDDING_MODEL = "gemini-embedding-001"

# Quick sanity check for troubleshooting
if not GEMINI_API_KEY:
    raise ValueError("❌ Critical Error: GEMINI_API_KEY was not found in environment variables!")