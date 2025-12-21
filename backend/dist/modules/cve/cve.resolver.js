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
exports.CveResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const cve_service_1 = require("./cve.service");
const cve_dto_1 = require("./dto/cve.dto");
const poc_dto_1 = require("../poc/dto/poc.dto");
let CveResolver = class CveResolver {
    constructor(cveService) {
        this.cveService = cveService;
    }
    async findAll(filters) {
        return this.cveService.findAll(filters);
    }
    async findOne(id) {
        return this.cveService.findOne(id);
    }
    async findByCveId(cveId) {
        return this.cveService.findByCveId(cveId);
    }
    async findWithPocs(id) {
        return this.cveService.findWithPocs(id);
    }
    async search(query) {
        return this.cveService.search(query);
    }
    async getStatistics() {
        return this.cveService.getStatistics();
    }
    async createCve(input) {
        return this.cveService.create(input);
    }
    async updateCve(id, input) {
        return this.cveService.update(id, input);
    }
    async deleteCve(id) {
        return this.cveService.remove(id);
    }
    async pocs(cve) {
        return cve.pocs || [];
    }
};
exports.CveResolver = CveResolver;
__decorate([
    (0, graphql_1.Query)(() => cve_dto_1.CVEListResponse, { name: 'cves' }),
    __param(0, (0, graphql_1.Args)('filters', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cve_dto_1.CVEFiltersInput]),
    __metadata("design:returntype", Promise)
], CveResolver.prototype, "findAll", null);
__decorate([
    (0, graphql_1.Query)(() => cve_dto_1.CVE, { name: 'cve' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CveResolver.prototype, "findOne", null);
__decorate([
    (0, graphql_1.Query)(() => cve_dto_1.CVE, { name: 'cveByNumber' }),
    __param(0, (0, graphql_1.Args)('cveId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CveResolver.prototype, "findByCveId", null);
__decorate([
    (0, graphql_1.Query)(() => cve_dto_1.CVE, { name: 'cveWithPocs' }),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CveResolver.prototype, "findWithPocs", null);
__decorate([
    (0, graphql_1.Query)(() => [cve_dto_1.CVE], { name: 'searchCves' }),
    __param(0, (0, graphql_1.Args)('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CveResolver.prototype, "search", null);
__decorate([
    (0, graphql_1.Query)(() => cve_dto_1.CVEStatistics, { name: 'cveStatistics' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CveResolver.prototype, "getStatistics", null);
__decorate([
    (0, graphql_1.Mutation)(() => cve_dto_1.CVE),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cve_dto_1.CreateCVEInput]),
    __metadata("design:returntype", Promise)
], CveResolver.prototype, "createCve", null);
__decorate([
    (0, graphql_1.Mutation)(() => cve_dto_1.CVE),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, cve_dto_1.UpdateCVEInput]),
    __metadata("design:returntype", Promise)
], CveResolver.prototype, "updateCve", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CveResolver.prototype, "deleteCve", null);
__decorate([
    (0, graphql_1.ResolveField)(() => [poc_dto_1.POC], { nullable: true }),
    __param(0, (0, graphql_1.Parent)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cve_dto_1.CVE]),
    __metadata("design:returntype", Promise)
], CveResolver.prototype, "pocs", null);
exports.CveResolver = CveResolver = __decorate([
    (0, graphql_1.Resolver)(() => cve_dto_1.CVE),
    __metadata("design:paramtypes", [cve_service_1.CveService])
], CveResolver);
//# sourceMappingURL=cve.resolver.js.map