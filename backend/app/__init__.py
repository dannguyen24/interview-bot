"""Backend application package"""

from fastapi import FastAPI

def create_app() -> FastAPI:
    app = FastAPI(title="HackAbby InterviewBot API")
    return app
