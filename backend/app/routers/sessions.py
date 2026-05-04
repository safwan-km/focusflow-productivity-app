from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models, schemas
from typing import List

router = APIRouter(prefix="/sessions", tags=["Sessions"], redirect_slashes=False)

# ── Save Focus Session ──
@router.post("", response_model=schemas.SessionOut)
def create_session(
    session: schemas.SessionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    new_session = models.FocusSession(**session.dict(), user_id=current_user.id)
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session

# ── Get Session History ──
@router.get("", response_model=List[schemas.SessionOut])
def get_sessions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.FocusSession).filter(
        models.FocusSession.user_id == current_user.id
    ).order_by(models.FocusSession.created_at.desc()).limit(50).all()