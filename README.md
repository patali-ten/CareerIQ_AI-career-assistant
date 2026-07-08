# 🧠 CareerIQ — AI Career Intelligence Assistant

An AI-powered full-stack web application that analyzes your CV against a job description 
using a 6-agent CrewAI system. Get a match score, skill gap breakdown, resume feedback, 
career advice, a personalized learning roadmap, and practice with a voice-enabled 
mock interview coach.

## Features

- **CV Analysis** — Extracts skills, experience, and education from uploaded CV (PDF or DOCX)
- **Job Description Parsing** — Intelligently extracts required and preferred skills from any JD
- **Skill Gap Analysis** — Fuzzy matching with soft-skill weighting for accurate gap detection
- **Resume Review** — AI-generated strengths, improvement suggestions, and overall rating
- **Job Match Score** — Percentage match with honest recommendation on whether to apply
- **Career Advice** — Strategic positioning statement and actionable advice for the target role
- **Learning Roadmap** — Prioritized week-by-week plan to close your skill gaps
- **Resource Recommendations** — ChromaDB RAG retrieves curated courses per skill gap
- **Voice Interview Coach** — 5 tailored mock interview questions with spoken feedback, 
  mic input, and mute/replay voice controls

## Tech Stack

**Frontend**
- React + Vite
- Tailwind CSS v4
- Framer Motion
- Web Speech API (voice input + text-to-speech, no API key needed)

**Backend**
- Python + FastAPI
- CrewAI (6-agent sequential pipeline)
- LangChain + Google Gemini (via LiteLLM inside CrewAI)
- ChromaDB (RAG knowledge base for course recommendations)
- RapidFuzz (fuzzy skill matching)

## Agent Architecture

| Agent | Role |
|---|---|
| Resume Reviewer | Analyzes CV strengths and improvements |
| Skill Gap Analyzer | Compares CV vs JD, calculates match score |
| Job Matching Agent | Evaluates overall fit and gives recommendation |
| Career Advisor | Generates positioning statement and career advice |
| Learning Path Agent | Builds week-by-week learning roadmap |
| Interview Coach | Generates tailored questions and evaluates answers |

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Google Gemini API key ([get one free at aistudio.google.com](https://aistudio.google.com))

### Backend Setup

```bash
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux
pip install -r backend/requirements.txt
```

Create a `.env` file in the root folder:

- **GEMINI_API_KEY** — your_api_key_here
- **CHROMA_DB_PATH** — ./chroma_db
- **GEMINI_MODEL** — gemini-1.5-flash-latest


Seed the ChromaDB knowledge base (run once):

```bash
python scripts/seed_vectorstore.py
```

Start the backend:

```bash
uvicorn backend.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`

## Usage

1. Upload your CV (PDF or DOCX)
2. Paste the target job description
3. Click **Analyze My Career Fit**
4. Review your match score, skill gaps, resume feedback, and career advice across tabs
5. Click **Practice Interview** to enter the voice-enabled mock interview session
6. Speak or type your answers — get instant scored feedback with voice playback

## Voice Interview Features

- Mic button records your spoken answer in real time
- AI feedback is automatically read aloud after each answer
- Stop voice button mutes playback instantly
- Play again button replays any feedback bubble
- Works in Chrome and Edge (Web Speech API)

