# What this file does - 

# enviroment variables
# secrets
# service level config

# why separate?
# K8s -> configmaps & secrets
# 12 factor app compliance
# no hardcoded values


# used in the pydantic library for managing application settings and env vars
from pydantic_settings import BaseSettings
# pip install pydantic-settings
# BaseSettings provides functionality to load settings from multiple sources, validate data and define a structured configuration

# define a class inheriting from BaseSettings with type-hinted fields, creating a clear and type-safe configuration for your application

class Settings(BaseSettings):

    PROJECT_NAME: str = "user-service"
    DATABASE_URL: str
    REDIS_URL: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ACCESS_TOKEN_EXPIRE_DAYS: int = 7

    # Email
    RESEND_API_KEY: str
    EMAIL_FROM: str
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


settings = Settings()
