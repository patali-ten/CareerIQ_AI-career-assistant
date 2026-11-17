from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from backend.agents.cover_letter_generator import generate_cover_letter
from backend.utils.pdf_generator import generate_cover_letter_pdf
import json

router = APIRouter()


class CoverLetterRequest(BaseModel):
    cv_text: str
    job_description: str


@router.post("/generate-cover-letter")
async def generate_cover_letter_endpoint(request: CoverLetterRequest):
    if not request.cv_text or not request.cv_text.strip():
        raise HTTPException(status_code=400, detail="cv_text is required")
    if not request.job_description or not request.job_description.strip():
        raise HTTPException(status_code=400, detail="job_description is required")

    try:
        result = generate_cover_letter(request.cv_text, request.job_description)
        pdf_bytes = generate_cover_letter_pdf(
            cover_letter_text=result["cover_letter"],
            applicant_name=result.get("applicant_name", "Applicant"),
            cv_text=request.cv_text,
        )
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": (
                    f'attachment; filename="cover_letter_{result.get("applicant_name", "applicant").replace(" ", "_")}.pdf"'
                )
            },
        )
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse LLM response: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))