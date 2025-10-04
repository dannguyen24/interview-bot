import json
import requests
from bs4 import BeautifulSoup
from openai import OpenAI
from app.core.config import settings

client = OpenAI(api_key=settings.openai_api_key)


def extract_job_details_with_llm(text: str) -> dict:
    """Ask the LLM to extract specific fields and return a JSON object with snake_case keys.

    Keys returned (strings or null):
      - title, company, location, country, employment_type, date_posted, valid_through,
      - about_company, responsibility, requirement
    """
    prompt = f"""
        Extract the following fields from the text. Return ONLY a JSON object with these exact keys (use null for missing values):
        {{
        "title": null,
        "company": null,
        "location": null,
        "country": null,
        "employment_type": null,
        "date_posted": null,
        "valid_through": null,
        "about_company": null,
        "responsibility": null,
        "requirement": null
        }}

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
        # Different SDK shapes: find text
        raw = None
        if hasattr(resp, "output") and resp.output:
            # new responses API
            # try to join all text content pieces
            parts = []
            for o in resp.output:
                for c in getattr(o, "content", []):
                    # c may have .text or .type
                    if isinstance(c, dict) and c.get("type") == "output_text":
                        parts.append(c.get("text", ""))
                    elif getattr(c, "text", None):
                        parts.append(c.text)
            raw = "\n".join(parts)
        else:
            raw = str(resp)

        parsed = json.loads(raw)
        # normalize keys to expected set
        keys = [
            "title",
            "company",
            "location",
            "country",
            "employment_type",
            "date_posted",
            "valid_through",
            "about_company",
            "responsibility",
            "requirement",
        ]
        return {k: (parsed.get(k) if parsed.get(k) is not None else None) for k in keys}
    except Exception:
        # on failure return all None
        return {k: None for k in [
            "title",
            "company",
            "location",
            "country",
            "employment_type",
            "date_posted",
            "valid_through",
            "about_company",
            "responsibility",
            "requirement",
        ]}


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
    print(soup)
    def _s(x):
        return x if isinstance(x, str) else (str(x) if x is not None else "")

    # try ld+json first
    for script in scripts:
        try:
            raw = script.string
            if not raw:
                continue
            data = json.loads(raw)
            items = data if isinstance(data, list) else [data]
            for item in items:
                if item.get("@type") != "JobPosting":
                    continue

                hiring = item.get("hiringOrganization") or {}
                job_location = item.get("jobLocation") or {}
                address = job_location.get("address") or {}

                title = _s(item.get("title") or item.get("name") or "")
                company = _s(hiring.get("name") or "")
                location = _s(address.get("addressLocality") or "")
                country = _s(address.get("addressCountry") or "")
                employment_type = _s(item.get("employmentType") or "")
                date_posted = _s(item.get("datePosted") or "")
                valid_through = _s(item.get("validThrough") or "")
                # treat description as plain text and ask LLM to extract about_company, responsibility, requirement
                description = _s(item.get("description") or hiring.get("description") or "")

                # ask LLM to extract fields from description text
                if description:
                    llm_out = extract_job_details_with_llm(description)
                else:
                    llm_out = {k: None for k in [
                        "title",
                        "company",
                        "location",
                        "country",
                        "employment_type",
                        "date_posted",
                        "valid_through",
                        "about_company",
                        "responsibility",
                        "requirement",
                    ]}

                about_company = _s(llm_out.get("about_company") or "")
                responsibility = _s(llm_out.get("responsibility") or "")
                requirement = _s(llm_out.get("requirement") or "")

                return {
                    "title": title,
                    "company": company,
                    "location": location,
                    "country": country,
                    "employment_type": employment_type,
                    "date_posted": date_posted,
                    "valid_through": valid_through,
                    "about_company": about_company,
                    "responsibility": responsibility,
                    "requirement": requirement,
                }
        except Exception:
            continue

    # Fallback: ask LLM on the full page text
    page_text = soup.get_text("\n", strip=True)
    if page_text:
        llm_out = extract_job_details_with_llm(page_text)
        # convert None to empty strings for consistent frontend shape
        return {k: (v or "") for k, v in llm_out.items()}

    return None
