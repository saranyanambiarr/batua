from sqlalchemy import Column, Integer, String, Date, Float
from app.db.base import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, nullable=False, index=True)  # from JWT — no FK constraint across services
    amount      = Column(Float, nullable=False)
    type        = Column(String, nullable=False)  # "income" | "expense"
    category    = Column(String, nullable=True)
    date        = Column(Date, nullable=False)
    note        = Column(String, nullable=True)
    comment     = Column(String, nullable=True)
    receipt_url = Column(String, nullable=True)
