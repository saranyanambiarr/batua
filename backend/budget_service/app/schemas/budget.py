from pydantic import BaseModel
from datetime import datetime


class BudgetCreate(BaseModel):
    category: str
    amount: float


class BudgetResponse(BaseModel):
    id:         int
    user_id:    int
    category:   str
    amount:     float
    spent:      float = 0.0   # injected at query time from transaction_db
    created_at: datetime

    model_config = {"from_attributes": True}
