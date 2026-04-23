from pydantic import BaseModel
from datetime import date
from typing import Optional

class TransactionCreate(BaseModel):
    amount: float
    type: str
    category: Optional[str] = None
    date: date
    note: Optional[str] = None
    comment: Optional[str] = None

class TransactionResponse(BaseModel):
    id: int
    amount: float
    type: str
    category: Optional[str]
    date: date
    note: Optional[str]
    comment: Optional[str]
    receipt_url: Optional[str]

    class Config:
        from_attributes = True