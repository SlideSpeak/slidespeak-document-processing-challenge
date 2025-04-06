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
  try{
    // Create form data for file upload
    const formData = new FormData();
    formData.append('file', file);

    const {data} = await axios.post(`${API_BASE_URL}/api/documents`, formData)
    const { document_id, status } = data;

    return {
      documentId: document_id,
      status
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Axios error: ${error.message}`);
      const errorMessage = error?.response?.data?.error ?? "We're unable to process your document right now. Please try again later."
      throw new Error(`${errorMessage}`);
    } else {
      console.error(`Unexpected error: ${error}`);
      throw new Error('An unexpected error occurred while uploading the document.');
    }
  }
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

  try{
    if (!documentId){
      throw new Error("Document Id is required");
    }

    const {data} = await axios.get(`${API_BASE_URL}/api/documents/${documentId}`);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error(`Axios error: ${error.response.status} ${error.response.statusText}`);
        if (error.response.status === 404) {
          throw new Error(`Document with ID ${documentId} not found.`);
        } else {
          throw new Error(`Failed to fetch document status: ${error.response.statusText}`);
        }
      } else if (error.request) {
        console.error('Axios error: No response received');
        throw new Error('No response received from the server.');
      } else {
        console.error(`Axios error: ${error.message}`);
        throw new Error(`Failed to fetch document status: ${error.message}`);
      }
    } else {
      console.error(`Unexpected error: ${error}`);
      throw new Error('An unexpected error occurred while fetching document status.');
    }
  }

  
  
  
};

export default api;
