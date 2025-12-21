import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
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
    namespace: '/execution-logs',
})
export class ExecutionLogsGateway
    implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(ExecutionLogsGateway.name);
    private readonly subscribers = new Map<string, any>();

    constructor(private readonly redisService: RedisService) { }

    async handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    async handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);

        // Clean up subscriptions for this client
        this.subscribers.forEach((subscriber, executionId) => {
            if (subscriber.clientId === client.id) {
                subscriber.unsubscribe();
                this.subscribers.delete(executionId);
            }
        });
    }

    /**
     * Subscribe to execution logs for a specific execution ID
     */
    async subscribeToExecution(executionId: string, clientId: string) {
        // Unsubscribe existing subscription if any
        if (this.subscribers.has(executionId)) {
            const existing = this.subscribers.get(executionId);
            existing.unsubscribe();
        }

        const channel = `execution:logs:${executionId}`;
        this.logger.log(`Subscribing to channel: ${channel} for client: ${clientId}`);

        try {
            const subscriber = this.redisService.getClient().duplicate();
            await subscriber.connect();

            await subscriber.subscribe(channel, (message) => {
                try {
                    const logData = JSON.parse(message);

                    // Emit to specific client
                    this.server.to(clientId).emit('execution-log', {
                        executionId,
                        ...logData,
                    });

                    // Auto-unsubscribe on COMPLETE or ERROR
                    if (logData.type === 'COMPLETE' || logData.type === 'ERROR') {
                        setTimeout(async () => {
                            await subscriber.unsubscribe(channel);
                            await subscriber.quit();
                            this.subscribers.delete(executionId);
                        }, 1000);
                    }
                } catch (error) {
                    this.logger.error(`Error parsing log message: ${error.message}`);
                }
            });

            this.subscribers.set(executionId, { subscriber, clientId });

            return true;
        } catch (error) {
            this.logger.error(`Failed to subscribe to execution logs: ${error.message}`);
            return false;
        }
    }

    /**
     * Manually trigger a subscription from a client
     */
    handleSubscribe(client: Socket, executionId: string) {
        return this.subscribeToExecution(executionId, client.id);
    }
}
