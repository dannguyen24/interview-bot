import json
import requests
from bs4 import BeautifulSoup
from openai import OpenAI
from app.core.config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

client = OpenAI(api_key=settings.openai_api_key)


def extract_job_description(text: str) -> dict:

    # Always return a dict with the expected keys and string values (empty if missing)
    empty_out = {"about_company": "", "responsibility": "", "requirement": ""}
    if text is None or text.strip() == "":
        return empty_out
    prompt = f"""
        Extract the following fields from the description. 
        Return ONLY a JSON object with these exact keys (use null for missing values):
        {{

            "about_company": null,
            "responsibility": null,
            "requirement": null
        }}
        about_company: A brief description of the company. What's the company's mission and values.
        responsibility: A summary of the job responsibilities and tasks.
        requirement: A summary of the job requirements and qualifications.
        Text:
    """
    prompt += text

    try:
        resp = client.responses.create(
            model="gpt-4o-mini",
            input=prompt,
            max_output_tokens=800,
            temperature=0,
        )
        raw_text = None
        if hasattr(resp, "output") and resp.output:
            pieces = []
            for o in resp.output:
                for c in getattr(o, "content", []):
                    # handle dict content shape or object with .text
                    if isinstance(c, dict) and c.get("type") == "output_text":
                        pieces.append(c.get("text", ""))
                    elif getattr(c, "text", None):
                        pieces.append(c.text)
            raw_text = "\n".join(pieces).strip()
        else:
            # fallback to string rendering
            raw_text = str(resp)

        # Find JSON substring if model returned extra text (robust parsing)
        try:
            parsed = json.loads(raw_text)
        except json.JSONDecodeError:
            import re
            m = re.search(r"\{.*\}", raw_text, flags=re.S)
            if not m:
                logger.warning("LLM output not JSON: %s", raw_text[:400])
                return None, None, None
            parsed = json.loads(m.group(0))

        # normalize and return strings (empty string for missing/null)
        out = {
            "about_company": parsed.get("about_company") or "",
            "responsibility": parsed.get("responsibility") or "",
            "requirement": parsed.get("requirement") or "",
        }

        return out

    except Exception as e:
        logger.exception("extract_job_description failed: %s", e)
        # on failure return empty fields
        return empty_out


def parse_json_ld(url: str) -> dict | None:
    """Fetch URL and extract job details using ld+json if available, otherwise fall back to heuristics and LLM.
    Returns a dict with the keys requested by the frontend (strings or empty string).
    """
    try:
        response = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=10)
        response.raise_for_status()
    except Exception:
        return None

    soup = BeautifulSoup(response.text, "html.parser")
    scripts = soup.find_all("script", type="application/ld+json")
    # print(soup)
    def _s(x):
        return x if isinstance(x, str) else (str(x) if x is not None else "")

    # try ld+json first
    for script in scripts:
        try:
            raw = script.string
            if not raw:
                continue
        except Exception:
            continue
        try:    
            data = json.loads(raw)
            # sometimes it's a list of objects
            if isinstance(data, list):
                for entry in data:
                    if entry.get("@type") == "JobPosting":
                        data = entry
                        break
            elif isinstance(data, dict) and data.get("@type") == "JobPosting":
                pass
            else:
                continue
            llm_out = extract_job_description(data.get("description") or "")
            about_company = llm_out.get("about_company", "")
            responsibility = llm_out.get("responsibility", "")
            requirement = llm_out.get("requirement", "")
            print("EXTRACTED", about_company, responsibility, requirement)
            job = {
                "title": _s(data.get("title")),
                "company": _s(data.get("hiringOrganization", {}).get("name") or data.get("hiringOrganization")),
                "location": _s(data.get("jobLocation", {}).get("address", {}).get("addressLocality") or
                               (data.get("jobLocation", {}).get("address", {}).get("addressRegion") or "")),
                "country": _s(data.get("jobLocation", {}).get("address", {}).get("addressCountry") or ""),
                "employment_type": _s(data.get("employmentType") or ""),
                "date_posted": _s(data.get("datePosted") or ""),
                "valid_through": _s(data.get("validThrough") or ""),
                "description": _s(data.get("description") or ""),
                "about_company": _s(about_company) if about_company else "",
                "responsibility": _s(responsibility) if responsibility else "",
                "requirement": _s(requirement) if requirement else "",
            }
            return job
        except Exception:
            print("Failed to parse ld+json script")
            continue