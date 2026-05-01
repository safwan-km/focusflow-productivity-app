from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# ── Auth ──
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# ── Tasks ──
class TaskCreate(BaseModel):
    title: str
    priority: Optional[str] = "medium"
    due_date: Optional[str] = None
    estimated_mins: Optional[int] = 25
    notes: Optional[str] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[str] = None
    estimated_mins: Optional[int] = None
    notes: Optional[str] = None
    is_done: Optional[bool] = None

class TaskOut(BaseModel):
    id: int
    title: str
    priority: str
    due_date: Optional[str]
    estimated_mins: int
    notes: Optional[str]
    is_done: bool
    created_at: datetime
    class Config:
        from_attributes = True

# ── Focus Sessions ──
class SessionCreate(BaseModel):
    task_id: Optional[int] = None
    duration_mins: int = 25

class SessionOut(BaseModel):
    id: int
    task_id: Optional[int]
    duration_mins: int
    created_at: datetime
    class Config:
        from_attributes = True