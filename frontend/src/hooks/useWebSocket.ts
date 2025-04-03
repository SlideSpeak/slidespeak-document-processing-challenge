import { useState, useEffect, useRef, useCallback } from 'react';
import { ProgressUpdate } from '../types';
import { connectToDocumentProgress } from '../services/websocket';

/**
 * Custom hook for managing WebSocket connection to document progress
 *
 * @param documentId - The document ID to subscribe to
 * @returns Object containing progress updates, connection status, and error state
 */
export const useDocumentProgress = (documentId: string | null) => {
  const [updates, setUpdates] = useState<ProgressUpdate | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // TODO: Implement the custom hook
  // The hook should establish a WebSocket connection when documentId is available
  // It should handle connection status, updates, and errors
  // It should clean up the connection when the component unmounts or documentId changes

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!documentId) return;

    // Disconnect existing socket if any
    if (socketRef.current) {
      socketRef.current.close();
    }

    try {
      socketRef.current = connectToDocumentProgress(
        documentId,
        // On message
        (update) => {
          setUpdates(update);
        },
        // On error
        () => {
          setError('Failed to connect to document updates');
          setIsConnected(false);
        },
        // On open
        () => {
          setIsConnected(true);
          setError(null);
        },
        // On close
        () => {
          setIsConnected(false);
        }
      );
    } catch (err) {
      setError('Failed to establish WebSocket connection');
      setIsConnected(false);
    }
  }, [documentId]);

  // Connect on mount or when documentId changes
  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect, documentId]);

  // Reconnect function that can be called from components
  const reconnect = useCallback(() => {
    setError(null);
    connect();
  }, [connect]);

  return {
    updates,
    isConnected,
    error,
    reconnect,
  };
};
