# AI Presentation Analyzer - Frontend

This is the frontend for the AI Presentation Analyzer coding challenge. This React application allows users to upload documents, monitor the analysis in real-time, and view the extracted insights.

## Tech Stack

- React 18 with TypeScript
- Tailwind CSS for styling
- React Dropzone for file uploads
- WebSocket for real-time updates
- Axios for API requests

## Setup and Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Implementation Tasks

To complete this challenge, you need to implement the following components and functionality:

### 1. API Service (`src/services/api.ts`)

- [ ] Complete the `uploadDocument` function to send files to the backend
- [ ] Implement the `getDocumentStatus` function to retrieve document status
- [ ] Add proper error handling and response parsing

### 2. WebSocket Service

- [ ] Ensure the WebSocket connection is established correctly
- [ ] Implement error handling and reconnection logic
- [ ] Parse and validate incoming WebSocket messages

### 3. App Component (`src/App.tsx`)

- [ ] Complete the file upload handler to process uploads
- [ ] Implement the document status polling logic
- [ ] Handle WebSocket updates and status transitions
- [ ] Add proper error handling and user feedback

## Project Structure

- `/src/components`: React components for the UI
- `/src/services`: API and WebSocket services
- `/src/hooks`: Custom React hooks
- `/src/types`: TypeScript type definitions

## Backend API Endpoints

The backend API is available at `http://localhost:8000` and provides the following endpoints:

- `POST /api/documents`: Upload a document for processing
- `GET /api/documents/{document_id}`: Get document status and results
- `WebSocket /ws/documents/{document_id}`: Real-time progress updates

## Evaluation Criteria

Your implementation will be evaluated based on:

1. **Functionality**: Does it work as expected? Can users upload documents and see results?
2. **Code Quality**: Is the code well-organized, readable, and maintainable?
3. **Error Handling**: Does it gracefully handle errors and edge cases?
4. **Real-time Updates**: Does it effectively use WebSockets for real-time progress?
5. **UI/UX**: Is the interface intuitive and responsive?

## Stretch Goals

If you complete the core requirements and have time remaining, consider implementing:

- [ ] Add file validation (size, type) with user-friendly error messages
- [ ] Implement caching of previous results
- [ ] Add animations for state transitions
- [ ] Create a more detailed results view with visualizations
- [ ] Add unit tests for components and services

Good luck with your implementation!
