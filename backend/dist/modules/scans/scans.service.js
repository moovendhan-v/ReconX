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
exports.ScansService = void 0;
const common_1 = require("@nestjs/common");
const drizzle_orm_1 = require("drizzle-orm");
const schema = require("../../db/schema");
const scan_events_service_1 = require("./scan-events.service");
let ScansService = class ScansService {
    constructor(db, scanEventsService) {
        this.db = db;
        this.scanEventsService = scanEventsService;
    }
    transformScanToDTO(scan) {
        return {
            ...scan,
            progress: scan.progress ? parseFloat(scan.progress) : undefined,
        };
    }
    async findAll(filters = {}) {
        const { search, status, type, limit = 20, offset = 0 } = filters;
        let query = this.db
            .select()
            .from(schema.scans)
            .$dynamic();
        const conditions = [];
        if (search) {
            conditions.push((0, drizzle_orm_1.like)(schema.scans.name, `%${search}%`));
        }
        if (status) {
            conditions.push((0, drizzle_orm_1.eq)(schema.scans.status, status));
        }
        if (type) {
            conditions.push((0, drizzle_orm_1.eq)(schema.scans.type, type));
        }
        if (conditions.length > 0) {
            query = query.where((0, drizzle_orm_1.and)(...conditions));
        }
        query = query.orderBy((0, drizzle_orm_1.desc)(schema.scans.createdAt));
        if (limit) {
            query = query.limit(limit);
        }
        if (offset) {
            query = query.offset(offset);
        }
        const scans = await query;
        let countQuery = this.db
            .select()
            .from(schema.scans)
            .$dynamic();
        if (conditions.length > 0) {
            countQuery = countQuery.where((0, drizzle_orm_1.and)(...conditions));
        }
        const totalScans = await countQuery;
        const total = totalScans.length;
        return { scans: scans.map(s => this.transformScanToDTO(s)), total };
    }
    async findById(id) {
        const [scan] = await this.db
            .select()
            .from(schema.scans)
            .where((0, drizzle_orm_1.eq)(schema.scans.id, id));
        return scan ? this.transformScanToDTO(scan) : null;
    }
    async create(input) {
        const [scan] = await this.db
            .insert(schema.scans)
            .values({
            name: input.name,
            target: input.target,
            type: input.type,
            status: 'PENDING',
        })
            .returning();
        return this.transformScanToDTO(scan);
    }
    async update(id, input) {
        const [scan] = await this.db
            .update(schema.scans)
            .set({
            ...input,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema.scans.id, id))
            .returning();
        if (!scan) {
            throw new Error(`Scan with ID ${id} not found`);
        }
        return this.transformScanToDTO(scan);
    }
    async delete(id) {
        const result = await this.db
            .delete(schema.scans)
            .where((0, drizzle_orm_1.eq)(schema.scans.id, id))
            .returning();
        return result.length > 0;
    }
    async startScan(id) {
        return this.update(id, {
            status: 'RUNNING',
        });
    }
    async startQuickScan(target) {
        const scan = await this.create({
            name: `Quick Scan - ${target}`,
            target,
            type: 'QUICK',
        });
        await this.scanEventsService.scanCreated(scan.id, target);
        return scan;
    }
    async updateProgress(id, progress) {
        await this.db
            .update(schema.scans)
            .set({
            progress: progress.toString(),
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema.scans.id, id));
        await this.scanEventsService.scanProgress(id, progress);
    }
    async addSubdomainResult(id, subdomain) {
        const scan = await this.findById(id);
        if (!scan)
            throw new Error(`Scan ${id} not found`);
        const subdomains = scan.subdomains || [];
        subdomains.push(subdomain);
        await this.db
            .update(schema.scans)
            .set({
            subdomains: subdomains,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema.scans.id, id));
        await this.scanEventsService.subdomainFound(id, subdomain);
    }
    async addPortResult(id, port) {
        const scan = await this.findById(id);
        if (!scan)
            throw new Error(`Scan ${id} not found`);
        const openPorts = scan.openPorts || [];
        openPorts.push(port);
        await this.db
            .update(schema.scans)
            .set({
            openPorts: openPorts,
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema.scans.id, id));
        await this.scanEventsService.portFound(id, port);
    }
    async completeScan(id) {
        const scan = await this.update(id, {
            status: 'COMPLETED',
        });
        const [updated] = await this.db
            .update(schema.scans)
            .set({
            completedAt: new Date(),
            progress: '100',
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema.scans.id, id))
            .returning();
        await this.scanEventsService.scanCompleted(id, {
            subdomains: updated.subdomains,
            openPorts: updated.openPorts,
        });
        return this.transformScanToDTO(updated);
    }
    async failScan(id, error) {
        const [scan] = await this.db
            .update(schema.scans)
            .set({
            status: 'FAILED',
            error,
            completedAt: new Date(),
            updatedAt: new Date(),
        })
            .where((0, drizzle_orm_1.eq)(schema.scans.id, id))
            .returning();
        await this.scanEventsService.scanFailed(id, error);
        return this.transformScanToDTO(scan);
    }
};
exports.ScansService = ScansService;
exports.ScansService = ScansService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('DATABASE')),
    __metadata("design:paramtypes", [Object, scan_events_service_1.ScanEventsService])
], ScansService);
//# sourceMappingURL=scans.service.js.map