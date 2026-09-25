"""PDF text extraction service using PyMuPDF (fitz).
Robustly handles empty, corrupted, and non-text (scanned) PDFs.
"""

from pathlib import Path
import pymupdf  # PyMuPDF
from fastapi import HTTPException, status

class PDFExtractionError(HTTPException):
    """Custom exception for PDF extraction issues."""
    def __init__(self, detail: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        super().__init__(status_code=status_code, detail=detail)


def extract_text_from_pdf(file_path: str) -> str:
    """
    Extracts text page by page from a PDF file using PyMuPDF.

    Args:
        file_path: Absolute or relative path to PDF file.

    Returns:
        Clean combined text string.

    Raises:
        PDFExtractionError: If PDF cannot be opened, is corrupted, or has no extractable text.
    """
    path = Path(file_path)
    if not path.exists():
        raise PDFExtractionError(
            detail=f"Resume file not found at path: {path.name}",
            status_code=status.HTTP_404_NOT_FOUND
        )

    try:
        doc = pymupdf.open(str(path))
    except Exception as e:
        raise PDFExtractionError(
            detail=f"The uploaded file could not be read as a valid PDF. File may be corrupted or encrypted: {str(e)}",
            status_code=status.HTTP_400_BAD_REQUEST
        )

    if doc.page_count == 0:
        doc.close()
        raise PDFExtractionError(
            detail="The uploaded PDF file contains 0 pages.",
            status_code=status.HTTP_400_BAD_REQUEST
        )

    extracted_pages = []
    for page_num in range(doc.page_count):
        try:
            page = doc.load_page(page_num)
            text = page.get_text("text")
            if text and text.strip():
                extracted_pages.append(text.strip())
        except Exception as e:
            # Continue reading other pages if one page has minor render issue
            continue

    doc.close()

    combined_text = "\n\n".join(extracted_pages).strip()

    if not combined_text:
        raise PDFExtractionError(
            detail="Unable to extract text from this PDF. Please upload a text-based PDF resume.",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
        )

    return combined_text
