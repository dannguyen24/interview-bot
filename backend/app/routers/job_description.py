from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.controllers.job_description_controller import parse_json_ld

router = APIRouter()


class JobUrlRequest(BaseModel):
    url: str


class SimpleJobDoc(BaseModel):
    title: str
    company: str
    location: str
    country: str
    employment_type: str
    date_posted: str
    valid_through: str
    description: str


@router.post("/parse_job_description", response_model=SimpleJobDoc)
def parse_job_description(payload: JobUrlRequest):
    job_data = parse_json_ld(payload.url)
    if not job_data:
        raise HTTPException(status_code=404, detail="Job description not found")
    return job_data