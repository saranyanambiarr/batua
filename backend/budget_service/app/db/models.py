from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime, timezone
from app.db.base import Base


class Budget(Base):
    __tablename__ = "budgets"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, nullable=False, index=True)
    category   = Column(String, nullable=False)
    amount     = Column(Float, nullable=False)   # monthly spending limit
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
