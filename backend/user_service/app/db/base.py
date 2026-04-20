# what this file does - declarative base for models

# allows alembic migrations, clean model registration

from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass