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
exports.ReportListResponse = exports.ReportFiltersInput = exports.CreateReportInput = exports.Report = exports.ReportType = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const graphql_type_json_1 = require("graphql-type-json");
var ReportType;
(function (ReportType) {
    ReportType["SCAN"] = "SCAN";
    ReportType["CVE"] = "CVE";
    ReportType["POC"] = "POC";
    ReportType["CUSTOM"] = "CUSTOM";
})(ReportType || (exports.ReportType = ReportType = {}));
(0, graphql_1.registerEnumType)(ReportType, { name: 'ReportType' });
let Report = class Report {
};
exports.Report = Report;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Report.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Report.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(() => ReportType),
    __metadata("design:type", String)
], Report.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default),
    __metadata("design:type", Object)
], Report.prototype, "content", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], Report.prototype, "generatedBy", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Report.prototype, "createdAt", void 0);
exports.Report = Report = __decorate([
    (0, graphql_1.ObjectType)()
], Report);
let CreateReportInput = class CreateReportInput {
};
exports.CreateReportInput = CreateReportInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReportInput.prototype, "title", void 0);
__decorate([
    (0, graphql_1.Field)(() => ReportType),
    (0, class_validator_1.IsEnum)(ReportType),
    __metadata("design:type", String)
], CreateReportInput.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default),
    __metadata("design:type", Object)
], CreateReportInput.prototype, "content", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReportInput.prototype, "generatedBy", void 0);
exports.CreateReportInput = CreateReportInput = __decorate([
    (0, graphql_1.InputType)()
], CreateReportInput);
let ReportFiltersInput = class ReportFiltersInput {
};
exports.ReportFiltersInput = ReportFiltersInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReportFiltersInput.prototype, "search", void 0);
__decorate([
    (0, graphql_1.Field)(() => ReportType, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ReportType),
    __metadata("design:type", String)
], ReportFiltersInput.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true, defaultValue: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ReportFiltersInput.prototype, "limit", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true, defaultValue: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ReportFiltersInput.prototype, "offset", void 0);
exports.ReportFiltersInput = ReportFiltersInput = __decorate([
    (0, graphql_1.InputType)()
], ReportFiltersInput);
let ReportListResponse = class ReportListResponse {
};
exports.ReportListResponse = ReportListResponse;
__decorate([
    (0, graphql_1.Field)(() => [Report]),
    __metadata("design:type", Array)
], ReportListResponse.prototype, "reports", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ReportListResponse.prototype, "total", void 0);
exports.ReportListResponse = ReportListResponse = __decorate([
    (0, graphql_1.ObjectType)()
], ReportListResponse);
//# sourceMappingURL=report.dto.js.map