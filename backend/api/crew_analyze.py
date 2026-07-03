from fastapi import APIRouter, HTTPException
from backend.models.request_models import AnalyzeRequest
from backend.agents.crew.crew import CareerCrew

router = APIRouter()


@router.post("/crew-analyze")
async def crew_analyze(request: AnalyzeRequest):
    if not request.cv_text or not request.job_description:
        raise HTTPException(status_code=400, detail="Both CV text and job description are required.")

    try:
        result = CareerCrew().run(request.cv_text, request.job_description)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
