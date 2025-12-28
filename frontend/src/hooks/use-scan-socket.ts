import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/graphql', '') || 'http://localhost:3000';

export interface ScanSocketEvent {
    scanId: string;
    type?: string; // Event type: scan:created, scan:started, scan:progress, scan:completed, scan:failed
    timestamp: string;
    data?: any;
}

export interface UseScanSocketReturn {
    socket: Socket | null;
    connected: boolean;
    joinScan: (scanId: string) => void;
    leaveScan: (scanId: string) => void;
    on: (event: string, handler: (data: ScanSocketEvent) => void) => void;
    off: (event: string, handler?: (data: ScanSocketEvent) => void) => void;
}

export function useScanSocket(): UseScanSocketReturn {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const socketInstance = io(`${SOCKET_URL}/scans`, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
        });

        socketInstance.on('connect', () => {
            console.log('Connected to /scans namespace');
            setConnected(true);
        });

        socketInstance.on('disconnect', () => {
            console.log('Disconnected from /scans namespace');
            setConnected(false);
        });

        socketInstance.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setConnected(false);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    const joinScan = (scanId: string) => {
        if (socket) {
            console.log(`Subscribing to scan: ${scanId}`);
            socket.emit('subscribe', scanId);
        }
    };

    const leaveScan = (scanId: string) => {
        if (socket) {
            console.log(`Unsubscribing from scan: ${scanId}`);
            socket.emit('unsubscribe', scanId);
        }
    };

    const on = (event: string, handler: (data: ScanSocketEvent) => void) => {
        if (socket) {
            socket.on(event, handler);
        }
    };

    const off = (event: string, handler?: (data: ScanSocketEvent) => void) => {
        if (socket) {
            if (handler) {
                socket.off(event, handler);
            } else {
                socket.off(event);
            }
        }
    };

    return { socket, connected, joinScan, leaveScan, on, off };
}
