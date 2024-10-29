const express = require('express');
const cors = require('cors');
const multer = require('multer');  // To handle file uploads
const fs = require('fs');
const path = require('path');  // To handle file paths
const { PDFDocument } = require('pdf-lib');
const { createWorker } = require('tesseract.js');

const app = express();
app.use(cors());
app.use(express.json());

// Setup file storage for multer
const upload = multer({ dest: 'uploads/' });

// Initialize the Tesseract worker for OCR
const ocrWorker = createWorker();

// Function to extract pages as images from PDF
async function pdfToImages(pdfPath) {
    const pdfData = await fs.promises.readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfData);
    const imagePaths = [];

    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
        const page = pdfDoc.getPage(i);
        const { width, height } = page.getSize();
        
        // Convert each page to an image (canvas) for OCR processing
        const pngImage = await page.render({ width, height });
        const imagePath = path.join(__dirname, `uploads/page-${i + 1}.png`);
        
        // Save the image to the filesystem
        await fs.promises.writeFile(imagePath, pngImage);
        imagePaths.push(imagePath);
    }

    return imagePaths;
}

// OCR Logic to extract text from images
async function extractTextFromImages(imagePaths) {
    const extractedTexts = [];

    // Perform OCR on each image
    for (const imagePath of imagePaths) {
        await ocrWorker.load();
        await ocrWorker.loadLanguage('eng');
        await ocrWorker.initialize('eng');

        const { data: { text } } = await ocrWorker.recognize(imagePath);
        extractedTexts.push(text);

        // Clean up the image after OCR processing
        await fs.promises.unlink(imagePath);
    }

    return extractedTexts.join('\n'); // Combine all extracted texts
}

// PDF upload and extraction route
app.post('/extract', upload.single('file'), async (req, res) => {
    try {
        const filePath = req.file.path;
        const imagePaths = await pdfToImages(filePath);
        const extractedData = await extractTextFromImages(imagePaths);

        // Clean up the PDF file after extraction
        fs.unlinkSync(filePath);

        // Send the extracted data back to the client
        res.json({ extractedData });
    } catch (error) {
        console.error('Error extracting PDF data:', error);
        res.status(500).json({ error: 'Failed to extract data from PDF' });
    }
});

// Hardcoded login route
const hardcodedEmail = 'user@gmail.com';
const hardcodedPassword = 'password123';

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (email === hardcodedEmail && password === hardcodedPassword) {
        res.status(200).send('Login successful');
    } else {
        res.status(401).send('Invalid email or password');
    }
});

// Server setup
app.listen(5000, () => {
    console.log('Server running on port 5000');
});

// Cleanup on shutdown
process.on('exit', () => {
    ocrWorker.terminate();
});