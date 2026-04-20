# what this file does - 

# db engine
# connection pooling
# session lifecycle

# important to note - other files never create engine

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit = False, autoflush=False, bind=engine)

# pool_pre_ping=True -> it tests the connection before using it to prevent "MySQL server has gone away" or similar disconnect errors
# autocommit = False -> Ensures you have full control over when to commit transactions, preventing accidental data persistence
# autoflush = False -> Prevents the session from sending changes to the database every time you run a query, which can be more performant and predictable during complex operations
# bind=engine -> The Bind creates the link. Without it, the sessionLocal() factory wouldn't know where to send your queries or where to get a connection from. Because you bound it at the sessionmaker level, you don't have to pass the engine every time you create a new session (e.g., db = sessionLocal())