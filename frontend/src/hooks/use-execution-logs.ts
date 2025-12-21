import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export interface ExecutionLog {
    executionId: string;
    type: 'START' | 'STDOUT' | 'STDERR' | 'COMPLETE' | 'ERROR';
    message: string;
    timestamp: string;
}

interface UseExecutionLogsOptions {
    onLog?: (log: ExecutionLog) => void;
    onComplete?: () => void;
    onError?: (error: string) => void;
}

export function useExecutionLogs(options: UseExecutionLogsOptions = {}) {
    const [logs, setLogs] = useState<ExecutionLog[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    // Initialize Socket.IO connection
    useEffect(() => {
        const backendUrl = import.meta.env.VITE_API_URL?.replace(/^http/, 'ws') || 'ws://localhost:3000';

        const socket = io(`${backendUrl}/execution-logs`, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        socket.on('connect', () => {
            console.log('[WebSocket] Connected to execution logs');
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('[WebSocket] Disconnected from execution logs');
            setIsConnected(false);
        });

        socket.on('execution-log', (log: ExecutionLog) => {
            console.log('[WebSocket] Received log:', log);

            setLogs((prev) => [...prev, log]);

            if (options.onLog) {
                options.onLog(log);
            }

            // Handle completion
            if (log.type === 'COMPLETE') {
                setIsExecuting(false);
                if (options.onComplete) {
                    options.onComplete();
                }
            }

            // Handle errors
            if (log.type === 'ERROR') {
                setIsExecuting(false);
                if (options.onError) {
                    options.onError(log.message);
                }
            }
        });

        socket.on('connect_error', (error) => {
            console.error('[WebSocket] Connection error:', error);
            setIsConnected(false);
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
        };
    }, [options]);

    // Subscribe to execution logs by ID
    const subscribeToExecution = useCallback((executionId: string) => {
        if (!socketRef.current) {
            console.error('[WebSocket] Socket not initialized');
            return;
        }

        console.log(`[WebSocket] Subscribing to execution: ${executionId}`);
        setLogs([]);
        setIsExecuting(true);

        // Emit subscribe event to backend
        socketRef.current.emit('subscribe', executionId);
    }, []);

    // Clear logs
    const clearLogs = useCallback(() => {
        setLogs([]);
        setIsExecuting(false);
    }, []);

    return {
        logs,
        isConnected,
        isExecuting,
        subscribeToExecution,
        clearLogs,
    };
}
