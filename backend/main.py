import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api import health, upload
from backend.api import crew_analyze, interview
from backend.api.cover_letter import router as cover_letter_router

app = FastAPI(
    title="AI Career Intelligence API",
    description="Analyzes CVs against job descriptions and generates learning roadmaps",
    version="1.0.0"
)

# CORS origins — add your Vercel URL here after frontend is deployed
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:3000",
]

# Read additional allowed origins from environment variable
# Format: comma-separated URLs, e.g. "https://careeriq.vercel.app,https://www.careeriq.vercel.app"
extra_origins = os.getenv("ALLOWED_ORIGINS", "")
if extra_origins:
    ALLOWED_ORIGINS.extend([o.strip() for o in extra_origins.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(health.router, tags=["Health"])
app.include_router(upload.router, tags=["Upload"])
app.include_router(crew_analyze.router, tags=["Crew Analysis"])
app.include_router(interview.router, tags=["Interview"])
app.include_router(cover_letter_router)