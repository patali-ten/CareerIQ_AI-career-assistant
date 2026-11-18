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

# Allow React frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite React dev server
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