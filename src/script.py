import fitz  # PyMuPDF for PDF handling
import pytesseract
from PIL import Image
import sys
import os

def pdf_to_text(pdf_path):
    try:
        # Open the PDF file
        pdf_document = fitz.open(pdf_path)
        text = ""

        # Iterate through each page
        for page_num in range(len(pdf_document)):
            page = pdf_document.load_page(page_num)
            pix = page.get_pixmap()

            # Convert pixmap to an image
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

            # Use Tesseract to do OCR on the image
            text += pytesseract.image_to_string(img)
        
        return text

    except Exception as e:
        return f"Error extracting text: {str(e)}"


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Error: No PDF file path provided.")
        sys.exit(1)

    pdf_path = sys.argv[1]

    # Ensure the file exists
    if not os.path.exists(pdf_path):
        print(f"Error: File '{pdf_path}' not found.")
        sys.exit(1)

    # Extract text from the PDF file
    extracted_text = pdf_to_text(pdf_path)

    # Output the extracted text
    print(extracted_text)