import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy.engine import URL

# Load .env file from backend directory if present
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    PROJECT_NAME: str = "AI Resume Intelligence & Job Matching Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # MySQL connection parameters
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "Akash1107@")
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: int = int(os.getenv("DB_PORT", "3306"))
    DB_NAME: str = os.getenv("DB_NAME", "ai_resume_db")

    # JWT Authentication
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super_secret_jwt_key_replace_with_secure_random_string_in_production_32bytes")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

    # File uploads
    UPLOAD_DIRECTORY: str = os.getenv("UPLOAD_DIRECTORY", "./uploads/resumes")
    MAX_FILE_SIZE: int = int(os.getenv("MAX_FILE_SIZE", str(10 * 1024 * 1024))) # 10 MB limit
    ALLOWED_EXTENSIONS: set = {".pdf"}
    ALLOWED_MIME_TYPES: set = {"application/pdf"}

    def get_database_url(self):
        """Construct a robust SQLAlchemy URL object avoiding percent-encoding issues."""
        raw_url = os.getenv("DATABASE_URL")
        if raw_url and raw_url.startswith("sqlite"):
            return raw_url
        return URL.create(
            drivername="mysql+pymysql",
            username=self.DB_USER,
            password=self.DB_PASSWORD,
            host=self.DB_HOST,
            port=self.DB_PORT,
            database=self.DB_NAME
        )

    def get_upload_path(self) -> Path:
        base_dir = Path(__file__).resolve().parent.parent.parent
        upload_path = base_dir / self.UPLOAD_DIRECTORY
        upload_path.mkdir(parents=True, exist_ok=True)
        return upload_path

settings = Settings()
