from rapidfuzz.fuzz import partial_ratio

_SOFT_SKILLS = {
    "communication", "teamwork", "collaboration", "leadership", "adaptability",
    "problem solving", "problem-solving", "critical thinking", "time management",
    "creativity", "attention to detail", "organization", "interpersonal",
    "presentation", "negotiation", "mentoring", "coaching", "work ethic",
    "emotional intelligence", "conflict resolution", "decision making",
    "multitasking", "flexibility", "self-motivated", "initiative", "empathy",
}

def _is_soft_skill(skill: str) -> bool:
    skill_lower = skill.lower()
    return any(partial_ratio(skill_lower, s) >= 75 for s in _SOFT_SKILLS)

def _fuzzy_match(skill: str, cv_skills: set) -> bool:
    skill_lower = skill.lower()
    return any(partial_ratio(skill_lower, cv_skill) >= 75 for cv_skill in cv_skills)

def analyze_gaps(cv_data: dict, jd_data: dict) -> dict:
    cv_skills = set(s.lower() for s in cv_data.get("skills", []))
    required = jd_data.get("required_skills", [])
    preferred = jd_data.get("preferred_skills", [])

    matched = []
    missing = []
    gaps = []

    all_jd_skills = required + preferred

    weighted_matched = 0.0
    weighted_total = 0.0

    for skill in all_jd_skills:
        weight = 0.5 if _is_soft_skill(skill) else 1.0
        weighted_total += weight
        if _fuzzy_match(skill, cv_skills):
            matched.append(skill)
            weighted_matched += weight
        else:
            missing.append(skill)
            importance = "High" if skill in required else "Medium"
            gaps.append({"skill": skill, "importance": importance})

    match_score = int((weighted_matched / weighted_total) * 100) if weighted_total > 0 else 0

    return {
        "match_score": match_score,
        "matched_skills": matched,
        "missing_skills": missing,
        "gaps": gaps
    }
