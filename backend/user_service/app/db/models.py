# what this file does -

# database schema matlab table banaega
# orm mappings

# rules - no pydantic here, no api logic here

from sqlalchemy import Column, Integer, String, DateTime, Boolean
from datetime import datetime, timezone

from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))

    # Email verification
    is_verified           = Column(Boolean, default=False, nullable=False)
    verification_token    = Column(String, nullable=True)   # one-time token sent in link
    verification_sent_at  = Column(DateTime, nullable=True) # to enforce token expiry