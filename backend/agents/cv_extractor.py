from langchain_google_genai import ChatGoogleGenerativeAI
from backend.config import GEMINI_API_KEY, GEMINI_MODEL
import json

llm = ChatGoogleGenerativeAI(
    model=GEMINI_MODEL, 
    google_api_key=GEMINI_API_KEY,
    temperature=0.0
)

def extract_cv_skills(cv_text: str) -> dict:
    prompt = f"""
    You are an expert HR analyst. Analyze this CV and extract structured information.

    IMPORTANT: Only extract skills that are EXPLICITLY written in the CV text. Do NOT infer or assume skills from project names, tools used, or context. For example, if the CV mentions Scikit-learn, extract Scikit-learn — also extract Machine Learning since it is explicitly listed under skills. But do NOT add Azure or Databricks just because the person worked on data projects.

    Return a valid JSON object with this exact structure:
    {{
        "skills": ["skill1", "skill2"],
        "experience_years": 2,
        "education": "Bachelor's in Computer Science",
        "job_titles": ["Data Analyst Intern", "Python Developer"]
    }}

    CV TEXT:
    {cv_text}
    """
    
    response = llm.invoke(prompt)
    raw_content = response.content.strip()
    
    # SAFE CLEANUP: Strip away markdown wrappers if the LLM includes them
    if raw_content.startswith("```"):
        # Remove opening fence lines like ```json or ```
        lines = raw_content.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        raw_content = "\n".join(lines).strip()
    
    try:
        return json.loads(raw_content)
    except json.JSONDecodeError as e:
        print(f"❌ Failed to parse JSON. Cleaned output was: {raw_content}")
        raise e