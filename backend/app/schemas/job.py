from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class JobBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    company: str = Field(..., min_length=2, max_length=200)
    description: str = Field(..., min_length=10)
    experience_level: str = Field(default="Entry-level", max_length=80)

class JobCreate(JobBase):
    required_skills: List[str] = Field(default_factory=list)
    preferred_skills: List[str] = Field(default_factory=list)

class JobUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    description: Optional[str] = None
    experience_level: Optional[str] = None
    required_skills: Optional[List[str]] = None
    preferred_skills: Optional[List[str]] = None

class JobOut(JobBase):
    id: int
    recruiter_id: int
    created_at: datetime
    updated_at: datetime
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    analysis_count: int = 0

    class Config:
        from_attributes = True
