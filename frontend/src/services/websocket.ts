import { ProgressUpdate } from '../types';

// Configure WebSocket base URL - should be environment variable in production
const WS_BASE_URL = 'ws://localhost:8000';

/**
 * Connect to WebSocket for document progress updates
 *
 * @param documentId - The document ID to subscribe to
 * @param onMessage - Callback for progress updates
 * @param onError - Callback for connection errors
 * @param onOpen - Callback for successful connection
 * @param onClose - Callback for connection close
 * @returns WebSocket instance
 */
export const connectToDocumentProgress = (
  documentId: string,
  onMessage: (update: ProgressUpdate) => void,
  onError?: (event: Event) => void,
  onOpen?: (event: Event) => void,
  onClose?: (event: CloseEvent) => void
): WebSocket => {
  const socket = new WebSocket(`${WS_BASE_URL}/ws/documents/${documentId}`);

  socket.onopen = (event) => {
    console.log(`Connected to document ${documentId} updates`);
    if (onOpen) onOpen(event);
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as ProgressUpdate;
      onMessage(data);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  };

  socket.onerror = (event) => {
    console.error('WebSocket error:', event);
    if (onError) onError(event);
  };

  socket.onclose = (event) => {
    console.log(`Disconnected from document ${documentId} updates`);
    if (onClose) onClose(event);
  };

  return socket;
};
