import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

export interface NotificationMessage {
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
    timestamp?: Date;
    userId?: string;
    metadata?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(private readonly redisService: RedisService) {}

    /**
     * Publish a notification to all connected clients
     */
    async publishGlobalNotification(notification: NotificationMessage): Promise<void> {
        try {
            const message = {
                ...notification,
                timestamp: notification.timestamp || new Date(),
            };

            await this.redisService.getClient().publish(
                'notifications:global',
                JSON.stringify(message),
            );

            this.logger.log(`Published global notification: ${notification.title}`);
        } catch (error) {
            this.logger.error(`Failed to publish global notification: ${error.message}`);
            throw error;
        }
    }

    /**
     * Publish a notification to a specific user
     */
    async publishUserNotification(
        userId: string,
        notification: NotificationMessage,
    ): Promise<void> {
        try {
            const message = {
                ...notification,
                userId,
                timestamp: notification.timestamp || new Date(),
            };

            await this.redisService.getClient().publish(
                `notifications:user:${userId}`,
                JSON.stringify(message),
            );

            this.logger.log(`Published notification to user ${userId}: ${notification.title}`);
        } catch (error) {
            this.logger.error(`Failed to publish user notification: ${error.message}`);
            throw error;
        }
    }

    /**
     * Publish a notification to a specific channel
     */
    async publishToChannel(
        channel: string,
        notification: NotificationMessage,
    ): Promise<void> {
        try {
            const message = {
                ...notification,
                timestamp: notification.timestamp || new Date(),
            };

            await this.redisService.getClient().publish(
                `notifications:${channel}`,
                JSON.stringify(message),
            );

            this.logger.log(`Published notification to channel ${channel}: ${notification.title}`);
        } catch (error) {
            this.logger.error(`Failed to publish to channel: ${error.message}`);
            throw error;
        }
    }

    /**
     * Helper method to send POC-related notifications
     */
    async notifyPOCEvent(
        event: 'created' | 'started' | 'completed' | 'failed',
        pocName: string,
        userId?: string,
        metadata?: Record<string, any>,
    ): Promise<void> {
        const notificationMap = {
            created: {
                type: 'success' as const,
                title: 'POC Created',
                message: `POC "${pocName}" has been created successfully`,
            },
            started: {
                type: 'info' as const,
                title: 'POC Execution Started',
                message: `POC "${pocName}" execution has started`,
            },
            completed: {
                type: 'success' as const,
                title: 'POC Execution Completed',
                message: `POC "${pocName}" execution completed successfully`,
            },
            failed: {
                type: 'error' as const,
                title: 'POC Execution Failed',
                message: `POC "${pocName}" execution failed`,
            },
        };

        const notification = {
            ...notificationMap[event],
            metadata,
        };

        if (userId) {
            await this.publishUserNotification(userId, notification);
        } else {
            await this.publishGlobalNotification(notification);
        }
    }
}
