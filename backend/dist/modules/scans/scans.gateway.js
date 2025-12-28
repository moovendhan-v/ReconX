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
var ScansGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScansGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const scan_events_service_1 = require("./scan-events.service");
let ScansGateway = ScansGateway_1 = class ScansGateway {
    constructor(scanEventsService) {
        this.scanEventsService = scanEventsService;
        this.logger = new common_1.Logger(ScansGateway_1.name);
    }
    afterInit() {
        this.logger.log('✓ Scans WebSocket Gateway initialized');
        this.scanEventsService.onEvent((event) => {
            this.handleScanEvent(event);
        });
    }
    handleConnection(client) {
        this.logger.log(`Client connected to /scans: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected from /scans: ${client.id}`);
    }
    handleSubscribe(client, scanId) {
        const room = `scan:${scanId}`;
        client.join(room);
        this.logger.log(`Client ${client.id} subscribed to ${room}`);
        return { success: true, scanId };
    }
    handleUnsubscribe(client, scanId) {
        const room = `scan:${scanId}`;
        client.leave(room);
        this.logger.log(`Client ${client.id} unsubscribed from ${room}`);
        return { success: true, scanId };
    }
    handleScanEvent(event) {
        const room = `scan:${event.scanId}`;
        const eventType = this.mapEventTypeToSocketEvent(event.type);
        this.logger.debug(`Broadcasting ${eventType} to room ${room}`);
        this.server.to(room).emit(eventType, {
            scanId: event.scanId,
            timestamp: event.timestamp,
            data: event.data,
        });
        this.server.emit('scan:update', {
            scanId: event.scanId,
            type: event.type,
            timestamp: event.timestamp,
            data: event.data,
        });
    }
    mapEventTypeToSocketEvent(type) {
        const mapping = {
            'scan.created': 'scan:created',
            'scan.started': 'scan:started',
            'scan.progress': 'scan:progress',
            'scan.subdomain.found': 'scan:subdomain',
            'scan.ports.scanning': 'scan:ports_scanning',
            'scan.port.found': 'scan:port',
            'scan.completed': 'scan:completed',
            'scan.failed': 'scan:failed',
        };
        return mapping[type] || 'scan:event';
    }
    broadcastToScan(scanId, event, data) {
        const room = `scan:${scanId}`;
        this.server.to(room).emit(event, data);
    }
    getConnectedClientsCount() {
        return this.server.sockets.sockets.size;
    }
};
exports.ScansGateway = ScansGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ScansGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], ScansGateway.prototype, "handleSubscribe", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('unsubscribe'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], ScansGateway.prototype, "handleUnsubscribe", null);
exports.ScansGateway = ScansGateway = ScansGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
            credentials: true,
        },
        namespace: '/scans',
    }),
    __metadata("design:paramtypes", [scan_events_service_1.ScanEventsService])
], ScansGateway);
//# sourceMappingURL=scans.gateway.js.map