# Resume Rocket 🚀

Resume Rocket is a web application that provides powerful tools for processing resumes and analyzing meeting transcripts. The application leverages a modern React frontend and a Node.js/Express backend to deliver fast, locally-processed insights.

## Features

- **Resume Text Extractor**: Upload PDF or Image resumes to extract text completely locally using `pdfjs-dist` (for PDFs) and `tesseract.js` (for images/OCR).
- **Meeting Translate & Summarize**: Extract transcripts from YouTube videos and generate summaries. (Currently uses a local extraction approach without needing an external API key).
- **History Tracking**: Saves your extracted resumes and meeting summaries so you can access them later. 
- **Authentication**: User accounts are supported so that history can be tracked individually.
- **Local First**: Prioritizes local processing to ensure your data stays secure and doesn't rely on expensive or restricted third-party APIs.

## Tech Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Node.js, Express
- **Database**: SQLite (`better-sqlite3`) for lightweight, local storage

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- npm (comes with Node.js)

## Getting Started

### 1. Install Dependencies

First, install the necessary dependencies for both the frontend and backend:

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory. At a minimum, you may want to set up your database connection, though SQLite will automatically create a local file by default.

### 3. Run the Development Servers

You need to run both the backend server and the frontend development server concurrently.

**Start the Backend Server:**
In one terminal window, run:
```bash
npm run server:dev
```
*The server will start on http://localhost:5000*

**Start the Frontend App:**
In a separate terminal window, run:
```bash
npm run dev
```
*The frontend will start on http://localhost:8081 (or another available port)*

## Usage

- **Resume Extraction**: Go to the Resume Extractor page, upload your PDF or image files, and the application will extract the text for you locally.
- **Meeting Summaries**: Paste a YouTube link into the Meeting Translate page. The app will fetch the transcript and provide a basic local summary of the content.

## License

This project is licensed under the MIT License.
