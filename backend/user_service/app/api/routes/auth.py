# What this file does -

# /register
# /login
# token issuance
# input validation via schemas
# delegates logic -> services/db
# oauth2 pwd flow logic

# what this file doesnt do - raw sql, business rules, security primitves


import secrets
from datetime import datetime, timezone, timedelta

from fastapi import HTTPException, APIRouter, Depends, Response, Request
from sqlalchemy.orm import Session
from jose import jwt
from pydantic import BaseModel
from app.core.config import settings
from app.schemas.user import UserCreate
from app.db.models import User
from app.api.deps import get_db
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.services.email import send_verification_email, send_password_reset_email
from app.services.email import PASSWORD_RESET_EXPIRY_HOURS

VERIFICATION_TOKEN_EXPIRY_HOURS = 24

router = APIRouter(prefix="/auth", tags=["auth"])
# APIRouter is a miniapp that helps organize code into separate files; without it main file would become very big
# prefix -> shorthand for the URLs; automatically puts /auth infront of every route defined within this router
# tags -> for documentation and organization; in Swagger UI the endpoints are found under the heading auth; in a large app with 50+ endpoints, finding related functions is easier with tags
'''
@router.post("/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_user = User(
        email = user.email,
        hashed_password = hash_password(user.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    token = create_access_token(str(db_user.id))
    return {"access_token": token}'''# this sends the token as a JSON response body directly to the client (like a browser, mobile app, or frontend framework). While a user might "see" it if they are looking at the raw network response or using the FastAPI Swagger UI, it is not meant for the human user to read. Instead, it is meant for the client-side application to use programmatically
# where is it used - 1. Storage - the frontend captures the JSON response and stores the token in a secure place like localStorage, sessionStorage or a secure cookie
# 2. Authorization Header - for every subsequent request to a protected route (eg: /users/me), the frontend automatically attaches the token to the request's HTTP headers. Format: Authorization: Bearer <your-access-token>
# 3. Server Verification - when the fastapi server receives this header, the security dependencies extract the token, verify its signature and identify which user is making the request.
@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email).first()

    if existing:
        if existing.is_verified:
            raise HTTPException(status_code=400, detail="Email already registered")
        # Unverified account: refresh the token and resend the email
        verification_token = secrets.token_urlsafe(32)
        existing.hashed_password      = hash_password(user.password)
        existing.verification_token   = verification_token
        existing.verification_sent_at = datetime.now(timezone.utc)
        db.commit()
        send_verification_email(to_email=existing.email, token=verification_token)
        return {"message": "Account created. Please check your email to verify your account."}

    verification_token = secrets.token_urlsafe(32)

    db_user = User(
        email=user.email,
        hashed_password=hash_password(user.password),
        is_verified=False,
        verification_token=verification_token,
        verification_sent_at=datetime.now(timezone.utc),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    send_verification_email(to_email=db_user.email, token=verification_token)

    return {"message": "Account created. Please check your email to verify your account."}

@router.post("/login")
def login(user: UserCreate, response: Response, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user:
        raise HTTPException(status_code=401, detail="No account found with that email.")
    if not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect password.")

    if not db_user.is_verified:
        raise HTTPException(status_code=403, detail="Please verify your email address before logging in.")

    access_token = create_access_token(str(db_user.id))
    refresh_token = create_refresh_token(str(db_user.id))
    # set access_token
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,# in prod; in dev -> False
        samesite="lax",
        max_age=60 * 15 # 15 mins
    )
    # set refresh_token
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,# in prod; in dev -> False
        samesite="lax",
        max_age=60 * 60 * 24 * 7 # 7 days
    )
    return {"message": "Login successful"}

@router.get("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    """
    Called when user clicks the link in their verification email.
    Marks the account as verified so they can log in.
    """
    db_user = db.query(User).filter(User.verification_token == token).first()

    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid or expired verification link.")

    # Check token hasn't expired
    if db_user.verification_sent_at:
        expiry = db_user.verification_sent_at.replace(tzinfo=timezone.utc) + timedelta(hours=VERIFICATION_TOKEN_EXPIRY_HOURS)
        if datetime.now(timezone.utc) > expiry:
            raise HTTPException(status_code=400, detail="Verification link has expired. Please register again.")

    db_user.is_verified         = True
    db_user.verification_token  = None  # consume the token so it can't be reused
    db.commit()

    return {"message": "Email verified successfully. You can now log in."}

@router.post("/refresh")
def refresh(request: Request, response: Response):
    refresh_token = request.cookies.get("refresh_token")

    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token")

    try:
        payload = jwt.decode(refresh_token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("sub")
    except:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    new_access_token = create_access_token(user_id)

    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        secure=False,# in prod -> True; in dev -> False
        samesite="Lax",
        max_age=60 * 15
    )

    return {"message": "Token refreshed"}

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"message": "Logged out"}

class ForgotPasswordRequest(BaseModel):
    email: str

@router.post("/forgot-password")
def forgot_password(body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    If the email belongs to a verified account, generates a password reset token
    and sends a reset link to that address. Always returns the same response to
    avoid leaking whether an account exists.
    """
    user = db.query(User).filter(User.email == body.email.strip().lower()).first()

    if user and user.is_verified:
        reset_token = secrets.token_urlsafe(32)
        user.password_reset_token   = reset_token
        user.password_reset_sent_at = datetime.now(timezone.utc)
        db.commit()
        send_password_reset_email(to_email=user.email, token=reset_token)

    return {"message": "If an account with that email exists, a reset link has been sent."}


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


@router.post("/reset-password")
def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Validates the reset token and updates the user's password.
    """
    user = db.query(User).filter(User.password_reset_token == body.token).first()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link.")

    if user.password_reset_sent_at:
        expiry = user.password_reset_sent_at.replace(tzinfo=timezone.utc) + timedelta(hours=PASSWORD_RESET_EXPIRY_HOURS)
        if datetime.now(timezone.utc) > expiry:
            raise HTTPException(status_code=400, detail="Reset link has expired. Please request a new one.")

    user.hashed_password      = hash_password(body.new_password)
    user.password_reset_token   = None  # consume token so it can't be reused
    user.password_reset_sent_at = None
    db.commit()

    return {"message": "Password updated successfully. You can now log in."}

@router.get("/status")
def auth_status(request: Request):
    """
    Always returns 200. Returns { authenticated: true/false } based on
    whether a valid access_token cookie exists. Never raises 401, so the
    browser console stays clean for unauthenticated visitors.
    """
    token = request.cookies.get("access_token")
    if not token:
        return {"authenticated": False}

    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("sub") is None:
            return {"authenticated": False}
        return {"authenticated": True}
    except Exception:
        return {"authenticated": False}