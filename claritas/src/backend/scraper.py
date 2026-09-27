# backend/scraper.py
import requests
from bs4 import BeautifulSoup

class ScrapingError(Exception):
    """Custom exception raised when web scraping fails to extract readable article content."""
    pass

def extract_text_from_input(raw_input: str) -> str:
    cleaned_input = raw_input.strip()
    
    if cleaned_input.startswith("http://") or cleaned_input.startswith("https://"):
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
            }
            response = requests.get(cleaned_input, headers=headers, timeout=8)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Strip non-content elements
            for element in soup(["script", "style", "nav", "header", "footer", "aside", "noscript", "iframe"]):
                element.decompose()
            
            # Extract paragraph text
            paragraphs = soup.find_all('p')
            extracted_text = ' '.join([p.get_text().strip() for p in paragraphs if len(p.get_text().strip()) > 20])
            
            # If paragraph extraction was too short, try fallback body text
            if len(extracted_text) < 150:
                extracted_text = soup.get_text(separator=' ').strip()
                # Clean up whitespace
                extracted_text = ' '.join(extracted_text.split())

            # If still less than 150 characters, the site blocked scraping or relies on client-side JS
            if len(extracted_text) < 150:
                raise ScrapingError("Extracted content is too short or blocked by JavaScript rendering.")

            return extracted_text
            
        except Exception as e:
            print(f"[Scraper Warning] Failed to scrape {cleaned_input}: {e}")
            raise ScrapingError(f"Could not scrape URL. The website might block automated readers or rely on JavaScript.")
            
    return cleaned_input