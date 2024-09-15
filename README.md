# Resume PDF Parser

This application allows users to upload LinkedIn PDF resumes, which are then parsed and converted into HTML format using the Gemini API. The application uses Express.js for server-side logic and Multer for handling file uploads.

## Features

- Upload PDF files through a web interface.
- Parse the content of the uploaded PDF resumes.
- Convert the parsed content into an HTML document.
- See the converted HTML resume.
- Download the converted HTML resume.

## Technologies Used

- **Node.js**: JavaScript runtime used for server-side logic.
- **Express.js**: Web framework for Node.js.
- **Multer**: Middleware for handling file uploads.
- **pdf-parse**: Library for parsing PDF files.
- **Axios**: HTTP client for making requests to the Gemini API.
- **Gemini API**: API used to convert resume text into HTML format.
- **HTML/CSS**: Used for building and styling the user interface.
- **Vercel**: Used to deploy the application.
## Setup and Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/TusharKhandelwal95/resume_pdf_to_html.git

2. **Install dependencies**

   ```bash
   npm install

3. **Create .env file**

   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here

3. **Run the application**

   ```bash
   node app.js
