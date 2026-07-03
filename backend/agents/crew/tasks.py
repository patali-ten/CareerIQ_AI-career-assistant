from crewai import Task


def create_tasks(cv_text: str, job_description: str, agents: dict) -> list:
    resume_review_task = Task(
        description=f"""Review the following CV against the job description. Identify clear strengths,
specific areas for improvement, and provide an honest overall rating.

CV TEXT:
{cv_text}

JOB DESCRIPTION:
{job_description}

Return ONLY valid JSON with this exact structure:
{{
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement suggestion 1", "improvement suggestion 2", "improvement suggestion 3"],
  "overall_rating": "7/10"
}}""",
        expected_output='JSON object with keys: strengths (list of strings), improvements (list of strings), overall_rating (string like "7/10")',
        agent=agents["resume_reviewer"],
    )

    skill_gap_task = Task(
        description=f"""Analyze the skill gaps between this candidate's CV and the job description.
Identify which required skills are present, which are missing, and estimate a match score.

CV TEXT:
{cv_text}

JOB DESCRIPTION:
{job_description}

Return ONLY valid JSON with this exact structure:
{{
  "matched_skills": ["skill1", "skill2"],
  "missing_skills": ["skill3", "skill4"],
  "match_score": 72,
  "skill_gaps": [{{"skill": "skill3", "importance": "High"}}, {{"skill": "skill4", "importance": "Medium"}}]
}}""",
        expected_output='JSON object with keys: matched_skills, missing_skills, match_score (integer 0-100), skill_gaps (list of objects with skill and importance)',
        agent=agents["skill_gap_analyzer"],
        context=[resume_review_task],
    )

    job_match_task = Task(
        description=f"""Evaluate how well this candidate fits the job role. Give an honest match score,
a concise summary, and a clear recommendation on whether to apply.

CV TEXT:
{cv_text}

JOB DESCRIPTION:
{job_description}

Return ONLY valid JSON with this exact structure:
{{
  "match_score": 72,
  "summary": "2-3 sentence assessment of the candidate's overall fit for this role",
  "recommendation": "Strong candidate — apply immediately"
}}""",
        expected_output='JSON object with keys: match_score (integer), summary (string), recommendation (string)',
        agent=agents["job_matching"],
        context=[skill_gap_task],
    )

    career_advice_task = Task(
        description=f"""Provide strategic career advice for this candidate targeting this specific role.
Create a compelling positioning statement and 4-5 actionable advice points.

CV TEXT:
{cv_text}

JOB DESCRIPTION:
{job_description}

Return ONLY valid JSON with this exact structure:
{{
  "positioning_statement": "One powerful sentence on how the candidate should pitch themselves for this role",
  "advice": [
    "Specific actionable advice point 1",
    "Specific actionable advice point 2",
    "Specific actionable advice point 3",
    "Specific actionable advice point 4"
  ]
}}""",
        expected_output='JSON object with keys: positioning_statement (string), advice (list of strings)',
        agent=agents["career_advisor"],
        context=[job_match_task],
    )

    learning_path_task = Task(
        description=f"""Design a realistic week-by-week learning roadmap to help this candidate close
their skill gaps and become a strong candidate for this role within 8-12 weeks.

CV TEXT:
{cv_text}

JOB DESCRIPTION:
{job_description}

Return ONLY valid JSON with this exact structure:
{{
  "roadmap": [
    {{"week": "Week 1-2", "focus": "Topic to study", "action": "Specific thing to do or resource to use"}},
    {{"week": "Week 3-4", "focus": "Next topic", "action": "What to do"}},
    {{"week": "Week 5-6", "focus": "Next topic", "action": "What to do"}},
    {{"week": "Week 7-8", "focus": "Next topic", "action": "What to do"}},
    {{"week": "Week 9-10", "focus": "Next topic", "action": "What to do"}}
  ]
}}""",
        expected_output='JSON object with key: roadmap (list of objects with week, focus, action)',
        agent=agents["learning_path"],
        context=[skill_gap_task],
    )

    interview_prep_task = Task(
        description=f"""Generate exactly 5 targeted interview questions for this candidate applying to this role.
Include a mix of technical, behavioral, and situational questions based on the specific job requirements
and the candidate's profile.

Generate questions appropriate for an INTERNSHIP or ENTRY-LEVEL candidate. Questions must be concise (2-3 sentences max), direct, and answerable by a student or recent graduate. Do NOT ask questions that assume years of industry experience. Focus on academic projects, foundational concepts, and learning potential.

CV TEXT:
{cv_text}

JOB DESCRIPTION:
{job_description}

Return ONLY valid JSON with this exact structure:
{{
  "questions": [
    "Interview question 1",
    "Interview question 2",
    "Interview question 3",
    "Interview question 4",
    "Interview question 5"
  ]
}}""",
        expected_output='JSON object with key: questions (list of exactly 5 interview question strings)',
        agent=agents["interview_coach"],
        context=[skill_gap_task],
    )

    return [
        resume_review_task,
        skill_gap_task,
        job_match_task,
        career_advice_task,
        learning_path_task,
        interview_prep_task,
    ]
