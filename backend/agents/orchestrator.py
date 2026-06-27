from backend.agents.cv_extractor import extract_cv_skills
from backend.agents.jd_extractor import extract_jd_skills
from backend.agents.skill_gap_analyzer import analyze_gaps
from backend.agents.resource_recommender import recommend_resources
from backend.agents.roadmap_generator import generate_roadmap

def run_analysis(cv_text: str, jd_text: str) -> dict:
    """
    Master function. Runs all agents in sequence and returns final result.
    """
    print("Step 1: Extracting CV skills...")
    cv_data = extract_cv_skills(cv_text)
    
    print("Step 2: Extracting JD requirements...")
    jd_data = extract_jd_skills(jd_text)
    
    print("Step 3: Analyzing skill gaps...")
    gap_analysis = analyze_gaps(cv_data, jd_data, cv_text)
    
    print("Step 4: Finding learning resources...")
    enriched_gaps = recommend_resources(gap_analysis["gaps"])
    
    print("Step 5: Generating roadmap...")
    roadmap = generate_roadmap(
        gap_analysis["missing_skills"],
        jd_data.get("role_title", "the target role")
    )
    
    return {
        "match_score": gap_analysis["match_score"],
        "matched_skills": gap_analysis["matched_skills"],
        "missing_skills": gap_analysis["missing_skills"],
        "skill_gaps": enriched_gaps,
        "roadmap": roadmap,
        "summary": f"You matched {gap_analysis['match_score']}% of the requirements for {jd_data.get('role_title', 'this role')}."
    }