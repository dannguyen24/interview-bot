from typing import Union
from fastapi import FastAPI
from app.routers import job_description as job_description_router
from app.routers import resume as resume_router
from app.routers import interview as interview_router

app = FastAPI(title="HackAbby InterviewBot API")


app.include_router(job_description_router.router, prefix="/api/jobs", tags=["jobs"])
app.include_router(resume_router.router, prefix="/api/resumes", tags=["resumes"])
app.include_router(interview_router.router, prefix="/api/interviews", tags=["interview"])



# @app.post("/parse_resume/")


# @app.post("/generate_questions/")
# def generate_questions():
#     return {"message": "Questions generated based on job description and resume"}

# @app.post("/feedback/")
# def feedback():
#     return {"message": "Feedback received"}