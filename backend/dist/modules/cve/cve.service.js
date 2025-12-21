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
exports.CveService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const database_service_1 = require("../database/database.service");
const redis_service_1 = require("../redis/redis.service");
const schema_1 = require("../../db/schema");
let CveService = class CveService {
    constructor(databaseService, redisService) {
        this.databaseService = databaseService;
        this.redisService = redisService;
    }
    async findAll(filters = {}) {
        const db = this.databaseService.getDb();
        const { search, severity, dateFrom, dateTo, limit = 20 } = filters;
        const page = Math.max(1, filters.page || 1);
        const conditions = [];
        if (search) {
            conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(schema_1.cves.cveId, `%${search}%`), (0, drizzle_orm_1.like)(schema_1.cves.title, `%${search}%`), (0, drizzle_orm_1.like)(schema_1.cves.description, `%${search}%`)));
        }
        if (severity) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.cves.severity, severity));
        }
        if (dateFrom) {
            conditions.push((0, drizzle_orm_1.gte)(schema_1.cves.publishedDate, new Date(dateFrom)));
        }
        if (dateTo) {
            conditions.push((0, drizzle_orm_1.lte)(schema_1.cves.publishedDate, new Date(dateTo)));
        }
        const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
        const [{ totalCount }] = await db
            .select({ totalCount: (0, drizzle_orm_1.count)() })
            .from(schema_1.cves)
            .where(whereClause);
        const offset = (page - 1) * limit;
        const results = await db
            .select()
            .from(schema_1.cves)
            .where(whereClause)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.cves.createdAt))
            .limit(limit)
            .offset(offset);
        const totalPages = Math.ceil(totalCount / limit);
        return {
            cves: results.map(this.mapCVEFromDb),
            total: totalCount,
            page,
            limit,
            totalPages,
        };
    }
    async findOne(id) {
        const db = this.databaseService.getDb();
        const cacheKey = `cve:${id}`;
        const cached = await this.redisService.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
        const result = await db
            .select()
            .from(schema_1.cves)
            .where((0, drizzle_orm_1.eq)(schema_1.cves.id, id))
            .limit(1);
        if (result.length === 0) {
            throw new common_1.NotFoundException(`CVE with ID ${id} not found`);
        }
        const cve = this.mapCVEFromDb(result[0]);
        await this.redisService.set(cacheKey, JSON.stringify(cve), 300);
        return cve;
    }
    async findByCveId(cveId) {
        const db = this.databaseService.getDb();
        const result = await db
            .select()
            .from(schema_1.cves)
            .where((0, drizzle_orm_1.eq)(schema_1.cves.cveId, cveId))
            .limit(1);
        if (result.length === 0) {
            throw new common_1.NotFoundException(`CVE with CVE ID ${cveId} not found`);
        }
        return this.mapCVEFromDb(result[0]);
    }
    async findWithPocs(id) {
        const db = this.databaseService.getDb();
        const cve = await this.findOne(id);
        const pocResults = await db
            .select()
            .from(schema_1.pocs)
            .where((0, drizzle_orm_1.eq)(schema_1.pocs.cveId, id))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.pocs.createdAt));
        cve.pocs = pocResults.map(poc => ({
            id: poc.id,
            cveId: poc.cveId,
            name: poc.name,
            description: poc.description,
            language: poc.language,
            scriptPath: poc.scriptPath,
            usageExamples: poc.usageExamples,
            author: poc.author,
            createdAt: poc.createdAt,
            updatedAt: poc.updatedAt,
        }));
        return cve;
    }
    async create(input) {
        const db = this.databaseService.getDb();
        const existing = await db
            .select()
            .from(schema_1.cves)
            .where((0, drizzle_orm_1.eq)(schema_1.cves.cveId, input.cveId))
            .limit(1);
        if (existing.length > 0) {
            throw new common_1.BadRequestException(`CVE with ID ${input.cveId} already exists`);
        }
        const [result] = await db
            .insert(schema_1.cves)
            .values({
            cveId: input.cveId,
            title: input.title,
            description: input.description,
            severity: input.severity,
            cvssScore: input.cvssScore,
            publishedDate: input.publishedDate ? new Date(input.publishedDate) : null,
            affectedProducts: input.affectedProducts,
            references: input.references,
        })
            .returning();
        return this.mapCVEFromDb(result);
    }
    async update(id, input) {
        const db = this.databaseService.getDb();
        const [result] = await db
            .update(schema_1.cves)
            .set({
            ...input,
            publishedDate: input.publishedDate ? new Date(input.publishedDate) : undefined,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.cves.id, id))
            .returning();
        if (!result) {
            throw new common_1.NotFoundException(`CVE with ID ${id} not found`);
        }
        await this.redisService.del(`cve:${id}`);
        return this.mapCVEFromDb(result);
    }
    async remove(id) {
        const db = this.databaseService.getDb();
        const result = await db
            .delete(schema_1.cves)
            .where((0, drizzle_orm_1.eq)(schema_1.cves.id, id))
            .returning({ id: schema_1.cves.id });
        if (result.length === 0) {
            throw new common_1.NotFoundException(`CVE with ID ${id} not found`);
        }
        await this.redisService.del(`cve:${id}`);
        return true;
    }
    async search(query) {
        const db = this.databaseService.getDb();
        const results = await db
            .select()
            .from(schema_1.cves)
            .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(schema_1.cves.cveId, `%${query}%`), (0, drizzle_orm_1.like)(schema_1.cves.title, `%${query}%`), (0, drizzle_orm_1.like)(schema_1.cves.description, `%${query}%`)))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.cves.createdAt))
            .limit(50);
        return results.map(this.mapCVEFromDb);
    }
    async getStatistics() {
        const db = this.databaseService.getDb();
        const cacheKey = 'cve:statistics';
        const cached = await this.redisService.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
        const [{ total }] = await db
            .select({ total: (0, drizzle_orm_1.count)() })
            .from(schema_1.cves);
        const severityStats = await db
            .select({
            severity: schema_1.cves.severity,
            count: (0, drizzle_orm_1.count)(),
        })
            .from(schema_1.cves)
            .groupBy(schema_1.cves.severity);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const [{ recent }] = await db
            .select({ recent: (0, drizzle_orm_1.count)() })
            .from(schema_1.cves)
            .where((0, drizzle_orm_1.gte)(schema_1.cves.createdAt, thirtyDaysAgo));
        const bySeverity = {
            LOW: 0,
            MEDIUM: 0,
            HIGH: 0,
            CRITICAL: 0,
        };
        severityStats.forEach(stat => {
            bySeverity[stat.severity] = stat.count;
        });
        const statistics = {
            total,
            bySeverity,
            recent,
        };
        await this.redisService.set(cacheKey, JSON.stringify(statistics), 600);
        return statistics;
    }
    mapCVEFromDb(dbCve) {
        return {
            id: dbCve.id,
            cveId: dbCve.cveId,
            title: dbCve.title,
            description: dbCve.description,
            severity: dbCve.severity,
            cvssScore: dbCve.cvssScore,
            publishedDate: dbCve.publishedDate,
            affectedProducts: dbCve.affectedProducts,
            references: dbCve.references,
            createdAt: dbCve.createdAt,
            updatedAt: dbCve.updatedAt,
        };
    }
};
exports.CveService = CveService;
exports.CveService = CveService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        redis_service_1.RedisService])
], CveService);
//# sourceMappingURL=cve.service.js.map