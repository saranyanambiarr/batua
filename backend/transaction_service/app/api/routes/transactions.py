from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date

from app.api.deps import get_db, get_current_user_id
from app.db.models import Transaction
from app.schemas.transaction import TransactionResponse, TransactionCreate
from app.core.logging import get_logger

logger = get_logger("transaction_service.transactions")

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.post("/", response_model=TransactionResponse)
def create_transaction(
    amount:   float         = Form(...),
    type:     str           = Form(...),
    category: Optional[str] = Form(None),
    date:     date          = Form(...),
    note:     Optional[str] = Form(None),
    proof:    Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    # TODO: upload proof file to S3/Cloudinary and store URL
    receipt_url = None

    txn = Transaction(
        user_id=user_id,
        amount=amount,
        type=type,
        category=category,
        date=date,
        note=note,
        receipt_url=receipt_url,
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)
    logger.info("Transaction created", extra={"user_id": user_id, "txn_id": txn.id, "type": type, "amount": amount, "category": category})
    return txn


@router.get("/", response_model=List[TransactionResponse])
def get_transactions(
    type: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    query = db.query(Transaction).filter(Transaction.user_id == user_id)

    if type:
        query = query.filter(Transaction.type == type)
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)

    return query.order_by(Transaction.date.desc()).all()


@router.put("/{txn_id}", response_model=TransactionResponse)
def update_transaction(
    txn_id: int,
    data: TransactionCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    txn = db.query(Transaction).filter(
        Transaction.id == txn_id,
        Transaction.user_id == user_id,
    ).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    for key, value in data.dict().items():
        setattr(txn, key, value)

    db.commit()
    db.refresh(txn)
    return txn


@router.delete("/{txn_id}")
def delete_transaction(
    txn_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    txn = db.query(Transaction).filter(
        Transaction.id == txn_id,
        Transaction.user_id == user_id,
    ).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    db.delete(txn)
    db.commit()
    logger.info("Transaction deleted", extra={"user_id": user_id, "txn_id": txn_id})
    return {"message": "Deleted"}


@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    income = db.query(func.sum(Transaction.amount)).filter(
        Transaction.type == "income",
        Transaction.user_id == user_id,
    ).scalar() or 0
    expense = db.query(func.sum(Transaction.amount)).filter(
        Transaction.type == "expense",
        Transaction.user_id == user_id,
    ).scalar() or 0
    return {
        "income": income,
        "expense": expense,
        "balance": income - expense,
    }
