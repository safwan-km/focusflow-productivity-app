from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models
from groq import Groq
import os
import json
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

load_dotenv()

router = APIRouter(prefix="/ai", tags=["AI"], redirect_slashes=False)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class PlanRequest(BaseModel):
    date: Optional[str] = None
    focus_hours: Optional[int] = 4

@router.post("/plan")
def generate_plan(
    request: PlanRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    tasks = db.query(models.Task).filter(
        models.Task.user_id == current_user.id,
        models.Task.status != "done"
    ).order_by(models.Task.created_at.desc()).all()

    if not tasks:
        raise HTTPException(
            status_code=400,
            detail="No pending tasks found. Add some tasks first!"
        )

    today = request.date or datetime.utcnow().strftime("%Y-%m-%d")
    focus_hours = request.focus_hours or 4

    task_list = "\n".join([
        f"- {t.title} (Priority: {t.priority}, Category: {t.category}, "
        f"Estimated: {t.estimated_mins} mins, Due: {t.due_date or 'No due date'})"
        for t in tasks
    ])

    prompt = f"""You are a productivity coach for a student using FocusFlow app.

Today's date: {today}
Available focus time: {focus_hours} hours
Student's pending tasks:
{task_list}

Create a realistic daily study plan. Return ONLY a JSON object with this exact structure, no other text:
{{
    "greeting": "Good morning! Here is your plan for today.",
    "date": "{today}",
    "total_focus": "{focus_hours} hours",
    "plan": [
        {{
            "time": "9:00 AM",
            "task": "Task name here",
            "duration": "25 min",
            "priority": "high",
            "tip": "A short helpful tip for this task"
        }}
    ],
    "motivation": "A short motivational message for the student"
}}

Rules:
- Schedule tasks based on priority (high priority tasks first)
- Use Pomodoro sessions (25 min focus blocks)
- Include short breaks between sessions (label priority as break)
- Be realistic with the available {focus_hours} hours
- Maximum 8 plan items
- Return ONLY valid JSON, absolutely no other text before or after"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are a productivity coach. Always respond with valid JSON only. No markdown, no explanation, just the JSON object."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=1000,
        )

        content = response.choices[0].message.content.strip()
        content = content.replace("```json", "").replace("```", "").strip()

        plan_data = json.loads(content)
        return plan_data

    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500,
            detail="AI returned invalid response. Please try again."
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI service error: {str(e)}"
        )