from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from typing import List
from datetime import datetime, timezone

from app.api.deps import get_db, get_txn_db, get_current_user_id
from app.db.models import Budget
from app.schemas.budget import BudgetCreate, BudgetResponse

router = APIRouter(prefix="/budgets", tags=["budgets"])


def get_spent_this_month(txn_db: Session, user_id: int, category: str) -> float:
    """
    Query transaction_db directly for the total expense amount for this
    user+category in the current calendar month.
    """
    now = datetime.now(timezone.utc)
    result = txn_db.execute(
        text("""
            SELECT COALESCE(SUM(amount), 0)
            FROM transactions
            WHERE user_id    = :user_id
              AND category   = :category
              AND type       = 'expense'
              AND EXTRACT(YEAR  FROM date) = :year
              AND EXTRACT(MONTH FROM date) = :month
        """),
        {"user_id": user_id, "category": category, "year": now.year, "month": now.month},
    ).scalar()
    return float(result or 0)


@router.get("/", response_model=List[BudgetResponse])
def get_budgets(
    db:      Session = Depends(get_db),
    txn_db:  Session = Depends(get_txn_db),
    user_id: int     = Depends(get_current_user_id),
):
    budgets = db.query(Budget).filter(Budget.user_id == user_id).all()
    result  = []
    for b in budgets:
        spent = get_spent_this_month(txn_db, user_id, b.category)
        row   = BudgetResponse.model_validate(b)
        row.spent = spent
        result.append(row)
    return result


@router.post("/", response_model=BudgetResponse)
def create_budget(
    body:    BudgetCreate,
    db:      Session = Depends(get_db),
    txn_db:  Session = Depends(get_txn_db),
    user_id: int     = Depends(get_current_user_id),
):
    # Prevent duplicate category budgets per user
    existing = db.query(Budget).filter(
        Budget.user_id  == user_id,
        Budget.category == body.category,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Budget for '{body.category}' already exists.")

    budget = Budget(user_id=user_id, category=body.category, amount=body.amount)
    db.add(budget)
    db.commit()
    db.refresh(budget)

    spent = get_spent_this_month(txn_db, user_id, body.category)
    row   = BudgetResponse.model_validate(budget)
    row.spent = spent
    return row


@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(
    budget_id: int,
    body:      BudgetCreate,
    db:        Session = Depends(get_db),
    txn_db:    Session = Depends(get_txn_db),
    user_id:   int     = Depends(get_current_user_id),
):
    budget = db.query(Budget).filter(
        Budget.id      == budget_id,
        Budget.user_id == user_id,
    ).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    budget.category = body.category
    budget.amount   = body.amount
    db.commit()
    db.refresh(budget)

    spent = get_spent_this_month(txn_db, user_id, budget.category)
    row   = BudgetResponse.model_validate(budget)
    row.spent = spent
    return row


@router.delete("/{budget_id}")
def delete_budget(
    budget_id: int,
    db:        Session = Depends(get_db),
    user_id:   int     = Depends(get_current_user_id),
):
    budget = db.query(Budget).filter(
        Budget.id      == budget_id,
        Budget.user_id == user_id,
    ).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    db.delete(budget)
    db.commit()
    return {"message": "Deleted"}
