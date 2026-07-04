from crewai import Task


_CONCISE_INSTRUCTION = """
IMPORTANT: Keep your response concise and simple. Use plain English.
Maximum 3-4 bullet points per section. No long paragraphs.
Write as if explaining to a student, not writing a formal report.
Be direct and actionable."""


def create_tasks(cv_text: str, job_description: str, agents: dict) -> list:
    resume_review_task = Task(
        description=f"""Review the following CV against the job description. Identify clear strengths,
specific areas for improvement, and provide an honest overall rating.
{_CONCISE_INSTRUCTION}

CV TEXT:
{cv_text}

JOB DESCRIPTION:
{job_description}""",
        expected_output='A JSON object with keys: strengths (max 3 items, one short sentence each), '
                         'improvements (max 3 items, one short sentence each), overall_rating '
                         '(a string like "7/10"). Plain English, no long paragraphs. '
                         'Return ONLY the JSON object, no extra commentary.',
        agent=agents["resume_reviewer"],
    )

    skill_gap_task = Task(
        description=f"""Analyze the skill gaps between this candidate's CV and the job description.
Identify which required skills are present, which are missing, and estimate a match score.
{_CONCISE_INSTRUCTION}

CV TEXT:
{cv_text}

JOB DESCRIPTION:
{job_description}""",
        expected_output='A JSON object with keys: matched_skills (list of skill name strings), '
                         'missing_skills (list of skill name strings), match_score (an integer from '
                         '0 to 100), skill_gaps (a list of objects, each with a "skill" string and an '
                         '"importance" string of "High" or "Medium"). Return ONLY the JSON object, '
                         'no extra commentary.',
        agent=agents["skill_gap_analyzer"],
        context=[resume_review_task],
    )

    job_match_task = Task(
        description=f"""Evaluate how well this candidate fits the job role. Give an honest match score,
a concise summary, and a clear recommendation on whether to apply.
{_CONCISE_INSTRUCTION}

CV TEXT:
{cv_text}

JOB DESCRIPTION:
{job_description}""",
        expected_output='A JSON object with keys: match_score (an integer from 0 to 100), summary '
                         '(a 2-3 sentence string assessing the candidate\'s overall fit for this role), '
                         'recommendation (a short string, e.g. "Strong candidate — apply immediately"). '
                         'Return ONLY the JSON object, no extra commentary.',
        agent=agents["job_matching"],
        context=[skill_gap_task],
    )

    career_advice_task = Task(
        description=f"""Provide strategic career advice for this candidate targeting this specific role.
Create a compelling positioning statement and up to 3 actionable advice points.
{_CONCISE_INSTRUCTION}

CV TEXT:
{cv_text}

JOB DESCRIPTION:
{job_description}""",
        expected_output='A JSON object with keys: positioning_statement (maximum 2 sentences on how '
                         'the candidate should pitch themselves for this role), advice (a list of up '
                         'to 3 short, actionable advice strings). Plain English, no long paragraphs. '
                         'Return ONLY the JSON object, no extra commentary.',
        agent=agents["career_advisor"],
        context=[job_match_task],
    )

    learning_path_task = Task(
        description=f"""Design a realistic week-by-week learning roadmap to help this candidate close
their skill gaps and become a strong candidate for this role within the next 6 weeks.
{_CONCISE_INSTRUCTION}

CV TEXT:
{cv_text}

JOB DESCRIPTION:
{job_description}""",
        expected_output='A JSON object with key: roadmap, a list of up to 6 weekly entries each '
                         'containing week (a string like "Week 1"), focus (a few words on the topic), '
                         'and action (one short line on what to do). Plain English, no long '
                         'paragraphs. Return ONLY the JSON object, no extra commentary.',
        agent=agents["learning_path"],
        context=[skill_gap_task],
    )

    interview_prep_task = Task(
        description=f"""Generate exactly 5 targeted interview questions for this candidate applying to this role.
Include a mix of technical, behavioral, and situational questions based on the specific job requirements
and the candidate's profile.

Generate questions appropriate for an INTERNSHIP or ENTRY-LEVEL candidate. Questions must be concise (2-3 sentences max), direct, and answerable by a student or recent graduate. Do NOT ask questions that assume years of industry experience. Focus on academic projects, foundational concepts, and learning potential.
{_CONCISE_INSTRUCTION}

CV TEXT:
{cv_text}

JOB DESCRIPTION:
{job_description}""",
        expected_output='A JSON object with key: questions, a list of exactly 5 interview question '
                         'strings, no sub-questions. Plain English. Return ONLY the JSON object, no '
                         'extra commentary.',
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
