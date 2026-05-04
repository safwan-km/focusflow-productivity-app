from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models, schemas
from typing import List, Optional

router = APIRouter(prefix="/tasks", tags=["Tasks"],redirect_slashes=False)

# ── Create Task ──
@router.post("", response_model=schemas.TaskOut)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    new_task = models.Task(**task.dict(), user_id=current_user.id)
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

# ── Get All Tasks ──
@router.get("", response_model=List[schemas.TaskOut])
def get_tasks(status: Optional[str] = None, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    query = db.query(models.Task).filter(models.Task.user_id == current_user.id)
    if status == "pending":
        query = query.filter(models.Task.status == "todo")
    elif status == "done":
        query = query.filter(models.Task.status == "done")
    return query.order_by(models.Task.created_at.desc()).all()

# ── Update Task ──
@router.put("/{task_id}", response_model=schemas.TaskOut)
def update_task(task_id: int, updated: schemas.TaskUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    for key, value in updated.dict(exclude_unset=True).items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    return task

# ── Delete Task ──
@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.user_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}