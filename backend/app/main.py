from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import Base, engine, get_db
from auth import get_current_user
from routers import tasks, sessions
import models
from datetime import datetime, timedelta

Base.metadata.create_all(bind=engine)

app = FastAPI(title="FocusFlow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(tasks.router)
app.include_router(sessions.router)

@app.get("/")
def root():
    return {"message": "FocusFlow API is running ✅"}

# ── Auth Routes ──
from fastapi import HTTPException
import schemas, auth

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
@app.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    today = datetime.utcnow().date()
    week_ago = today - timedelta(days=7)

    tasks_today = db.query(models.Task).filter(
        models.Task.user_id == current_user.id,
        models.Task.status == "done",
        func.date(models.Task.created_at) == today
    ).count()

    tasks_this_week = db.query(models.Task).filter(
        models.Task.user_id == current_user.id,
        models.Task.status == "done",
        func.date(models.Task.created_at) >= week_ago
    ).count()

    # Focus hours per day for last 7 days
    focus_data = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        mins = db.query(func.sum(models.FocusSession.duration_mins)).filter(
            models.FocusSession.user_id == current_user.id,
            func.date(models.FocusSession.created_at) == day
        ).scalar() or 0
        focus_data.append({"date": str(day), "hours": round(mins / 60, 1)})

    return {
        "tasks_today": tasks_today,
        "tasks_this_week": tasks_this_week,
        "focus_hours_last_7_days": focus_data,
        "streak_days": 0  # We'll calculate this properly later
    }