from fastapi import APIRouter, HTTPException
from backend.models.request_models import AnalyzeRequest
from backend.models.response_models import AnalysisResult
from backend.agents.orchestrator import run_analysis

router = APIRouter()

@router.post("/analyze", response_model=AnalysisResult)
async def analyze(request: AnalyzeRequest):
    if not request.cv_text or not request.job_description:
        raise HTTPException(status_code=400, detail="Both CV text and job description are required.")

    try:
        result = run_analysis(request.cv_text, request.job_description)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))