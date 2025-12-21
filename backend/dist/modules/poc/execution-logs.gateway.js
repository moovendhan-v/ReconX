"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ExecutionLogsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionLogsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../redis/redis.service");
let ExecutionLogsGateway = ExecutionLogsGateway_1 = class ExecutionLogsGateway {
    constructor(redisService) {
        this.redisService = redisService;
        this.logger = new common_1.Logger(ExecutionLogsGateway_1.name);
        this.subscribers = new Map();
    }
    async handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    async handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        this.subscribers.forEach((subscriber, executionId) => {
            if (subscriber.clientId === client.id) {
                subscriber.unsubscribe();
                this.subscribers.delete(executionId);
            }
        });
    }
    async subscribeToExecution(executionId, clientId) {
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
                    this.server.to(clientId).emit('execution-log', {
                        executionId,
                        ...logData,
                    });
                    if (logData.type === 'COMPLETE' || logData.type === 'ERROR') {
                        setTimeout(async () => {
                            await subscriber.unsubscribe(channel);
                            await subscriber.quit();
                            this.subscribers.delete(executionId);
                        }, 1000);
                    }
                }
                catch (error) {
                    this.logger.error(`Error parsing log message: ${error.message}`);
                }
            });
            this.subscribers.set(executionId, { subscriber, clientId });
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to subscribe to execution logs: ${error.message}`);
            return false;
        }
    }
    handleSubscribe(client, executionId) {
        return this.subscribeToExecution(executionId, client.id);
    }
};
exports.ExecutionLogsGateway = ExecutionLogsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ExecutionLogsGateway.prototype, "server", void 0);
exports.ExecutionLogsGateway = ExecutionLogsGateway = ExecutionLogsGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
            credentials: true,
        },
        namespace: '/execution-logs',
    }),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], ExecutionLogsGateway);
//# sourceMappingURL=execution-logs.gateway.js.map