import axios from 'axios';
import { DocumentStatus } from '../types';

// Configure API base URL - should be environment variable in production
const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Upload a document for processing
 *
 * @param file - The file to upload
 * @returns Document ID and initial status
 */
export const uploadDocument = async (file: File): Promise<DocumentStatus> => {
  // Create form data for file upload
  const formData = new FormData();
  formData.append('file', file);

  // TODO: Implement the request to upload a document
  // The endpoint should be POST /api/documents
  // Make sure to handle errors appropriately
};

/**
 * Get document status and results
 *
 * @param documentId - The document ID to check
 * @returns Document status and results if available
 */
export const getDocumentStatus = async (
  documentId: string
): Promise<DocumentStatus> => {
  // TODO: Implement the request to get document status
  // The endpoint should be GET /api/documents/{documentId}
  // Make sure to handle errors appropriately
};

export default api;
