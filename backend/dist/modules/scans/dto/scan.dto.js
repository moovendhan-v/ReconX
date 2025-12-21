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
exports.ScanListResponse = exports.ScanFiltersInput = exports.UpdateScanInput = exports.CreateScanInput = exports.Scan = exports.ScanStatus = exports.ScanType = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const graphql_type_json_1 = require("graphql-type-json");
var ScanType;
(function (ScanType) {
    ScanType["QUICK"] = "QUICK";
    ScanType["FULL"] = "FULL";
    ScanType["CUSTOM"] = "CUSTOM";
})(ScanType || (exports.ScanType = ScanType = {}));
var ScanStatus;
(function (ScanStatus) {
    ScanStatus["PENDING"] = "PENDING";
    ScanStatus["RUNNING"] = "RUNNING";
    ScanStatus["COMPLETED"] = "COMPLETED";
    ScanStatus["FAILED"] = "FAILED";
})(ScanStatus || (exports.ScanStatus = ScanStatus = {}));
(0, graphql_1.registerEnumType)(ScanType, { name: 'ScanType' });
(0, graphql_1.registerEnumType)(ScanStatus, { name: 'ScanStatus' });
let Scan = class Scan {
};
exports.Scan = Scan;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Scan.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Scan.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], Scan.prototype, "target", void 0);
__decorate([
    (0, graphql_1.Field)(() => ScanType),
    __metadata("design:type", String)
], Scan.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(() => ScanStatus),
    __metadata("design:type", String)
], Scan.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    __metadata("design:type", Object)
], Scan.prototype, "results", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], Scan.prototype, "startedAt", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", Date)
], Scan.prototype, "completedAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Scan.prototype, "createdAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Date)
], Scan.prototype, "updatedAt", void 0);
exports.Scan = Scan = __decorate([
    (0, graphql_1.ObjectType)()
], Scan);
let CreateScanInput = class CreateScanInput {
};
exports.CreateScanInput = CreateScanInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateScanInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateScanInput.prototype, "target", void 0);
__decorate([
    (0, graphql_1.Field)(() => ScanType),
    (0, class_validator_1.IsEnum)(ScanType),
    __metadata("design:type", String)
], CreateScanInput.prototype, "type", void 0);
exports.CreateScanInput = CreateScanInput = __decorate([
    (0, graphql_1.InputType)()
], CreateScanInput);
let UpdateScanInput = class UpdateScanInput {
};
exports.UpdateScanInput = UpdateScanInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateScanInput.prototype, "name", void 0);
__decorate([
    (0, graphql_1.Field)(() => ScanStatus, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ScanStatus),
    __metadata("design:type", String)
], UpdateScanInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateScanInput.prototype, "results", void 0);
exports.UpdateScanInput = UpdateScanInput = __decorate([
    (0, graphql_1.InputType)()
], UpdateScanInput);
let ScanFiltersInput = class ScanFiltersInput {
};
exports.ScanFiltersInput = ScanFiltersInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ScanFiltersInput.prototype, "search", void 0);
__decorate([
    (0, graphql_1.Field)(() => ScanStatus, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ScanStatus),
    __metadata("design:type", String)
], ScanFiltersInput.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(() => ScanType, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ScanType),
    __metadata("design:type", String)
], ScanFiltersInput.prototype, "type", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true, defaultValue: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ScanFiltersInput.prototype, "limit", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true, defaultValue: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ScanFiltersInput.prototype, "offset", void 0);
exports.ScanFiltersInput = ScanFiltersInput = __decorate([
    (0, graphql_1.InputType)()
], ScanFiltersInput);
let ScanListResponse = class ScanListResponse {
};
exports.ScanListResponse = ScanListResponse;
__decorate([
    (0, graphql_1.Field)(() => [Scan]),
    __metadata("design:type", Array)
], ScanListResponse.prototype, "scans", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ScanListResponse.prototype, "total", void 0);
exports.ScanListResponse = ScanListResponse = __decorate([
    (0, graphql_1.ObjectType)()
], ScanListResponse);
//# sourceMappingURL=scan.dto.js.map