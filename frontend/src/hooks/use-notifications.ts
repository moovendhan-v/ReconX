import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

interface NotificationMessage {
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
    timestamp?: Date;
    userId?: string;
    metadata?: Record<string, any>;
}

interface UseNotificationsOptions {
    autoConnect?: boolean;
    userId?: string;
    channels?: string[];
    onNotification?: (notification: NotificationMessage) => void;
    showToast?: boolean;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
    const {
        autoConnect = true,
        userId,
        channels = [],
        onNotification,
        showToast = true,
    } = options;

    const [isConnected, setIsConnected] = useState(false);
    const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
    const socketRef = useRef<Socket | null>(null);

    // Initialize Socket.IO connection
    useEffect(() => {
        if (!autoConnect) return;

        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

        const socket = io(`${backendUrl}/notifications`, {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socket.on('connect', () => {
            console.log('[Notifications] Connected to notification gateway');
            setIsConnected(true);

            // Subscribe to user-specific notifications if userId provided
            if (userId) {
                socket.emit('subscribe-user', userId);
            }

            // Subscribe to additional channels
            channels.forEach(channel => {
                socket.emit('subscribe', channel);
            });
        });

        socket.on('disconnect', () => {
            console.log('[Notifications] Disconnected from notification gateway');
            setIsConnected(false);
        });

        socket.on('notification', (notification: NotificationMessage) => {
            console.log('[Notifications] Received notification:', notification);

            // Add to notifications list
            setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep last 50

            // Call custom handler if provided
            if (onNotification) {
                onNotification(notification);
            }

            // Show toast notification
            if (showToast) {
                displayToast(notification);
            }
        });

        socket.on('connect_error', (error) => {
            console.error('[Notifications] Connection error:', error);
        });

        socketRef.current = socket;

        return () => {
            socket.disconnect();
        };
    }, [autoConnect, userId, channels.join(','), onNotification, showToast]);

    const displayToast = useCallback((notification: NotificationMessage) => {
        const toastOptions = {
            description: notification.message,
            duration: 5000,
        };

        switch (notification.type) {
            case 'success':
                toast.success(notification.title, toastOptions);
                break;
            case 'error':
                toast.error(notification.title, toastOptions);
                break;
            case 'warning':
                toast.warning(notification.title, toastOptions);
                break;
            case 'info':
            default:
                toast.info(notification.title, toastOptions);
                break;
        }
    }, []);

    const subscribeToChannel = useCallback((channel: string) => {
        if (!socketRef.current) {
            console.warn('[Notifications] Socket not initialized');
            return;
        }

        console.log(`[Notifications] Subscribing to channel: ${channel}`);
        socketRef.current.emit('subscribe', channel);
    }, []);

    const unsubscribeFromChannel = useCallback((channel: string) => {
        if (!socketRef.current) {
            console.warn('[Notifications] Socket not initialized');
            return;
        }

        console.log(`[Notifications] Unsubscribing from channel: ${channel}`);
        socketRef.current.emit('unsubscribe', channel);
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    const removeNotification = useCallback((index: number) => {
        setNotifications(prev => prev.filter((_, i) => i !== index));
    }, []);

    return {
        isConnected,
        notifications,
        subscribeToChannel,
        unsubscribeFromChannel,
        clearNotifications,
        removeNotification,
    };
}
