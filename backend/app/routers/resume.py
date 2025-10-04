from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class ParseResumeResponse(BaseModel):
    success: bool
    parsedResume: dict | None = None


@router.post("/parse", response_model=ParseResumeResponse)
def parse_resume():
    # placeholder - implement resume parsing service in controllers
    return {"success": True, "parsedResume": None}
