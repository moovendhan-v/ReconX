import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ScanEventsService } from './scan-events.service';
export declare class ScansGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly scanEventsService;
    server: Server;
    private readonly logger;
    constructor(scanEventsService: ScanEventsService);
    afterInit(): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleSubscribe(client: Socket, scanId: string): {
        success: boolean;
        scanId: string;
    };
    handleUnsubscribe(client: Socket, scanId: string): {
        success: boolean;
        scanId: string;
    };
    private handleScanEvent;
    private mapEventTypeToSocketEvent;
    broadcastToScan(scanId: string, event: string, data: any): void;
    getConnectedClientsCount(): number;
}
