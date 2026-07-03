import json
import re
from crewai import Crew, Process
from backend.agents.crew.agents import create_agents
from backend.agents.crew.tasks import create_tasks


def _parse_json(text: str) -> dict:
    text = text.strip()
    text = re.sub(r'```json\s*', '', text)
    text = re.sub(r'```\s*', '', text)
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r'\{.*\}', text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
    return {}


_TASK_KEYS = [
    "resume_review",
    "skill_gaps",
    "job_match",
    "career_advice",
    "learning_path",
    "interview_prep",
]


class CareerCrew:
    def run(self, cv_text: str, job_description: str) -> dict:
        agents = create_agents()
        tasks = create_tasks(cv_text, job_description, agents)

        crew = Crew(
            agents=list(agents.values()),
            tasks=tasks,
            process=Process.sequential,
            verbose=True,
        )

        crew.kickoff()

        results = {}
        for key, task in zip(_TASK_KEYS, tasks):
            try:
                raw = ""
                if hasattr(task, "output") and task.output is not None:
                    raw = task.output.raw if hasattr(task.output, "raw") else str(task.output)
                results[key] = _parse_json(raw)
            except Exception as e:
                print(f"Warning: failed to parse {key} output — {e}")
                results[key] = {}

        return results
