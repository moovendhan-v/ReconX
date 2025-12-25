import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
@WebSocketGateway({
    cors: {
        origin: '*',
        credentials: true,
    },
    namespace: '/notifications',
})
export class NotificationsGateway
    implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(NotificationsGateway.name);
    private readonly subscribers = new Map<string, any>();

    constructor(private readonly redisService: RedisService) { }

    async handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);

        // Subscribe to global notifications
        await this.subscribeToChannel(client.id, 'global');
    }

    async handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);

        // Clean up all subscriptions for this client
        this.subscribers.forEach((subscriber, key) => {
            if (key.startsWith(client.id)) {
                subscriber.unsubscribe();
                this.subscribers.delete(key);
            }
        });
    }

    /**
     * Subscribe client to a specific notification channel
     */
    @SubscribeMessage('subscribe')
    async handleSubscribe(client: Socket, channel: string) {
        this.logger.log(`Client ${client.id} subscribing to channel: ${channel}`);
        await this.subscribeToChannel(client.id, channel);
        return { success: true, channel };
    }

    /**
     * Unsubscribe client from a specific notification channel
     */
    @SubscribeMessage('unsubscribe')
    async handleUnsubscribe(client: Socket, channel: string) {
        this.logger.log(`Client ${client.id} unsubscribing from channel: ${channel}`);

        const key = `${client.id}:${channel}`;
        const subscriber = this.subscribers.get(key);

        if (subscriber) {
            await subscriber.unsubscribe(`notifications:${channel}`);
            await subscriber.quit();
            this.subscribers.delete(key);
        }

        return { success: true, channel };
    }

    /**
     * Subscribe to user-specific notifications
     */
    @SubscribeMessage('subscribe-user')
    async handleSubscribeUser(client: Socket, userId: string) {
        this.logger.log(`Client ${client.id} subscribing to user notifications: ${userId}`);
        await this.subscribeToChannel(client.id, `user:${userId}`);
        return { success: true, userId };
    }

    /**
     * Internal method to subscribe to a Redis channel
     */
    private async subscribeToChannel(clientId: string, channel: string): Promise<void> {
        const key = `${clientId}:${channel}`;

        // Unsubscribe if already exists
        if (this.subscribers.has(key)) {
            const existing = this.subscribers.get(key);
            await existing.unsubscribe();
            await existing.quit();
        }

        const redisChannel = `notifications:${channel}`;
        this.logger.log(`Subscribing to Redis channel: ${redisChannel}`);

        try {
            const subscriber = this.redisService.getClient().duplicate();
            await subscriber.connect();

            await subscriber.subscribe(redisChannel, (message) => {
                try {
                    const notification = JSON.parse(message);

                    this.logger.log(`Broadcasting notification to client ${clientId}:`, notification.title);

                    // Emit to specific client
                    this.server.to(clientId).emit('notification', notification);
                } catch (error) {
                    this.logger.error(`Error parsing notification message: ${error.message}`);
                }
            });

            this.subscribers.set(key, subscriber);
        } catch (error) {
            this.logger.error(`Failed to subscribe to channel ${channel}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Broadcast a notification to all connected clients
     */
    broadcastToAll(notification: any): void {
        this.server.emit('notification', notification);
    }

    /**
     * Broadcast a notification to a specific room/channel
     */
    broadcastToRoom(room: string, notification: any): void {
        this.server.to(room).emit('notification', notification);
    }
}
