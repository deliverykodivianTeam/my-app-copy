import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';

const InvoiceUploader = () => {
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);

    // Handle file drop or selection using React Dropzone
    const onDrop = useCallback((acceptedFiles) => {
        setFile(acceptedFiles[0]);  // Set the first accepted file (since only one file is allowed)
    }, []);

    // Handle form submission and file upload
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('file', file);  // Attach the file to form data

        try {
            const response = await axios.post('http://localhost:5000/extract', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },  // Send the file as multipart/form-data
            });
            setResult(response.data.extractedData);  // Set extracted text
        } catch (error) {
            console.error('Error uploading the file', error);
        }
    };

    // Dropzone configuration
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <div>
            <h1>Upload Invoice PDF</h1>

            {/* Dropzone area */}
            <div {...getRootProps()} style={{ border: '2px dashed #cccccc', padding: '20px', cursor: 'pointer' }}>
                <input {...getInputProps()} />
                {isDragActive ? (
                    <p>Drop the file here...</p>
                ) : (
                    <p>Drag 'n' drop a PDF file here, or click to select one</p>
                )}
            </div>

            {/* Show the selected file name */}
            {file && <p>Selected file: {file.name}</p>}

            {/* Submit button to trigger extraction */}
            <button onClick={handleSubmit} disabled={!file}>Extract</button>

            {/* Display the extracted text if available */}
            {result && (
                <div>
                    <h2>Extracted Data</h2>
                    <pre>{result}</pre>  {/* Display the extracted data */}
                </div>
            )}
        </div>
    );
};

export default InvoiceUploader;