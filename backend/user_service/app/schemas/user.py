# what this file does -
# validates the request, response acc to the schema defined here

from datetime import datetime
from pydantic import BaseModel, EmailStr

# used for incoming data (eg registration request)
class UserCreate(BaseModel):
    email: EmailStr
    password: str

# used for outgoing data (eg api response)
# password omitted for security
class UserOut(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True
        # from_attributes = True: This is the critical setting for ORM integration.
        # Normally, Pydantic expects a dictionary (e.g., {"id": 1, "email": "..."}). With this setting, it can accept a SQLAlchemy object (e.g., db_user) and pull the data directly from its attributes (like db_user.id and db_user.email). 