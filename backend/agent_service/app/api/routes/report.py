from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from pydantic import BaseModel

from app.api.deps import get_txn_db, get_current_user_id
from app.db.models import Transaction
from app.services.gemini import compute_aggregates, generate_report
from app.core.logging import get_logger

logger = get_logger("agent_service.report")

router = APIRouter(prefix="/report", tags=["Report"])


class ReportRequest(BaseModel):
    start_date: date
    end_date:   date


@router.post("/generate")
def generate_expense_report(
    req:     ReportRequest,
    db:      Session = Depends(get_txn_db),
    user_id: int     = Depends(get_current_user_id),
):
    transactions = (
        db.query(Transaction)
        .filter(
            Transaction.user_id == user_id,
            Transaction.date    >= req.start_date,
            Transaction.date    <= req.end_date,
        )
        .all()
    )

    if not transactions:
        raise HTTPException(
            status_code=404,
            detail="No transactions found in this period. Add some transactions first.",
        )

    aggregates = compute_aggregates(transactions)
    logger.info(
        "Generating AI report",
        extra={
            "user_id":    user_id,
            "txn_count":  aggregates["transaction_count"],
            "start_date": str(req.start_date),
            "end_date":   str(req.end_date),
        },
    )

    report = generate_report(aggregates, str(req.start_date), str(req.end_date))

    return {
        "stats":  aggregates,
        "report": report,
        "period": {"start": str(req.start_date), "end": str(req.end_date)},
    }
