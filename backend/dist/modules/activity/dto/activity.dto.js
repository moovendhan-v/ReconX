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
exports.ActivityListResponse = exports.ActivityFiltersInput = exports.CreateActivityLogInput = exports.ActivityLog = void 0;
const graphql_1 = require("@nestjs/graphql");
const class_validator_1 = require("class-validator");
const graphql_type_json_1 = require("graphql-type-json");
let ActivityLog = class ActivityLog {
};
exports.ActivityLog = ActivityLog;
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ActivityLog.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ActivityLog.prototype, "action", void 0);
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], ActivityLog.prototype, "entity", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ActivityLog.prototype, "entityId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    __metadata("design:type", Object)
], ActivityLog.prototype, "details", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], ActivityLog.prototype, "performedBy", void 0);
__decorate([
    (0, graphql_1.Field)(() => Date),
    __metadata("design:type", Date)
], ActivityLog.prototype, "createdAt", void 0);
exports.ActivityLog = ActivityLog = __decorate([
    (0, graphql_1.ObjectType)()
], ActivityLog);
let CreateActivityLogInput = class CreateActivityLogInput {
};
exports.CreateActivityLogInput = CreateActivityLogInput;
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateActivityLogInput.prototype, "action", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateActivityLogInput.prototype, "entity", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateActivityLogInput.prototype, "entityId", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_type_json_1.default, { nullable: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateActivityLogInput.prototype, "details", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateActivityLogInput.prototype, "performedBy", void 0);
exports.CreateActivityLogInput = CreateActivityLogInput = __decorate([
    (0, graphql_1.InputType)()
], CreateActivityLogInput);
let ActivityFiltersInput = class ActivityFiltersInput {
};
exports.ActivityFiltersInput = ActivityFiltersInput;
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ActivityFiltersInput.prototype, "entity", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ActivityFiltersInput.prototype, "action", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true, defaultValue: 50 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ActivityFiltersInput.prototype, "limit", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int, { nullable: true, defaultValue: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ActivityFiltersInput.prototype, "offset", void 0);
exports.ActivityFiltersInput = ActivityFiltersInput = __decorate([
    (0, graphql_1.InputType)()
], ActivityFiltersInput);
let ActivityListResponse = class ActivityListResponse {
};
exports.ActivityListResponse = ActivityListResponse;
__decorate([
    (0, graphql_1.Field)(() => [ActivityLog]),
    __metadata("design:type", Array)
], ActivityListResponse.prototype, "activities", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], ActivityListResponse.prototype, "total", void 0);
exports.ActivityListResponse = ActivityListResponse = __decorate([
    (0, graphql_1.ObjectType)()
], ActivityListResponse);
//# sourceMappingURL=activity.dto.js.map