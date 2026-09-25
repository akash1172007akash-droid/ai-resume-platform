from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ResumeSkillOut(BaseModel):
    id: int
    skill_name: str
    category: str

    class Config:
        from_attributes = True

class ResumeOut(BaseModel):
    id: int
    user_id: int
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None
    filename: str
    file_size: int
    uploaded_at: datetime
    skills_count: int = 0

    class Config:
        from_attributes = True

class ResumeDetailOut(ResumeOut):
    extracted_text: Optional[str] = None
    clean_text: Optional[str] = None
    skills: List[ResumeSkillOut] = []

    class Config:
        from_attributes = True
