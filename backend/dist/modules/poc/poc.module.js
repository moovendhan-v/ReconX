"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PocModule = void 0;
const common_1 = require("@nestjs/common");
const poc_service_1 = require("./poc.service");
const poc_resolver_1 = require("./poc.resolver");
const execution_service_1 = require("./execution.service");
const execution_logs_gateway_1 = require("./execution-logs.gateway");
const database_module_1 = require("../database/database.module");
const redis_module_1 = require("../redis/redis.module");
let PocModule = class PocModule {
};
exports.PocModule = PocModule;
exports.PocModule = PocModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule, redis_module_1.RedisModule],
        providers: [
            poc_service_1.PocService,
            poc_resolver_1.PocResolver,
            execution_service_1.ExecutionService,
            execution_logs_gateway_1.ExecutionLogsGateway,
        ],
        exports: [poc_service_1.PocService, execution_service_1.ExecutionService],
    })
], PocModule);
//# sourceMappingURL=poc.module.js.map