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
exports.ScansResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const scans_service_1 = require("./scans.service");
const scan_dto_1 = require("./dto/scan.dto");
let ScansResolver = class ScansResolver {
    constructor(scansService) {
        this.scansService = scansService;
    }
    async findAll(filters) {
        return this.scansService.findAll(filters);
    }
    async findById(id) {
        return this.scansService.findById(id);
    }
    async createScan(input) {
        return this.scansService.create(input);
    }
    async updateScan(id, input) {
        return this.scansService.update(id, input);
    }
    async deleteScan(id) {
        return this.scansService.delete(id);
    }
    async startScan(id) {
        return this.scansService.startScan(id);
    }
    async startQuickScan(target) {
        return this.scansService.startQuickScan(target);
    }
};
exports.ScansResolver = ScansResolver;
__decorate([
    (0, graphql_1.Query)(() => scan_dto_1.ScanListResponse, { name: 'scans' }),
    __param(0, (0, graphql_1.Args)('filters', { type: () => scan_dto_1.ScanFiltersInput, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [scan_dto_1.ScanFiltersInput]),
    __metadata("design:returntype", Promise)
], ScansResolver.prototype, "findAll", null);
__decorate([
    (0, graphql_1.Query)(() => scan_dto_1.Scan, { name: 'scan', nullable: true }),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScansResolver.prototype, "findById", null);
__decorate([
    (0, graphql_1.Mutation)(() => scan_dto_1.Scan),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [scan_dto_1.CreateScanInput]),
    __metadata("design:returntype", Promise)
], ScansResolver.prototype, "createScan", null);
__decorate([
    (0, graphql_1.Mutation)(() => scan_dto_1.Scan),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, scan_dto_1.UpdateScanInput]),
    __metadata("design:returntype", Promise)
], ScansResolver.prototype, "updateScan", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScansResolver.prototype, "deleteScan", null);
__decorate([
    (0, graphql_1.Mutation)(() => scan_dto_1.Scan),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScansResolver.prototype, "startScan", null);
__decorate([
    (0, graphql_1.Mutation)(() => scan_dto_1.Scan),
    __param(0, (0, graphql_1.Args)('target')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScansResolver.prototype, "startQuickScan", null);
exports.ScansResolver = ScansResolver = __decorate([
    (0, graphql_1.Resolver)(() => scan_dto_1.Scan),
    __metadata("design:paramtypes", [scans_service_1.ScansService])
], ScansResolver);
//# sourceMappingURL=scans.resolver.js.map