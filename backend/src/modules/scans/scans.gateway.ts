import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { ScanEventsService, ScanEvent } from './scan-events.service';

@Injectable()
@WebSocketGateway({
    cors: {
        origin: '*',
        credentials: true,
    },
    namespace: '/scans',
})
export class ScansGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(ScansGateway.name);

    constructor(private readonly scanEventsService: ScanEventsService) { }

    afterInit() {
        this.logger.log('✓ Scans WebSocket Gateway initialized');

        // Subscribe to scan events from Redis
        this.scanEventsService.onEvent((event: ScanEvent) => {
            this.handleScanEvent(event);
        });
    }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected to /scans: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected from /scans: ${client.id}`);
    }

    /**
     * Client subscribes to updates for a specific scan
     */
    @SubscribeMessage('subscribe')
    handleSubscribe(client: Socket, scanId: string) {
        const room = `scan:${scanId}`;
        client.join(room);
        this.logger.log(`Client ${client.id} subscribed to ${room}`);
        return { success: true, scanId };
    }

    /**
     * Client unsubscribes from a specific scan
     */
    @SubscribeMessage('unsubscribe')
    handleUnsubscribe(client: Socket, scanId: string) {
        const room = `scan:${scanId}`;
        client.leave(room);
        this.logger.log(`Client ${client.id} unsubscribed from ${room}`);
        return { success: true, scanId };
    }

    /**
     * Handle scan events from Redis and broadcast to connected clients
     */
    private handleScanEvent(event: ScanEvent) {
        const room = `scan:${event.scanId}`;
        const eventType = this.mapEventTypeToSocketEvent(event.type);

        this.logger.debug(`Broadcasting ${eventType} to room ${room}`);

        // Broadcast to specific scan room
        this.server.to(room).emit(eventType, {
            scanId: event.scanId,
            timestamp: event.timestamp,
            data: event.data,
        });

        // Also broadcast to all clients for scan list updates
        this.server.emit('scan:update', {
            scanId: event.scanId,
            type: event.type,
            timestamp: event.timestamp,
            data: event.data,
        });
    }

    /**
     * Map internal event types to WebSocket event names
     */
    private mapEventTypeToSocketEvent(type: string): string {
        const mapping: Record<string, string> = {
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

    /**
     * Manually broadcast an event (for testing)
     */
    broadcastToScan(scanId: string, event: string, data: any) {
        const room = `scan:${scanId}`;
        this.server.to(room).emit(event, data);
    }

    /**
     * Get connected clients count
     */
    getConnectedClientsCount(): number {
        return this.server.sockets.sockets.size;
    }
}
