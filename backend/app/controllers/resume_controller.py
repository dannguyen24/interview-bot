import os
import pdfplumber
# import docx
import json
from openai import OpenAI
from app.core.config import settings

client = OpenAI(api_key=settings.openai_api_key)
UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"pdf", "docx"}

async def parse_resume_controller(file):
    # Step 1: Validate file type
    ext = file.filename.rsplit(".", 1)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError("File type not allowed")

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as f:
        f.write(await file.read())

    # Step 2: Extract text
    if ext == "pdf":
        extracted_text = extract_pdf(file_path)
    # elif ext == "docx":
    #     extracted_text = extract_docx(file_path)
    else:
        raise ValueError("Unsupported file type")

    if not extracted_text.strip():
        raise ValueError("Failed to extract text")

    # Step 3: Call GPT to extract structured resume data
    response = client.responses.create(
        model="gpt-4.1",
        input=f"""
        Extract resume details and return JSON strictly matching this schema:
        {{
          "name": "string",
          "email": "string",
          "phone": "string",
          "summary": "string",
          "experience": [
            {{
              "company": "string",
              "position": "string",
              "duration": "string",
              "description": "string"
            }}
          ],
          "education": [
            {{
              "institution": "string",
              "degree": "string",
              "year": "string",
              "field": "string"
            }}
          ],
          "skills": ["string"],
          "projects": [
            {{
              "name": "string",
              "description": "string",
              "technologies": ["string"],
              "duration": "string"
            }}
          ]
        }}
        Resume text:
        {extracted_text}
        """,
        # response_format={"type": "json_object"},
    )

    # Step 4: Parse GPT output safely
    result = json.loads(response.output[0].content[0].text)
    return result


def extract_pdf(path):
    text = ""
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    return text


# def extract_docx(path):
#     doc = docx.Document(path)
#     return "\n".join([para.text for para in doc.paragraphs])
