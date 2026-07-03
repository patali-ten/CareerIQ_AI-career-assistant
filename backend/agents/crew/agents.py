import os
from crewai import Agent
from backend.config import GEMINI_API_KEY, GEMINI_MODEL

# LiteLLM (used internally by CrewAI) reads the Gemini key from this env var.
os.environ["GEMINI_API_KEY"] = GEMINI_API_KEY

def create_agents() -> dict:
    llm = f"gemini/{GEMINI_MODEL}"

    career_advisor = Agent(
        role="Senior Career Advisor",
        goal="Provide strategic career guidance based on the candidate's profile and target role",
        backstory=(
            "15 years of career coaching experience across tech industries. Expert at "
            "identifying candidate strengths and positioning them for their target roles."
        ),
        llm=llm,
        verbose=True,
        allow_delegation=False,
    )

    resume_reviewer = Agent(
        role="Professional Resume Reviewer",
        goal="Critically analyze the CV for strengths, weaknesses, and improvement suggestions",
        backstory=(
            "Former HR director who has reviewed 10,000+ resumes. Knows exactly what "
            "hiring managers look for and how to make a CV stand out."
        ),
        llm=llm,
        verbose=True,
        allow_delegation=False,
    )

    skill_gap_analyzer = Agent(
        role="Technical Skill Gap Specialist",
        goal="Identify precise skill gaps between the candidate profile and job requirements",
        backstory=(
            "Ex-tech recruiter and software engineer who understands both sides — "
            "what candidates have and what companies actually need."
        ),
        llm=llm,
        verbose=True,
        allow_delegation=False,
    )

    job_matching = Agent(
        role="Job Fit Analyst",
        goal="Calculate how well the candidate matches the job and explain the reasoning",
        backstory=(
            "Data-driven recruiter who uses structured analysis to match candidates "
            "to roles, giving honest assessments with actionable feedback."
        ),
        llm=llm,
        verbose=True,
        allow_delegation=False,
    )

    interview_coach = Agent(
        role="Senior Interview Coach",
        goal="Conduct mock interviews and provide detailed feedback on answers",
        backstory=(
            "Ex-Google interviewer and career coach who has helped hundreds of "
            "candidates land roles at top companies through rigorous mock interview practice."
        ),
        llm=llm,
        verbose=True,
        allow_delegation=False,
    )

    learning_path = Agent(
        role="Personalized Learning Strategist",
        goal="Create a realistic, prioritized learning roadmap to close skill gaps",
        backstory=(
            "EdTech specialist and former university lecturer who designs practical "
            "learning paths that fit around a student's existing schedule and knowledge base."
        ),
        llm=llm,
        verbose=True,
        allow_delegation=False,
    )

    return {
        "career_advisor": career_advisor,
        "resume_reviewer": resume_reviewer,
        "skill_gap_analyzer": skill_gap_analyzer,
        "job_matching": job_matching,
        "interview_coach": interview_coach,
        "learning_path": learning_path,
    }
