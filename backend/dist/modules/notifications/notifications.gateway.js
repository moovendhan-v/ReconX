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
var NotificationsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../redis/redis.service");
let NotificationsGateway = NotificationsGateway_1 = class NotificationsGateway {
    constructor(redisService) {
        this.redisService = redisService;
        this.logger = new common_1.Logger(NotificationsGateway_1.name);
        this.subscribers = new Map();
    }
    async handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
        await this.subscribeToChannel(client.id, 'global');
    }
    async handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        this.subscribers.forEach((subscriber, key) => {
            if (key.startsWith(client.id)) {
                subscriber.unsubscribe();
                this.subscribers.delete(key);
            }
        });
    }
    async handleSubscribe(client, channel) {
        this.logger.log(`Client ${client.id} subscribing to channel: ${channel}`);
        await this.subscribeToChannel(client.id, channel);
        return { success: true, channel };
    }
    async handleUnsubscribe(client, channel) {
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
    async handleSubscribeUser(client, userId) {
        this.logger.log(`Client ${client.id} subscribing to user notifications: ${userId}`);
        await this.subscribeToChannel(client.id, `user:${userId}`);
        return { success: true, userId };
    }
    async subscribeToChannel(clientId, channel) {
        const key = `${clientId}:${channel}`;
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
                    this.server.to(clientId).emit('notification', notification);
                }
                catch (error) {
                    this.logger.error(`Error parsing notification message: ${error.message}`);
                }
            });
            this.subscribers.set(key, subscriber);
        }
        catch (error) {
            this.logger.error(`Failed to subscribe to channel ${channel}: ${error.message}`);
            throw error;
        }
    }
    broadcastToAll(notification) {
        this.server.emit('notification', notification);
    }
    broadcastToRoom(room, notification) {
        this.server.to(room).emit('notification', notification);
    }
};
exports.NotificationsGateway = NotificationsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], NotificationsGateway.prototype, "handleSubscribe", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('unsubscribe'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], NotificationsGateway.prototype, "handleUnsubscribe", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe-user'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", Promise)
], NotificationsGateway.prototype, "handleSubscribeUser", null);
exports.NotificationsGateway = NotificationsGateway = NotificationsGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
            credentials: true,
        },
        namespace: '/notifications',
    }),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], NotificationsGateway);
//# sourceMappingURL=notifications.gateway.js.map