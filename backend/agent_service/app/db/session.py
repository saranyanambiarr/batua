from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Read-only connection to transaction_db — same pattern as budget_service
txn_engine = create_engine(settings.TRANSACTION_DATABASE_URL, pool_pre_ping=True)
TxnSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=txn_engine)
