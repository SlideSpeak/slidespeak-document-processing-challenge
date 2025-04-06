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
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const TIMEOUT_THRESHOLD = 30000;
  // Circuit breaker attributes for reconnection
  const RECONNECT_MAX_ATTEMPTS = 3;
  var CURRENT_RECONNECT_ATTEMPTS = 0;

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
          resetTimeout();
        },
        // On error
        () => {
          setError('Failed to connect to document updates');
          setIsConnected(false);
          reconnect();
        },
        // On open
        () => {
          startTimeout();
          setIsConnected(true);
          setError(null);
        },
        // On close
        () => {
          setIsConnected(false);
          clearTimeout(timeoutRef.current!);
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

    return () => {
      if (socketRef.current) {
        console.log('Closing ws connection');
        socketRef.current.close();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [connect, documentId]);

  // Reconnect function that can be called from components
  const reconnect = useCallback(() => {
    // setError(null);
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    // Circuit breaker checks for reconnection
    CURRENT_RECONNECT_ATTEMPTS++;
    if (CURRENT_RECONNECT_ATTEMPTS >= RECONNECT_MAX_ATTEMPTS) {
      // Max attempts tried, flip the circuit breaker
      console.error('Reached maximum reconnect attempts, will rely on polling');
    } else {
      // Attempt to reconnect after 1 second
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 1000); 
    }
    
  }, [connect]);

  const startTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      var updates  = '{"progress": -1, "status": "error"}';
      setUpdates(updates);
      if (socketRef.current) {
        reconnect();
      }
    }, TIMEOUT_THRESHOLD); // Wait for the specified threshold before timing out
  }, []);

  const resetTimeout = useCallback(() => {
    startTimeout(); // Restart the timeout countdown on each message
  }, [startTimeout]);

  const closeConnection = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      console.log('Closing WebSocket connection...');
      socketRef.current.close();
    }
  }, []);

  return {
    updates,
    isConnected,
    error,
    reconnect,
    closeConnection
  };
};
