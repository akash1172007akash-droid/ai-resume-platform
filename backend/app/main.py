"""FastAPI Application Entry Point for AI Resume Intelligence & Job Matching Platform.
Supports standalone API mode and unified single-port production SPA serving.
"""

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from pathlib import Path

from app.core.config import settings
from app.database.session import Base, engine, SessionLocal
from app.models.analysis import LearningRecommendation
from app.ml.skill_gap import LEARNING_RECOMMENDATIONS_CATALOG
from app.ml.skills import SKILL_TO_CATEGORY

from app.api.auth import router as auth_router
from app.api.resumes import router as resumes_router
from app.api.jobs import router as jobs_router
from app.api.analysis import router as analysis_router
from app.api.dashboard import router as dashboard_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database tables exist
    Base.metadata.create_all(bind=engine)

    # Seed learning recommendations catalog if empty
    db = SessionLocal()
    try:
        count = db.query(LearningRecommendation).count()
        if count == 0:
            for skill_name, data in LEARNING_RECOMMENDATIONS_CATALOG.items():
                cat = SKILL_TO_CATEGORY.get(skill_name, "General")
                rec = LearningRecommendation(
                    skill_name=skill_name,
                    category=cat,
                    recommendation_title=data["title"],
                    recommendation_details=data["description"],
                    resource_link=data.get("resource", "")
                )
                db.add(rec)
            db.commit()
    except Exception as e:
        db.rollback()
    finally:
        db.close()

    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Professional Recruitment Technology Platform featuring NLP Text Extraction, TF-IDF Vectorization, Cosine Similarity Job Matching, and Skill Gap Analysis.",
    lifespan=lifespan
)

# CORS middleware
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers under /api
app.include_router(auth_router, prefix="/api")
app.include_router(resumes_router, prefix="/api")
app.include_router(jobs_router, prefix="/api")
app.include_router(analysis_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")


@app.get("/health", tags=["System"])
def health_check():
    return {"status": "healthy", "platform": settings.PROJECT_NAME, "version": settings.VERSION}


# Check if compiled frontend exists for unified deployment
frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if frontend_dist.exists() and (frontend_dist / "index.html").exists():
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}", tags=["Frontend SPA"])
    async def serve_spa(full_path: str):
        # Don't intercept API or docs routes
        if full_path.startswith("api/") or full_path in ("docs", "redoc", "openapi.json", "health"):
            return JSONResponse({"detail": "Not Found"}, status_code=status.HTTP_404_NOT_FOUND)
        
        target_file = frontend_dist / full_path
        if target_file.exists() and target_file.is_file():
            return FileResponse(target_file)
        return FileResponse(frontend_dist / "index.html")
else:
    @app.get("/", tags=["System"])
    def root():
        return {
            "platform": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "status": "online",
            "docs_url": "/docs",
            "note": "AI Resume Intelligence & Job Matching Platform REST API"
        }
