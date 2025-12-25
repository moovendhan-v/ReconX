import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../redis/redis.service';
export declare class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly redisService;
    server: Server;
    private readonly logger;
    private readonly subscribers;
    constructor(redisService: RedisService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): Promise<void>;
    handleSubscribe(client: Socket, channel: string): Promise<{
        success: boolean;
        channel: string;
    }>;
    handleUnsubscribe(client: Socket, channel: string): Promise<{
        success: boolean;
        channel: string;
    }>;
    handleSubscribeUser(client: Socket, userId: string): Promise<{
        success: boolean;
        userId: string;
    }>;
    private subscribeToChannel;
    broadcastToAll(notification: any): void;
    broadcastToRoom(room: string, notification: any): void;
}
