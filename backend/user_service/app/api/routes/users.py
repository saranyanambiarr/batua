# What this file does -

# GET /users/me
# GET /users/{id} (internal-only)
# profile updates

# Keeps auth logic separate from user resource logic.
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.db.models import User
from app.schemas.user import UserOut

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.delete("/me", status_code=204)
def delete_me(response: Response, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.delete(current_user)
    db.commit()
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return None