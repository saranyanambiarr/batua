from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Budget service own DB
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Read-only connection to transaction_db to calculate spent amounts
txn_engine = create_engine(settings.TRANSACTION_DATABASE_URL, pool_pre_ping=True)
TxnSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=txn_engine)
