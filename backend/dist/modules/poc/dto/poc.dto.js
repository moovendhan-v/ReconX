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
exports.POCListResponse = exports.POCFiltersInput = exports.ExecuteResponse = exports.ExecutionResult = exports.ExecutePOCInput = exports.UpdatePOCInput = exports.CreatePOCInput = exports.ExecutionLog = exports.POC = exports.ExecutionStatus = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const cve_dto_1 = require("../../cve/dto/cve.dto");
var ExecutionStatus;
(function (ExecutionStatus) {
    ExecutionStatus["SUCCESS"] = "SUCCESS";
    ExecutionStatus["FAILED"] = "FAILED";
    ExecutionStatus["TIMEOUT"] = "TIMEOUT";
    ExecutionStatus["RUNNING"] = "RUNNING";
})(ExecutionStatus || (exports.ExecutionStatus = ExecutionStatus = {}));
(0, graphql_1.registerEnumType)(ExecutionStatus, {
    name: 'ExecutionStatus',
    description: 'POC execution status',
});
let POC = class POC {
};
exports.POC = POC;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], POC.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], POC.prototype, "cveId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], POC.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], POC.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], POC.prototype, "language", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], POC.prototype, "scriptPath", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], POC.prototype, "usageExamples", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], POC.prototype, "author", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], POC.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], POC.prototype, "updatedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => cve_dto_1.CVE, { nullable: true }),
    __metadata("design:type", cve_dto_1.CVE)
], POC.prototype, "cve", void 0);
__decorate([
    (0, graphql_1.Field)(() => [ExecutionLog], { nullable: true }),
    __metadata("design:type", Array)
], POC.prototype, "executionLogs", void 0);
exports.POC = POC = __decorate([
    (0, graphql_1.ObjectType)()
], POC);
let ExecutionLog = class ExecutionLog {
};
exports.ExecutionLog = ExecutionLog;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    __metadata("design:type", String)
], ExecutionLog.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ExecutionLog.prototype, "pocId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ExecutionLog.prototype, "targetUrl", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ExecutionLog.prototype, "command", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ExecutionLog.prototype, "output", void 0);
__decorate([
    (0, graphql_1.Field)(() => ExecutionStatus),
    __metadata("design:type", String)
], ExecutionLog.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], ExecutionLog.prototype, "executedAt", void 0);
__decorate([
    (0, graphql_1.Field)(() => POC, { nullable: true }),
    __metadata("design:type", POC)
], ExecutionLog.prototype, "poc", void 0);
exports.ExecutionLog = ExecutionLog = __decorate([
    (0, graphql_1.ObjectType)()
], ExecutionLog);
let CreatePOCInput = class CreatePOCInput {
};
exports.CreatePOCInput = CreatePOCInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePOCInput.prototype, "cveId", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePOCInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePOCInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePOCInput.prototype, "language", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePOCInput.prototype, "scriptPath", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePOCInput.prototype, "usageExamples", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePOCInput.prototype, "author", void 0);
exports.CreatePOCInput = CreatePOCInput = __decorate([
    (0, graphql_1.InputType)()
], CreatePOCInput);
let UpdatePOCInput = class UpdatePOCInput {
};
exports.UpdatePOCInput = UpdatePOCInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePOCInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePOCInput.prototype, "description", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePOCInput.prototype, "language", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePOCInput.prototype, "scriptPath", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePOCInput.prototype, "usageExamples", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePOCInput.prototype, "author", void 0);
exports.UpdatePOCInput = UpdatePOCInput = __decorate([
    (0, graphql_1.InputType)()
], UpdatePOCInput);
let ExecutePOCInput = class ExecutePOCInput {
};
exports.ExecutePOCInput = ExecutePOCInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExecutePOCInput.prototype, "targetUrl", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExecutePOCInput.prototype, "command", void 0);
exports.ExecutePOCInput = ExecutePOCInput = __decorate([
    (0, graphql_1.InputType)()
], ExecutePOCInput);
let ExecutionResult = class ExecutionResult {
};
exports.ExecutionResult = ExecutionResult;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], ExecutionResult.prototype, "success", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ExecutionResult.prototype, "output", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ExecutionResult.prototype, "error", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ExecutionResult.prototype, "executedScriptPath", void 0);
exports.ExecutionResult = ExecutionResult = __decorate([
    (0, graphql_1.ObjectType)()
], ExecutionResult);
let ExecuteResponse = class ExecuteResponse {
};
exports.ExecuteResponse = ExecuteResponse;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ExecuteResponse.prototype, "message", void 0);
__decorate([
    (0, graphql_1.Field)(() => ExecutionResult),
    __metadata("design:type", ExecutionResult)
], ExecuteResponse.prototype, "result", void 0);
__decorate([
    (0, graphql_1.Field)(() => ExecutionLog),
    __metadata("design:type", ExecutionLog)
], ExecuteResponse.prototype, "log", void 0);
exports.ExecuteResponse = ExecuteResponse = __decorate([
    (0, graphql_1.ObjectType)()
], ExecuteResponse);
let POCFiltersInput = class POCFiltersInput {
};
exports.POCFiltersInput = POCFiltersInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], POCFiltersInput.prototype, "cveId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], POCFiltersInput.prototype, "language", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], POCFiltersInput.prototype, "author", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], POCFiltersInput.prototype, "search", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], POCFiltersInput.prototype, "limit", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], POCFiltersInput.prototype, "offset", void 0);
exports.POCFiltersInput = POCFiltersInput = __decorate([
    (0, graphql_1.InputType)()
], POCFiltersInput);
let POCListResponse = class POCListResponse {
};
exports.POCListResponse = POCListResponse;
__decorate([
    (0, graphql_1.Field)(() => [POC]),
    __metadata("design:type", Array)
], POCListResponse.prototype, "pocs", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], POCListResponse.prototype, "total", void 0);
exports.POCListResponse = POCListResponse = __decorate([
    (0, graphql_1.ObjectType)()
], POCListResponse);
//# sourceMappingURL=poc.dto.js.map