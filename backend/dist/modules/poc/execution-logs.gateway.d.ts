import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../redis/redis.service';
export declare class ExecutionLogsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly redisService;
    server: Server;
    private readonly logger;
    private readonly subscribers;
    constructor(redisService: RedisService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): Promise<void>;
    subscribeToExecution(executionId: string, clientId: string): Promise<boolean>;
    handleSubscribe(client: Socket, executionId: string): Promise<boolean>;
}
