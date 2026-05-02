from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "agent-service"
    TRANSACTION_DATABASE_URL: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ANTHROPIC_API_KEY: str
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


settings = Settings()
