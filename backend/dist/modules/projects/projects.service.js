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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const schema = require("../../db/schema");
let ProjectsService = class ProjectsService {
    constructor(db) {
        this.db = db;
    }
    async findAll(filters = {}) {
        const { search, status, limit = 20, offset = 0 } = filters;
        let query = this.db.select().from(schema.projects).$dynamic();
        const conditions = [];
        if (search)
            conditions.push((0, drizzle_orm_1.like)(schema.projects.name, `%${search}%`));
        if (status)
            conditions.push((0, drizzle_orm_1.eq)(schema.projects.status, status));
        if (conditions.length > 0)
            query = query.where((0, drizzle_orm_1.and)(...conditions));
        query = query.orderBy((0, drizzle_orm_1.desc)(schema.projects.createdAt));
        if (limit)
            query = query.limit(limit);
        if (offset)
            query = query.offset(offset);
        const projects = await query;
        let countQuery = this.db.select().from(schema.projects).$dynamic();
        if (conditions.length > 0)
            countQuery = countQuery.where((0, drizzle_orm_1.and)(...conditions));
        const totalProjects = await countQuery;
        return { projects: projects, total: totalProjects.length };
    }
    async findById(id) {
        const [project] = await this.db.select().from(schema.projects).where((0, drizzle_orm_1.eq)(schema.projects.id, id));
        return project || null;
    }
    async create(input) {
        const [project] = await this.db.insert(schema.projects).values({ ...input, status: 'ACTIVE' }).returning();
        return project;
    }
    async update(id, input) {
        const [project] = await this.db.update(schema.projects).set({ ...input, updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(schema.projects.id, id)).returning();
        if (!project)
            throw new Error(`Project with ID ${id} not found`);
        return project;
    }
    async delete(id) {
        const result = await this.db.delete(schema.projects).where((0, drizzle_orm_1.eq)(schema.projects.id, id)).returning();
        return result.length > 0;
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DATABASE')),
    __metadata("design:paramtypes", [Object])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map