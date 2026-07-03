import json
import re
import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI
from backend.config import GEMINI_API_KEY, GEMINI_MODEL

router = APIRouter()

llm = ChatGoogleGenerativeAI(model=GEMINI_MODEL, google_api_key=GEMINI_API_KEY, temperature=0.7)

_sessions: dict = {}


class InterviewStartRequest(BaseModel):
    cv_text: str
    job_description: str


class InterviewAnswerRequest(BaseModel):
    session_id: str
    question: str
    answer: str
    job_description: str


def _parse_json(text: str) -> dict:
    text = text.strip()
    text = re.sub(r'```json\s*', '', text)
    text = re.sub(r'```\s*', '', text)
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
    return {}


@router.post("/interview/start")
async def start_interview(request: InterviewStartRequest):
    try:
        prompt = f"""You are an experienced interview coach. Generate exactly 5 targeted interview questions
for this candidate applying to this specific role.

Include a balanced mix of:
- 2-3 technical or skill-based questions relevant to the job requirements
- 1-2 behavioral questions (STAR-format prompts)
- 1 situational or role-specific question

Generate questions appropriate for an INTERNSHIP or ENTRY-LEVEL candidate. Questions must be concise (2-3 sentences max), direct, and answerable by a student or recent graduate. Do NOT ask questions that assume years of industry experience. Focus on academic projects, foundational concepts, and learning potential.

CANDIDATE CV:
{request.cv_text}

JOB DESCRIPTION:
{request.job_description}

Return ONLY valid JSON with this exact structure:
{{
  "questions": [
    "Question 1",
    "Question 2",
    "Question 3",
    "Question 4",
    "Question 5"
  ]
}}"""

        response = llm.invoke(prompt)
        data = _parse_json(response.content)
        questions = data.get("questions", [])

        if not questions:
            raise ValueError("No questions were generated.")

        session_id = str(uuid.uuid4())
        _sessions[session_id] = {
            "questions": questions,
            "current_index": 0,
            "job_description": request.job_description,
        }

        return {"questions": questions, "session_id": session_id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/interview/answer")
async def submit_answer(request: InterviewAnswerRequest):
    session = _sessions.get(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found. Please start a new interview.")

    try:
        prompt = f"""You are a senior interview coach evaluating a candidate's answer.

JOB CONTEXT:
{request.job_description}

INTERVIEW QUESTION:
{request.question}

CANDIDATE'S ANSWER:
{request.answer}

Evaluate the answer honestly. Provide specific, actionable feedback.

Return ONLY valid JSON with this exact structure:
{{
  "feedback": "2-3 sentence overall assessment of the answer quality",
  "score": "3/5",
  "tips": [
    "Specific improvement tip 1",
    "Specific improvement tip 2",
    "Specific improvement tip 3"
  ]
}}"""

        response = llm.invoke(prompt)
        result = _parse_json(response.content)

        current_index = session["current_index"] + 1
        session["current_index"] = current_index
        questions = session["questions"]
        next_question = questions[current_index] if current_index < len(questions) else None

        return {
            "feedback": result.get("feedback", ""),
            "score": result.get("score", "3/5"),
            "tips": result.get("tips", []),
            "next_question": next_question,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
