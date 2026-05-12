from fastapi import FastAPI, Depends,Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import Base, engine, get_db
from auth import get_current_user
from routers import tasks, sessions, ai_planner, profile
import models
from datetime import datetime, timedelta,date
from fastapi import HTTPException
import schemas, auth

Base.metadata.create_all(bind=engine)

app = FastAPI(title="FocusFlow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(tasks.router)
app.include_router(sessions.router)
app.include_router(ai_planner.router)
app.include_router(profile.router)

@app.get("/")
def root():
    return {"message": "FocusFlow API is running ✅"}

# ── Auth Routes ──
@app.post("/auth/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = models.User(
        email=user.email,
        hashed_password=auth.hash_password(user.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/auth/login", response_model=schemas.Token)
def login(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = auth.create_access_token(data={"sub": db_user.email})
    return {"access_token": token, "token_type": "bearer"}

# ── Dashboard ──

def normalize_date(value):
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    if isinstance(value, str):
        return datetime.fromisoformat(value).date()
    return value


def parse_due_date(value):
    if not value:
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError:
        return None


def priority_rank(priority):
    return {"high": 0, "medium": 1, "low": 2}.get(priority, 3)


def due_label(due, today):
    if not due:
        return "No date"
    if due < today:
        return "Overdue"
    if due == today:
        return "Today"
    if due == today + timedelta(days=1):
        return "Tomorrow"
    return due.strftime("%d %b")


@app.get("/dashboard")
def get_dashboard(
    week_offset: int = Query(0, ge=-12, le=0),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    today = datetime.utcnow().date()
    yesterday = today - timedelta(days=1)

    current_week_start = today - timedelta(days=today.weekday())
    current_week_end = current_week_start + timedelta(days=6)
    previous_week_start = current_week_start - timedelta(days=7)
    previous_week_end = current_week_start - timedelta(days=1)

    selected_week_start = current_week_start + timedelta(days=week_offset * 7)
    selected_week_end = selected_week_start + timedelta(days=6)

    pending_tasks = db.query(models.Task).filter(
        models.Task.user_id == current_user.id,
        models.Task.status != "done"
    ).count()

    due_today_tasks = db.query(models.Task).filter(
        models.Task.user_id == current_user.id,
        models.Task.status != "done",
        models.Task.due_date == str(today)
    ).count()

    overdue_tasks = db.query(models.Task).filter(
        models.Task.user_id == current_user.id,
        models.Task.status != "done",
        models.Task.due_date.isnot(None),
        models.Task.due_date < str(today)
    ).count()

    tasks_today = db.query(models.Task).filter(
        models.Task.user_id == current_user.id,
        models.Task.status == "done",
        func.date(models.Task.completed_at) == today
    ).count()

    tasks_yesterday = db.query(models.Task).filter(
        models.Task.user_id == current_user.id,
        models.Task.status == "done",
        func.date(models.Task.completed_at) == yesterday
    ).count()

    tasks_this_week = db.query(models.Task).filter(
        models.Task.user_id == current_user.id,
        models.Task.status == "done",
        func.date(models.Task.completed_at) >= current_week_start,
        func.date(models.Task.completed_at) <= current_week_end
    ).count()

    tasks_previous_week = db.query(models.Task).filter(
        models.Task.user_id == current_user.id,
        models.Task.status == "done",
        func.date(models.Task.completed_at) >= previous_week_start,
        func.date(models.Task.completed_at) <= previous_week_end
    ).count()

    focus_minutes_today = db.query(func.sum(models.FocusSession.duration_mins)).filter(
        models.FocusSession.user_id == current_user.id,
        func.date(models.FocusSession.created_at) == today
    ).scalar() or 0

    focus_sessions_today = db.query(models.FocusSession).filter(
        models.FocusSession.user_id == current_user.id,
        func.date(models.FocusSession.created_at) == today
    ).count()

    focus_minutes_this_week = db.query(func.sum(models.FocusSession.duration_mins)).filter(
        models.FocusSession.user_id == current_user.id,
        func.date(models.FocusSession.created_at) >= current_week_start,
        func.date(models.FocusSession.created_at) <= current_week_end
    ).scalar() or 0

    tasks_per_day = []
    focus_hours_per_day = []

    for i in range(7):
        day = selected_week_start + timedelta(days=i)

        task_count = db.query(models.Task).filter(
            models.Task.user_id == current_user.id,
            models.Task.status == "done",
            func.date(models.Task.completed_at) == day
        ).count()

        focus_mins = db.query(func.sum(models.FocusSession.duration_mins)).filter(
            models.FocusSession.user_id == current_user.id,
            func.date(models.FocusSession.created_at) == day
        ).scalar() or 0

        tasks_per_day.append({
            "date": str(day),
            "day": day.strftime("%a"),
            "label": "Today" if day == today else day.strftime("%a, %d %b"),
            "tasks": task_count,
            "is_today": day == today
        })

        focus_hours_per_day.append({
            "date": str(day),
            "day": day.strftime("%a"),
            "label": "Today" if day == today else day.strftime("%a, %d %b"),
            "hours": round(focus_mins / 60, 1),
            "is_today": day == today
        })

    task_dates = db.query(func.date(models.Task.completed_at)).filter(
        models.Task.user_id == current_user.id,
        models.Task.status == "done",
        models.Task.completed_at.isnot(None)
    ).distinct().all()

    session_dates = db.query(func.date(models.FocusSession.created_at)).filter(
        models.FocusSession.user_id == current_user.id
    ).distinct().all()

    activity_days = {normalize_date(row[0]) for row in task_dates}
    activity_days.update({normalize_date(row[0]) for row in session_dates})

    streak_days = 0
    check_day = today

    while check_day in activity_days:
        streak_days += 1
        check_day -= timedelta(days=1)

    longest_streak = 0
    current_streak = 0

    for i in range(365, -1, -1):
        day = today - timedelta(days=i)
        if day in activity_days:
            current_streak += 1
            longest_streak = max(longest_streak, current_streak)
        else:
            current_streak = 0

    active_tasks = db.query(models.Task).filter(
        models.Task.user_id == current_user.id,
        models.Task.status != "done"
    ).all()

    active_tasks.sort(
        key=lambda task: (
            parse_due_date(task.due_date) is None,
            parse_due_date(task.due_date) or date.max,
            priority_rank(task.priority),
            task.created_at
        )
    )

    upcoming_tasks = []
    for task in active_tasks[:5]:
        due = parse_due_date(task.due_date)
        upcoming_tasks.append({
            "id": task.id,
            "title": task.title,
            "priority": task.priority,
            "status": task.status,
            "category": task.category,
            "due_date": task.due_date,
            "due_label": due_label(due, today),
            "is_overdue": bool(due and due < today)
        })

    return {
        "user_email": current_user.email,
        "pending_tasks": pending_tasks,
        "due_today_tasks": due_today_tasks,
        "overdue_tasks": overdue_tasks,
        "tasks_today": tasks_today,
        "tasks_yesterday": tasks_yesterday,
        "tasks_today_delta": tasks_today - tasks_yesterday,
        "tasks_this_week": tasks_this_week,
        "tasks_previous_week": tasks_previous_week,
        "tasks_week_delta": tasks_this_week - tasks_previous_week,
        "focus_minutes_today": focus_minutes_today,
        "focus_sessions_today": focus_sessions_today,
        "focus_minutes_this_week": focus_minutes_this_week,
        "streak_days": streak_days,
        "longest_streak_days": longest_streak,
        "is_personal_best": streak_days > 0 and streak_days >= longest_streak,
        "week": {
            "offset": week_offset,
            "start": str(selected_week_start),
            "end": str(selected_week_end),
            "label": "This week" if week_offset == 0 else "Previous week",
            "tasks_per_day": tasks_per_day,
            "focus_hours_per_day": focus_hours_per_day
        },
        "upcoming_tasks": upcoming_tasks
    }
