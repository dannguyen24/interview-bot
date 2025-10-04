from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class StartInterviewRequest(BaseModel):
    role: str
    profile: str | None = None


@router.post("/start")
def start_interview(req: StartInterviewRequest):
    return {"message": "Interview started (stub)", "role": req.role}
