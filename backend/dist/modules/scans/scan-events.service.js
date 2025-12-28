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
var ScanEventsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScanEventsService = exports.ScanEventType = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../redis/redis.service");
var ScanEventType;
(function (ScanEventType) {
    ScanEventType["CREATED"] = "scan.created";
    ScanEventType["STARTED"] = "scan.started";
    ScanEventType["PROGRESS"] = "scan.progress";
    ScanEventType["SUBDOMAIN_FOUND"] = "scan.subdomain.found";
    ScanEventType["PORTS_SCANNING"] = "scan.ports.scanning";
    ScanEventType["PORT_FOUND"] = "scan.port.found";
    ScanEventType["COMPLETED"] = "scan.completed";
    ScanEventType["FAILED"] = "scan.failed";
})(ScanEventType || (exports.ScanEventType = ScanEventType = {}));
let ScanEventsService = ScanEventsService_1 = class ScanEventsService {
    constructor(redisService) {
        this.redisService = redisService;
        this.logger = new common_1.Logger(ScanEventsService_1.name);
        this.SCAN_EVENTS_CHANNEL = 'scan:events';
        this.subscribers = [];
    }
    async onModuleInit() {
        const client = this.redisService.getClient();
        if (!client) {
            this.logger.warn('Redis not available, events will not be published');
            return;
        }
        try {
            const subscriber = client.duplicate();
            await subscriber.connect();
            await subscriber.subscribe(this.SCAN_EVENTS_CHANNEL, (message) => {
                try {
                    const event = JSON.parse(message);
                    this.logger.debug(`Received event: ${event.type} for scan ${event.scanId}`);
                    this.subscribers.forEach(handler => {
                        try {
                            handler(event);
                        }
                        catch (error) {
                            this.logger.error(`Error in event handler: ${error.message}`);
                        }
                    });
                }
                catch (error) {
                    this.logger.error(`Failed to parse scan event: ${error.message}`);
                }
            });
            this.logger.log('✓ Subscribed to scan events channel');
        }
        catch (error) {
            this.logger.error(`Failed to subscribe to scan events: ${error.message}`);
        }
    }
    async publishEvent(type, scanId, data) {
        const event = {
            type,
            scanId,
            timestamp: new Date().toISOString(),
            data,
        };
        const client = this.redisService.getClient();
        if (!client) {
            this.logger.warn(`Cannot publish event ${type}, Redis not available`);
            return;
        }
        try {
            await client.publish(this.SCAN_EVENTS_CHANNEL, JSON.stringify(event));
            this.logger.debug(`Published event: ${type} for scan ${scanId}`);
        }
        catch (error) {
            this.logger.error(`Failed to publish event: ${error.message}`);
        }
    }
    onEvent(handler) {
        this.subscribers.push(handler);
    }
    async scanCreated(scanId, target) {
        await this.publishEvent(ScanEventType.CREATED, scanId, { target });
    }
    async scanStarted(scanId) {
        await this.publishEvent(ScanEventType.STARTED, scanId);
    }
    async scanProgress(scanId, progress) {
        await this.publishEvent(ScanEventType.PROGRESS, scanId, { progress });
    }
    async subdomainFound(scanId, subdomain) {
        await this.publishEvent(ScanEventType.SUBDOMAIN_FOUND, scanId, subdomain);
    }
    async portsScanning(scanId, subdomain) {
        await this.publishEvent(ScanEventType.PORTS_SCANNING, scanId, { subdomain });
    }
    async portFound(scanId, port) {
        await this.publishEvent(ScanEventType.PORT_FOUND, scanId, port);
    }
    async scanCompleted(scanId, results) {
        await this.publishEvent(ScanEventType.COMPLETED, scanId, results);
    }
    async scanFailed(scanId, error) {
        await this.publishEvent(ScanEventType.FAILED, scanId, { error });
    }
};
exports.ScanEventsService = ScanEventsService;
exports.ScanEventsService = ScanEventsService = ScanEventsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService])
], ScanEventsService);
//# sourceMappingURL=scan-events.service.js.map