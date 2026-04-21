from pydantic_settings import BaseSettings

class Settings(BaseSettings):

    PROJECT_NAME: str = "transaction-service"
    DATABASE_URL : str
    REDIS_URL: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ACCESS_TOKEN_EXPIRE_DAYS: int = 7

    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"

settings = Settings()