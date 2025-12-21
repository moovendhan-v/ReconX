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
exports.ActivityService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const schema = require("../../db/schema");
let ActivityService = class ActivityService {
    constructor(db) {
        this.db = db;
    }
    async findAll(filters = {}) {
        const { entity, action, limit = 50, offset = 0 } = filters;
        let query = this.db.select().from(schema.activityLogs).$dynamic();
        const conditions = [];
        if (entity)
            conditions.push((0, drizzle_orm_1.eq)(schema.activityLogs.entity, entity));
        if (action)
            conditions.push((0, drizzle_orm_1.eq)(schema.activityLogs.action, action));
        if (conditions.length > 0)
            query = query.where((0, drizzle_orm_1.and)(...conditions));
        query = query.orderBy((0, drizzle_orm_1.desc)(schema.activityLogs.createdAt));
        if (limit)
            query = query.limit(limit);
        if (offset)
            query = query.offset(offset);
        const activities = await query;
        let countQuery = this.db.select().from(schema.activityLogs).$dynamic();
        if (conditions.length > 0)
            countQuery = countQuery.where((0, drizzle_orm_1.and)(...conditions));
        const totalActivities = await countQuery;
        return { activities: activities, total: totalActivities.length };
    }
    async create(input) {
        const [activity] = await this.db.insert(schema.activityLogs).values(input).returning();
        return activity;
    }
};
exports.ActivityService = ActivityService;
exports.ActivityService = ActivityService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DATABASE')),
    __metadata("design:paramtypes", [Object])
], ActivityService);
//# sourceMappingURL=activity.service.js.map