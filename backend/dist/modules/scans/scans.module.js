"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScansModule = void 0;
const common_1 = require("@nestjs/common");
const scans_service_1 = require("./scans.service");
const scans_resolver_1 = require("./scans.resolver");
const database_module_1 = require("../database/database.module");
const redis_module_1 = require("../redis/redis.module");
const scan_events_service_1 = require("./scan-events.service");
const scans_gateway_1 = require("./scans.gateway");
const scan_orchestrator_service_1 = require("./scan-orchestrator.service");
let ScansModule = class ScansModule {
};
exports.ScansModule = ScansModule;
exports.ScansModule = ScansModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule, redis_module_1.RedisModule],
        providers: [scans_service_1.ScansService, scans_resolver_1.ScansResolver, scan_events_service_1.ScanEventsService, scans_gateway_1.ScansGateway, scan_orchestrator_service_1.ScanOrchestratorService],
        exports: [scans_service_1.ScansService, scan_events_service_1.ScanEventsService],
    })
], ScansModule);
//# sourceMappingURL=scans.module.js.map