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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CVEStatistics = exports.CVESeverityStats = exports.CVEListResponse = exports.CVEFiltersInput = exports.UpdateCVEInput = exports.CreateCVEInput = exports.CVE = exports.Severity = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const poc_dto_1 = require("../../poc/dto/poc.dto");
var Severity;
(function (Severity) {
    Severity["LOW"] = "LOW";
    Severity["MEDIUM"] = "MEDIUM";
    Severity["HIGH"] = "HIGH";
    Severity["CRITICAL"] = "CRITICAL";
})(Severity || (exports.Severity = Severity = {}));
(0, graphql_1.registerEnumType)(Severity, {
    name: 'Severity',
    description: 'CVE severity levels',
});
let CVE = class CVE {
};
exports.CVE = CVE;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], CVE.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CVE.prototype, "cveId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CVE.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], CVE.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => Severity),
    __metadata("design:type", String)
], CVE.prototype, "severity", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], CVE.prototype, "cvssScore", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date, { nullable: true }),
    __metadata("design:type", Date)
], CVE.prototype, "publishedDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], CVE.prototype, "affectedProducts", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    __metadata("design:type", Array)
], CVE.prototype, "references", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], CVE.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], CVE.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => [poc_dto_1.POC], { nullable: true }),
    __metadata("design:type", Array)
], CVE.prototype, "pocs", void 0);
exports.CVE = CVE = __decorate([
    (0, graphql_1.ObjectType)()
], CVE);
let CreateCVEInput = class CreateCVEInput {
};
exports.CreateCVEInput = CreateCVEInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCVEInput.prototype, "cveId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCVEInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCVEInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => Severity),
    (0, class_validator_1.IsEnum)(Severity),
    __metadata("design:type", String)
], CreateCVEInput.prototype, "severity", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCVEInput.prototype, "cvssScore", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateCVEInput.prototype, "publishedDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateCVEInput.prototype, "affectedProducts", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateCVEInput.prototype, "references", void 0);
exports.CreateCVEInput = CreateCVEInput = __decorate([
    (0, graphql_1.InputType)()
], CreateCVEInput);
let UpdateCVEInput = class UpdateCVEInput {
};
exports.UpdateCVEInput = UpdateCVEInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCVEInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCVEInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(() => Severity, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Severity),
    __metadata("design:type", String)
], UpdateCVEInput.prototype, "severity", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCVEInput.prototype, "cvssScore", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateCVEInput.prototype, "publishedDate", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateCVEInput.prototype, "affectedProducts", void 0);
__decorate([
    (0, graphql_1.Field)(() => [String], { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateCVEInput.prototype, "references", void 0);
exports.UpdateCVEInput = UpdateCVEInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateCVEInput);
let CVEFiltersInput = class CVEFiltersInput {
};
exports.CVEFiltersInput = CVEFiltersInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CVEFiltersInput.prototype, "search", void 0);
__decorate([
    (0, graphql_1.Field)(() => Severity, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(Severity),
    __metadata("design:type", String)
], CVEFiltersInput.prototype, "severity", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CVEFiltersInput.prototype, "dateFrom", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CVEFiltersInput.prototype, "dateTo", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true, defaultValue: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CVEFiltersInput.prototype, "page", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true, defaultValue: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(1000),
    __metadata("design:type", Number)
], CVEFiltersInput.prototype, "limit", void 0);
exports.CVEFiltersInput = CVEFiltersInput = __decorate([
    (0, graphql_1.InputType)()
], CVEFiltersInput);
let CVEListResponse = class CVEListResponse {
};
exports.CVEListResponse = CVEListResponse;
__decorate([
    (0, graphql_1.Field)(() => [CVE]),
    __metadata("design:type", Array)
], CVEListResponse.prototype, "cves", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CVEListResponse.prototype, "total", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CVEListResponse.prototype, "page", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CVEListResponse.prototype, "limit", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CVEListResponse.prototype, "totalPages", void 0);
exports.CVEListResponse = CVEListResponse = __decorate([
    (0, graphql_1.ObjectType)()
], CVEListResponse);
let CVESeverityStats = class CVESeverityStats {
};
exports.CVESeverityStats = CVESeverityStats;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CVESeverityStats.prototype, "LOW", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CVESeverityStats.prototype, "MEDIUM", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CVESeverityStats.prototype, "HIGH", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CVESeverityStats.prototype, "CRITICAL", void 0);
exports.CVESeverityStats = CVESeverityStats = __decorate([
    (0, graphql_1.ObjectType)()
], CVESeverityStats);
let CVEStatistics = class CVEStatistics {
};
exports.CVEStatistics = CVEStatistics;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CVEStatistics.prototype, "total", void 0);
__decorate([
    (0, graphql_1.Field)(() => CVESeverityStats),
    __metadata("design:type", CVESeverityStats)
], CVEStatistics.prototype, "bySeverity", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], CVEStatistics.prototype, "recent", void 0);
exports.CVEStatistics = CVEStatistics = __decorate([
    (0, graphql_1.ObjectType)()
], CVEStatistics);
//# sourceMappingURL=cve.dto.js.map