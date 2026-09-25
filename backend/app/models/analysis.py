from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum
from app.database.session import Base

class SkillStatus(str, enum.Enum):
    MATCHED = "MATCHED"
    MISSING = "MISSING"
    ADDITIONAL = "ADDITIONAL"

class MatchAnalysis(Base):
    __tablename__ = "match_analyses"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    similarity_score = Column(Float, nullable=False)        # Cosine similarity score as percentage (0-100)
    skill_match_percentage = Column(Float, nullable=False)  # Required skill match score as percentage (0-100)
    matched_skill_count = Column(Integer, nullable=False, default=0)
    required_skill_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    resume = relationship("Resume", back_populates="match_analyses")
    job = relationship("Job", back_populates="match_analyses")
    skill_gaps = relationship("SkillGap", back_populates="analysis", cascade="all, delete-orphan")

class SkillGap(Base):
    __tablename__ = "skill_gaps"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("match_analyses.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_name = Column(String(100), nullable=False)
    status = Column(Enum(SkillStatus), nullable=False, default=SkillStatus.MISSING)
    learning_recommendation = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    analysis = relationship("MatchAnalysis", back_populates="skill_gaps")

class LearningRecommendation(Base):
    __tablename__ = "learning_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    skill_name = Column(String(100), unique=True, nullable=False)
    category = Column(String(80), nullable=False)
    recommendation_title = Column(String(255), nullable=False)
    recommendation_details = Column(Text, nullable=False)
    resource_link = Column(String(300), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
