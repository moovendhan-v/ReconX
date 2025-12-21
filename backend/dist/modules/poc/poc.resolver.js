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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PocResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const poc_service_1 = require("./poc.service");
const execution_service_1 = require("./execution.service");
const poc_dto_1 = require("./dto/poc.dto");
const cve_dto_1 = require("../cve/dto/cve.dto");
let PocResolver = class PocResolver {
    constructor(pocService, executionService) {
        this.pocService = pocService;
        this.executionService = executionService;
    }
    async findAll(filters) {
        return this.pocService.findAll(filters);
    }
    async findOne(id) {
        return this.pocService.findOne(id);
    }
    async findWithLogs(id) {
        return this.pocService.findWithLogs(id);
    }
    async findByCveId(cveId) {
        return this.pocService.findByCveId(cveId);
    }
    async getLogs(pocId, limit) {
        return this.pocService.getLogs(pocId, limit);
    }
    async createPoc(input) {
        return this.pocService.create(input);
    }
    async updatePoc(id, input) {
        return this.pocService.update(id, input);
    }
    async deletePoc(id) {
        return this.pocService.remove(id);
    }
    async executePoc(pocId, input) {
        return this.executionService.executePOC(pocId, input);
    }
    async cve(poc) {
        return poc.cve;
    }
    async executionLogs(poc) {
        if (poc.executionLogs) {
            return poc.executionLogs;
        }
        return this.pocService.getLogs(poc.id, 10);
    }
};
exports.PocResolver = PocResolver;
__decorate([
    (0, graphql_1.Query)(() => poc_dto_1.POCListResponse, { name: 'pocs' }),
    __param(0, (0, graphql_1.Args)('filters', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [poc_dto_1.POCFiltersInput]),
    __metadata("design:returntype", Promise)
], PocResolver.prototype, "findAll", null);
__decorate([
    (0, graphql_1.Query)(() => poc_dto_1.POC, { name: 'poc' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PocResolver.prototype, "findOne", null);
__decorate([
    (0, graphql_1.Query)(() => poc_dto_1.POC, { name: 'pocWithLogs' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PocResolver.prototype, "findWithLogs", null);
__decorate([
    (0, graphql_1.Query)(() => [poc_dto_1.POC], { name: 'pocsByCve' }),
    __param(0, (0, graphql_1.Args)('cveId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PocResolver.prototype, "findByCveId", null);
__decorate([
    (0, graphql_1.Query)(() => [poc_dto_1.ExecutionLog], { name: 'pocLogs' }),
    __param(0, (0, graphql_1.Args)('pocId')),
    __param(1, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, nullable: true, defaultValue: 50 })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], PocResolver.prototype, "getLogs", null);
__decorate([
    (0, graphql_1.Mutation)(() => poc_dto_1.POC),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [poc_dto_1.CreatePOCInput]),
    __metadata("design:returntype", Promise)
], PocResolver.prototype, "createPoc", null);
__decorate([
    (0, graphql_1.Mutation)(() => poc_dto_1.POC),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, poc_dto_1.UpdatePOCInput]),
    __metadata("design:returntype", Promise)
], PocResolver.prototype, "updatePoc", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PocResolver.prototype, "deletePoc", null);
__decorate([
    (0, graphql_1.Mutation)(() => poc_dto_1.ExecuteResponse),
    __param(0, (0, graphql_1.Args)('pocId')),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, poc_dto_1.ExecutePOCInput]),
    __metadata("design:returntype", Promise)
], PocResolver.prototype, "executePoc", null);
__decorate([
    (0, graphql_1.ResolveField)(() => cve_dto_1.CVE, { nullable: true }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [poc_dto_1.POC]),
    __metadata("design:returntype", Promise)
], PocResolver.prototype, "cve", null);
__decorate([
    (0, graphql_1.ResolveField)(() => [poc_dto_1.ExecutionLog], { nullable: true }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [poc_dto_1.POC]),
    __metadata("design:returntype", Promise)
], PocResolver.prototype, "executionLogs", null);
exports.PocResolver = PocResolver = __decorate([
    (0, graphql_1.Resolver)(() => poc_dto_1.POC),
    __metadata("design:paramtypes", [poc_service_1.PocService,
        execution_service_1.ExecutionService])
], PocResolver);
//# sourceMappingURL=poc.resolver.js.map