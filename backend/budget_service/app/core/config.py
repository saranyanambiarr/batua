from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "budget-service"
    DATABASE_URL: str
    TRANSACTION_DATABASE_URL: str  # read-only connection to transaction_db for spent calculation
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"

    class Config:
        env_file = ".env"

settings = Settings()
