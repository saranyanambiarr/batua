# What this file does - central place for fastapi dependencies

# DB session
# current user
# token validation
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.session import SessionLocal
from app.db.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# below is the fastapi dependency to manage the lifecycle of the db connection
#from app.db.session import SessionLocal

def get_db():
    db = SessionLocal() # creates a new db session for a specific req
    try:
        yield db # pauses the function and hands over the session to our route. The route uses this session to talk to the db
    finally:
        db.close() # once the route finishes, even if it crashes with an error, this code resumes and closes the connection to prevent memory leaks

# Use the above code by injecting it into the endpoints with Depends

# benefits of using this - 1 session per request, automatic cleanup, safety
'''
def get_current_user(token:str = Depends(oauth2_scheme), db = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials"
    )
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user'''

# Earlier we were reading from headers, Now read from cookies

def get_current_user(request: Request, db = Depends(get_db)):
    token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user