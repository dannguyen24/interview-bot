from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.controllers.job_description_controller import parse_json_ld

router = APIRouter()


class JobUrlRequest(BaseModel):
    url: str


class SimpleJobDoc(BaseModel):
    title: str | None = None
    company: str | None = None
    location: str | None = None
    country: str | None = None
    employment_type: str | None = None
    date_posted: str | None = None
    valid_through: str | None = None
    description: str | None = None


@router.post("/parse-job-description", response_model=SimpleJobDoc)
def parse_job_description(payload: JobUrlRequest):
    job_data = parse_json_ld(payload.url)
    print({"return": job_data})
    if not job_data:
        raise HTTPException(status_code=404, detail="Job description not found")

    # coerce into the response model to ensure consistent keys/types
    try:
        return SimpleJobDoc(**job_data)
    except Exception as e:
        # surface validation error in logs and return what we have as a fallback
        print("Response validation failed:", e)
        return {"title": job_data.get("title"), "description": job_data.get("description")}