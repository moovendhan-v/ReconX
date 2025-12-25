import { RedisService } from '../redis/redis.service';
export interface NotificationMessage {
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
    timestamp?: Date;
    userId?: string;
    metadata?: Record<string, any>;
}
export declare class NotificationsService {
    private readonly redisService;
    private readonly logger;
    constructor(redisService: RedisService);
    publishGlobalNotification(notification: NotificationMessage): Promise<void>;
    publishUserNotification(userId: string, notification: NotificationMessage): Promise<void>;
    publishToChannel(channel: string, notification: NotificationMessage): Promise<void>;
    notifyPOCEvent(event: 'created' | 'started' | 'completed' | 'failed', pocName: string, userId?: string, metadata?: Record<string, any>): Promise<void>;
}
