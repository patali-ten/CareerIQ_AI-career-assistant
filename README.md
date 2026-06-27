# 🧠 CareerIQ — AI Career Intelligence Assistant

An AI-powered web application that analyzes your CV against a job description 
to identify skill matches, skill gaps, and generates a personalized learning roadmap.

## Features

- **CV Analysis** — Extracts and understands skills from your uploaded CV (PDF or DOCX)
- **JD Parsing** — Parses job description requirements intelligently
- **Skill Gap Analysis** — Two-tier matching: strict for tools/platforms, liberal for concepts and soft skills
- **Learning Roadmap** — Generates a prioritized, ordered learning path to close your gaps
- **Resource Recommendations** — Suggests courses and resources for each gap

## Tech Stack

**Frontend**
- React + Vite
- Tailwind CSS v3
- Dark glassmorphism UI

**Backend**
- Python + FastAPI
- LangChain + Google Gemini 2.5 Flash
- ChromaDB (RAG knowledge base)

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Google Gemini API key

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

Create a `.env` file in `/backend`:
GEMINI_API_KEY=your_api_key_here

Start the backend:
```bash
uvicorn main:app --reload --port 8000
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
2. Paste the job description
3. Click Analyze
4. Review your matched skills, gaps, and personalized roadmap

## Roadmap

- [ ] Multi-agent layer with CrewAI (future improvements)
  - Career Advisor Agent
  - Resume Reviewer Agent
  - Skill Gap Analyzer Agent
  - Job Matching Agent
  - Interview Coach Agent
  - Learning Path Agent
