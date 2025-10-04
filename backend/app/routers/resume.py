from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from app.controllers.resume_controller import parse_resume_controller

router = APIRouter()

class ParseResumeResponse(BaseModel):
    success: bool
    parsedResume: dict | None = None


@router.post("/parse-resume", response_model=ParseResumeResponse)
async def parse_resume_endpoint(file: UploadFile = File(...)):
    try:
        result = await parse_resume_controller(file)
        return {"success": True, "parsedResume": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
