import asyncio
from concurrent.futures import ThreadPoolExecutor
from fastapi import APIRouter, HTTPException
from backend.models.request_models import AnalyzeRequest
from backend.agents.crew.crew import CareerCrew
from backend.rag.retriever import retrieve_resources

router = APIRouter()
executor = ThreadPoolExecutor()


@router.post("/crew-analyze")
async def crew_analyze(request: AnalyzeRequest):
    if not request.cv_text or not request.job_description:
        raise HTTPException(status_code=400, detail="Both CV text and job description are required.")

    try:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            executor,
            lambda: CareerCrew().run(request.cv_text, request.job_description)
        )

        for gap in result.get("skill_gaps", {}).get("skill_gaps", []):
            gap["resources"] = retrieve_resources(gap["skill"], k=1)

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
