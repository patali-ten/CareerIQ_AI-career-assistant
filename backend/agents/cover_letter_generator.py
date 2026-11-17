import json
from urllib import response
from langchain_google_genai import ChatGoogleGenerativeAI
from backend.config import GEMINI_API_KEY, GEMINI_MODEL


def generate_cover_letter(cv_text: str, job_description: str) -> dict:
    """
    Generate a professional cover letter based on CV and job description.
    Returns a dict with 'cover_letter' (str) and 'applicant_name' (str).
    """
    llm = ChatGoogleGenerativeAI(
        model=GEMINI_MODEL,
        google_api_key=GEMINI_API_KEY,
        temperature=0.7,
    )

    prompt = f"""You are an expert career coach and professional writer.

Generate a compelling, professional cover letter based on the candidate's CV and the job description below.

RULES:
- Extract the applicant's name from the CV (first line or header). If not found, use "Applicant".
- Extract the company name and role title from the job description if present.
- Write in a professional but warm tone appropriate for an internship or entry-level application.
- Structure: Opening paragraph (enthusiasm + fit), Middle paragraph (relevant skills and projects from CV mapped to JD), Closing paragraph (call to action).
- Keep it to 3 paragraphs, under 350 words total.
- Do NOT fabricate experience not present in the CV.
- Do NOT include placeholders like [Your Name] or [Date] — extract real values or omit.

Return ONLY a valid JSON object with this exact structure:
{{
  "applicant_name": "Full name extracted from CV",
  "cover_letter": "Full cover letter text with paragraphs separated by double newlines"
}}

CV:
{cv_text}

JOB DESCRIPTION:
{job_description}
"""

    response = llm.invoke(prompt)

    # Gemini sometimes returns content as a list of parts instead of a string
    if isinstance(response.content, list):
     raw = "".join(
        part.get("text", "") if isinstance(part, dict) else str(part)
        for part in response.content
    ).strip()
    else:
     raw = response.content.strip()

    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    result = json.loads(raw)
    return result