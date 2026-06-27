from langchain_google_genai import ChatGoogleGenerativeAI
from backend.config import GEMINI_API_KEY, GEMINI_MODEL
import json

llm = ChatGoogleGenerativeAI(model=GEMINI_MODEL, google_api_key=GEMINI_API_KEY)

def extract_jd_skills(jd_text: str) -> dict:
    prompt = f"""
    You are an expert technical recruiter. Analyze this job description and extract requirements.

    IMPORTANT: Extract only skills and technologies EXPLICITLY mentioned in the job description text. Do not infer related skills. Extract the exact terms used — for example 'ETL/data pipeline concepts' should be extracted as 'ETL Concepts' and 'Data Pipelines'. 'Fluency in English' should be extracted as 'English Fluency'.

    Return ONLY a valid JSON object with this exact structure:
    {{
        "required_skills": ["skill1", "skill2"],
        "preferred_skills": ["skill3"],
        "role_title": "Data Scientist",
        "seniority": "Entry Level"
    }}

    JOB DESCRIPTION:
    {jd_text}
    """
    
    response = llm.invoke(prompt)
    raw = response.content.strip().replace("```json", "").replace("```", "")
    return json.loads(raw)