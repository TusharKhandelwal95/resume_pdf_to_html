const express = require('express');
const multer = require('multer');
const pdf = require('pdf-parse');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Serve static files (like HTML)
app.use(express.static('public'));

// Store HTML content temporarily
let htmlContent = '';

// Define a route for the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Serve the HTML form
});

// Route to handle file upload and parsing
app.post('/upload', upload.single('pdf'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        // Parse the PDF
        const data = await pdf(req.file.buffer);

        // Send the parsed text to the Gemini API to convert it into HTML
        const geminiResponse = await sendToGemini(data.text);

        // Format the response into HTML content
        htmlContent = formatGeminiResponse(geminiResponse);

        // Send the HTML content as the response
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Converted Resume</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                    }
                </style>
            </head>
            <body>
                <h1>Your Converted Resume</h1>
                <div>${htmlContent}</div>
                <a href="/download" download="resume.html">Download Resume</a>
            </body>
            </html>
        `);

    } catch (err) {
        res.status(500).send('Error processing request: ' + err.message);
    }
});

// Route to handle downloading the HTML file
app.get('/download', (req, res) => {
    if (!htmlContent) {
        return res.status(404).send('No content available for download.');
    }

    // Send the HTML content for download
    res.setHeader('Content-disposition', 'attachment; filename=resume.html');
    res.setHeader('Content-type', 'text/html');
    res.send(htmlContent);
});

// Function to send parsed text to the Gemini API
async function sendToGemini(parsedText) {
    const apiKey = process.env.GEMINI_API_KEY; // Get API key from .env file
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    // Adjust the request body to ask for HTML conversion without review
    const requestBody = {
        contents: [
            {
                parts: [
                    { text: `Convert this resume text into basic HTML format:\n\n${parsedText}` }
                ]
            }
        ]
    };

    try {
        const response = await axios.post(url, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Assuming the response contains HTML content
        return response.data;
    } catch (error) {
        throw new Error('Error calling Gemini API: ' + error.message);
    }
}

// Function to format Gemini API response and remove outer HTML structure
function formatGeminiResponse(response) {
    const content = response.candidates[0]?.content?.parts[0]?.text ?? '';

    // Remove any outer HTML structure that might have been added
    let cleanContent = content
        .replace(/```html/g, '') // Remove unnecessary ```html
        .replace(/<!DOCTYPE html>[\s\S]*?<body>/, '') // Remove the entire DOCTYPE and opening HTML tags
        .replace(/<\/body>\s*<\/html>/, '') // Remove the closing body and HTML tags
        .trim(); // Clean up any excess whitespace

    // Return just the body content without wrapping it in additional HTML structure
    return cleanContent;
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
