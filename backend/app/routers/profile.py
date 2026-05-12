from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user, hash_password, verify_password
import models, schemas

router = APIRouter(prefix="/profile", tags=["Profile"], redirect_slashes=False)

@router.get("", response_model=schemas.UserProfileOut)
def get_profile(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return current_user

@router.put("", response_model=schemas.UserProfileOut)
def update_profile(
    updates: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if updates.name is not None:
        current_user.name = updates.name

    if updates.email is not None:
        existing = db.query(models.User).filter(
            models.User.email == updates.email,
            models.User.id != current_user.id
        ).first()
        if existing:
            raise HTTPException(
                status_code=400,
                detail="Email already taken by another account"
            )
        current_user.email = updates.email

    if updates.new_password:
        if not updates.current_password:
            raise HTTPException(
                status_code=400,
                detail="Current password is required to set a new password"
            )
        if not verify_password(updates.current_password, current_user.hashed_password):
            raise HTTPException(
                status_code=400,
                detail="Current password is incorrect"
            )
        current_user.hashed_password = hash_password(updates.new_password)

    db.commit()
    db.refresh(current_user)
    return current_user