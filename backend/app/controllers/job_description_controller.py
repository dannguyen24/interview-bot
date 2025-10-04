import json
import requests
from bs4 import BeautifulSoup


def parse_json_ld(url: str) -> dict | None:
    """Fetch URL and extract a simple job doc {job, description} from ld+json JobPosting blocks.

    Returns None if no suitable JobPosting is found.
    """
    try:
        response = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=10)
        response.raise_for_status()
    except Exception:
        return None

    soup = BeautifulSoup(response.text, "html.parser")
    print(soup.prettify())
    scripts = soup.find_all("script", type="application/ld+json")

    for script in scripts:
        try:
            data = json.loads(script.string)
            if data.get("@type") == "JobPosting":
                print(data)
                return {
                    "title": data.get("title"),
                    "company": data.get("hiringOrganization", {}).get("name"),
                    "location": data.get("jobLocation", {}).get("address", {}).get("addressLocality"),
                    "country": data.get("jobLocation", {}).get("address", {}).get("addressCountry"),
                    "employment_type": data.get("employmentType"),
                    "date_posted": data.get("datePosted"),
                    "valid_through": data.get("validThrough"),
                    "description": data.get("description")
                }
        except Exception:
            continue

    return None


'''


# scraper-python.py
# To run this script, paste `python scraper-python.py` in the terminal

import requests
from bs4 import BeautifulSoup
import json

Parse job description from website using ld+json data
def parse_json_ld(url):
    response = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}) #add headers to mimic a browser visit
    soup = BeautifulSoup(response.text, 'html.parser')
    print(soup.prettify())
    print(response.status_code)
    
    # Extract job details from ld+json script tags
    scripts = soup.find_all("script", type="application/ld+json")
    
    for script in scripts:
        try:
            # Some ld+json blocks may contain multiple JSON objects
            data = json.loads(script.string)
            if data.get("@type") == "JobPosting":
                # return data
                return {
                    "title": data.get("title"),
                    "company": data.get("hiringOrganization", {}).get("name"),
                    "location": data.get("jobLocation", {}).get("address", {}).get("addressLocality"),
                    "country": data.get("jobLocation", {}).get("address", {}).get("addressCountry"),
                    "employment_type": data.get("employmentType"),
                    "date_posted": data.get("datePosted"),
                    "valid_through": data.get("validThrough"),
                    "description": data.get("description")
                }
        except Exception as e:
            # Some ld+json blocks may not be valid JSON
            continue
'''
