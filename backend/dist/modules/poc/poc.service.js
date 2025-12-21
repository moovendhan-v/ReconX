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
exports.PocService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_service_1 = require("../database/database.service");
const redis_service_1 = require("../redis/redis.service");
const schema_1 = require("../../db/schema");
let PocService = class PocService {
    constructor(databaseService, redisService) {
        this.databaseService = databaseService;
        this.redisService = redisService;
    }
    async findAll(userId, filters = {}) {
        const db = this.databaseService.getDb();
        const { cveId, language, author, search, limit, offset } = filters;
        const conditions = [];
        conditions.push((0, drizzle_orm_1.eq)(schema_1.pocs.userId, userId));
        if (cveId) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.pocs.cveId, cveId));
        }
        if (language) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.pocs.language, language));
        }
        if (author) {
            conditions.push((0, drizzle_orm_1.like)(schema_1.pocs.author, `%${author}%`));
        }
        if (search) {
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(schema_1.pocs.name, `%${search}%`), (0, drizzle_orm_1.like)(schema_1.pocs.description, `%${search}%`), (0, drizzle_orm_1.like)(schema_1.pocs.language, `%${search}%`)));
        }
        const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
        const [{ totalCount }] = await db
            .select({ totalCount: (0, drizzle_orm_1.count)() })
            .from(schema_1.pocs)
            .where(whereClause);
        let query = db
            .select()
            .from(schema_1.pocs)
            .where(whereClause)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.pocs.createdAt));
        if (limit) {
            query = query.limit(limit);
        }
        if (offset) {
            query = query.offset(offset);
        }
        const results = await query;
        return {
            pocs: results.map(this.mapPOCFromDb),
            total: totalCount,
        };
    }
    async findOne(id, userId) {
        const db = this.databaseService.getDb();
        const cacheKey = `poc:${id}:${userId}`;
        const cached = await this.redisService.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
        const result = await db
            .select()
            .from(schema_1.pocs)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.pocs.id, id), (0, drizzle_orm_1.eq)(schema_1.pocs.userId, userId)))
            .limit(1);
        if (result.length === 0) {
            throw new common_1.NotFoundException(`POC with ID ${id} not found or access denied`);
        }
        const poc = this.mapPOCFromDb(result[0]);
        await this.redisService.set(cacheKey, JSON.stringify(poc), 300);
        return poc;
    }
    async findWithLogs(id, userId) {
        const db = this.databaseService.getDb();
        const poc = await this.findOne(id, userId);
        const logResults = await db
            .select()
            .from(schema_1.executionLogs)
            .where((0, drizzle_orm_1.eq)(schema_1.executionLogs.pocId, id))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.executionLogs.executedAt))
            .limit(50);
        poc.executionLogs = logResults.map(log => ({
            id: log.id,
            pocId: log.pocId,
            targetUrl: log.targetUrl,
            command: log.command,
            output: log.output,
            status: log.status,
            executedAt: log.executedAt,
        }));
        return poc;
    }
    async findByCveId(cveId, userId) {
        const db = this.databaseService.getDb();
        const results = await db
            .select()
            .from(schema_1.pocs)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.pocs.cveId, cveId), (0, drizzle_orm_1.eq)(schema_1.pocs.userId, userId)))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.pocs.createdAt));
        return results.map(this.mapPOCFromDb);
    }
    async create(input, userId) {
        const db = this.databaseService.getDb();
        const cveExists = await db
            .select()
            .from(schema_1.cves)
            .where((0, drizzle_orm_1.eq)(schema_1.cves.id, input.cveId))
            .limit(1);
        if (cveExists.length === 0) {
            throw new common_1.BadRequestException(`CVE with ID ${input.cveId} not found`);
        }
        const [result] = await db
            .insert(schema_1.pocs)
            .values({
            cveId: input.cveId,
            userId: userId,
            name: input.name,
            description: input.description,
            language: input.language,
            scriptPath: input.scriptPath,
            usageExamples: input.usageExamples,
            author: input.author,
        })
            .returning();
        return this.mapPOCFromDb(result);
    }
    async update(id, input, userId) {
        const db = this.databaseService.getDb();
        const [result] = await db
            .update(schema_1.pocs)
            .set({
            ...input,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.pocs.id, id), (0, drizzle_orm_1.eq)(schema_1.pocs.userId, userId)))
            .returning();
        if (!result) {
            throw new common_1.NotFoundException(`POC with ID ${id} not found or access denied`);
        }
        await this.redisService.del(`poc:${id}:${userId}`);
        return this.mapPOCFromDb(result);
    }
    async remove(id, userId) {
        const db = this.databaseService.getDb();
        const result = await db
            .delete(schema_1.pocs)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.pocs.id, id), (0, drizzle_orm_1.eq)(schema_1.pocs.userId, userId)))
            .returning({ id: schema_1.pocs.id });
        if (result.length === 0) {
            throw new common_1.NotFoundException(`POC with ID ${id} not found or access denied`);
        }
        await this.redisService.del(`poc:${id}:${userId}`);
        return true;
    }
    async getLogs(pocId, userId, limit = 50) {
        const db = this.databaseService.getDb();
        await this.findOne(pocId, userId);
        const results = await db
            .select()
            .from(schema_1.executionLogs)
            .where((0, drizzle_orm_1.eq)(schema_1.executionLogs.pocId, pocId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.executionLogs.executedAt))
            .limit(Math.min(limit, 100));
        return results.map(log => ({
            id: log.id,
            pocId: log.pocId,
            targetUrl: log.targetUrl,
            command: log.command,
            output: log.output,
            status: log.status,
            executedAt: log.executedAt,
        }));
    }
    mapPOCFromDb(dbPoc) {
        return {
            id: dbPoc.id,
            cveId: dbPoc.cveId,
            name: dbPoc.name,
            description: dbPoc.description,
            language: dbPoc.language,
            scriptPath: dbPoc.scriptPath,
            usageExamples: dbPoc.usageExamples,
            author: dbPoc.author,
            createdAt: dbPoc.createdAt,
            updatedAt: dbPoc.updatedAt,
        };
    }
};
exports.PocService = PocService;
exports.PocService = PocService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        redis_service_1.RedisService])
], PocService);
//# sourceMappingURL=poc.service.js.map