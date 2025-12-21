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
exports.ReportsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const reports_service_1 = require("./reports.service");
const report_dto_1 = require("./dto/report.dto");
let ReportsResolver = class ReportsResolver {
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    async findAll(filters) {
        return this.reportsService.findAll(filters);
    }
    async findById(id) {
        return this.reportsService.findById(id);
    }
    async createReport(input) {
        return this.reportsService.create(input);
    }
    async deleteReport(id) {
        return this.reportsService.delete(id);
    }
};
exports.ReportsResolver = ReportsResolver;
__decorate([
    (0, graphql_1.Query)(() => report_dto_1.ReportListResponse, { name: 'reports' }),
    __param(0, (0, graphql_1.Args)('filters', { type: () => report_dto_1.ReportFiltersInput, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_dto_1.ReportFiltersInput]),
    __metadata("design:returntype", Promise)
], ReportsResolver.prototype, "findAll", null);
__decorate([
    (0, graphql_1.Query)(() => report_dto_1.Report, { name: 'report', nullable: true }),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsResolver.prototype, "findById", null);
__decorate([
    (0, graphql_1.Mutation)(() => report_dto_1.Report),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [report_dto_1.CreateReportInput]),
    __metadata("design:returntype", Promise)
], ReportsResolver.prototype, "createReport", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsResolver.prototype, "deleteReport", null);
exports.ReportsResolver = ReportsResolver = __decorate([
    (0, graphql_1.Resolver)(() => report_dto_1.Report),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsResolver);
//# sourceMappingURL=reports.resolver.js.map