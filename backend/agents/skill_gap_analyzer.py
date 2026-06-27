from langchain_google_genai import ChatGoogleGenerativeAI
from backend.config import GEMINI_API_KEY, GEMINI_MODEL
from rapidfuzz.fuzz import partial_ratio
import json

llm = ChatGoogleGenerativeAI(model=GEMINI_MODEL, google_api_key=GEMINI_API_KEY, temperature=0.0)

_SOFT_SKILLS = {
    "communication", "teamwork", "collaboration", "leadership", "adaptability",
    "problem solving", "problem-solving", "critical thinking", "time management",
    "creativity", "attention to detail", "organization", "interpersonal",
    "presentation", "negotiation", "mentoring", "coaching", "work ethic",
    "emotional intelligence", "conflict resolution", "decision making",
    "multitasking", "flexibility", "self-motivated", "initiative", "empathy",
    "english fluency", "communication skills",
}

def _is_soft_skill(skill: str) -> bool:
    skill_lower = skill.lower()
    return any(partial_ratio(skill_lower, s) >= 75 for s in _SOFT_SKILLS)

def analyze_gaps(cv_data: dict, jd_data: dict, cv_text: str = "") -> dict:
    cv_skills = cv_data.get("skills", [])
    required = jd_data.get("required_skills", [])
    preferred = jd_data.get("preferred_skills", [])
    all_jd_skills = required + preferred

    if not cv_text:
        raise ValueError("cv_text is required for accurate skill gap analysis")

    if not all_jd_skills:
        return {"match_score": 0, "matched_skills": [], "missing_skills": [], "gaps": []}

    prompt = f"""You are a skill matching expert. Determine which job skills a candidate has based on their CV.

MATCHING RULES:

STRICT matching (apply to specific tools and platforms):
Only mark a skill as MATCHED if the exact term, a direct abbreviation, or an unambiguous synonym appears in the CV. Do NOT infer platform-specific tools (e.g. Azure Data Factory, Databricks, Azure Synapse Analytics, Microsoft Fabric) from general concepts (e.g. ETL, cloud, pipelines, data engineering). When in doubt, mark as a GAP, not a match.
Only treat a skill as MATCHED if it appears in the context of experience, projects, education, or certifications sections of the CV. If a skill only appears in an objective, summary, or 'looking to learn' section, mark it as a GAP, not a match.

LIBERAL matching (apply to soft skills, concepts, and methodologies):
- If the CV mentions 'Communication Skills' or is clearly written in fluent English, treat 'English Fluency' as MATCHED.
- If the CV mentions ETL pipelines, data pipelines, or pipeline work in any project or experience description, treat 'ETL Concepts' as MATCHED.
- If the CV mentions data modeling, schema design, or database design anywhere in the CV, treat 'Data Modeling' as MATCHED.
- For all non-tool skills (communication, concepts, methodologies), use liberal paraphrase matching.
- For all specific tools and platforms (Databricks, Azure Data Factory, etc.), use strict exact matching only.

CANDIDATE'S EXTRACTED SKILLS:
{json.dumps(cv_skills, indent=2)}

CANDIDATE'S FULL CV TEXT:
{cv_text}

JOB SKILLS TO MATCH:
Required: {json.dumps(required)}
Preferred: {json.dumps(preferred)}

Return ONLY a valid JSON object with this exact structure:
{{
  "matched": ["skill1", "skill2"],
  "missing": ["skill3"]
}}

Every skill from Required and Preferred must appear in exactly one list. Preserve the exact skill name strings from the job requirements. Return only the JSON, no explanation.
"""

    response = llm.invoke(prompt)
    raw = response.content.strip().replace("```json", "").replace("```", "").strip()
    result = json.loads(raw)

    matched = result.get("matched", [])
    missing = result.get("missing", [])

    gaps = []
    for skill in missing:
        importance = "High" if skill in required else "Medium"
        gaps.append({"skill": skill, "importance": importance})

    weighted_matched = sum(0.5 if _is_soft_skill(s) else 1.0 for s in matched)
    weighted_total = sum(0.5 if _is_soft_skill(s) else 1.0 for s in all_jd_skills)
    match_score = int((weighted_matched / weighted_total) * 100) if weighted_total > 0 else 0

    return {
        "match_score": match_score,
        "matched_skills": matched,
        "missing_skills": missing,
        "gaps": gaps
    }
