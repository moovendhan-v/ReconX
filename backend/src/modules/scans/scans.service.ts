import { Injectable, Inject } from '@nestjs/common';
import { eq, and, like, desc } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../db/schema';
import {
    CreateScanInput,
    UpdateScanInput,
    ScanFiltersInput,
    ScanListResponse,
    Scan as ScanDTO,
} from './dto/scan.dto';
import { SubdomainResult, PortResult } from '../../db/schema';
import { ScanEventsService } from './scan-events.service';

@Injectable()
export class ScansService {
    constructor(
        @Inject('DATABASE') private db: NodePgDatabase<typeof schema>,
        private readonly scanEventsService: ScanEventsService,
    ) { }

    /**
     * Transform database scan record to DTO (converts progress string to number)
     */
    private transformScanToDTO(scan: any): ScanDTO {
        return {
            ...scan,
            progress: scan.progress ? parseFloat(scan.progress) : undefined,
        };
    }

    async findAll(filters: ScanFiltersInput = {}): Promise<ScanListResponse> {
        const { search, status, type, limit = 20, offset = 0 } = filters;

        let query = this.db
            .select()
            .from(schema.scans)
            .$dynamic();

        const conditions = [];
        if (search) {
            conditions.push(
                like(schema.scans.name, `%${search}%`),
            );
        }
        if (status) {
            conditions.push(eq(schema.scans.status, status));
        }
        if (type) {
            conditions.push(eq(schema.scans.type, type));
        }

        if (conditions.length > 0) {
            query = query.where(and(...conditions)) as any;
        }

        query = query.orderBy(desc(schema.scans.createdAt)) as any;

        if (limit) {
            query = query.limit(limit) as any;
        }
        if (offset) {
            query = query.offset(offset) as any;
        }

        const scans = await query;

        // Get total count
        let countQuery = this.db
            .select()
            .from(schema.scans)
            .$dynamic();

        if (conditions.length > 0) {
            countQuery = countQuery.where(and(...conditions)) as any;
        }

        const totalScans = await countQuery;
        const total = totalScans.length;

        return { scans: scans.map(s => this.transformScanToDTO(s)), total };
    }

    async findById(id: string): Promise<ScanDTO | null> {
        const [scan] = await this.db
            .select()
            .from(schema.scans)
            .where(eq(schema.scans.id, id));

        return scan ? this.transformScanToDTO(scan) : null;
    }

    async create(input: CreateScanInput): Promise<ScanDTO> {
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

    async update(id: string, input: UpdateScanInput): Promise<ScanDTO> {
        const [scan] = await this.db
            .update(schema.scans)
            .set({
                ...input,
                updatedAt: new Date(),
            })
            .where(eq(schema.scans.id, id))
            .returning();

        if (!scan) {
            throw new Error(`Scan with ID ${id} not found`);
        }

        return this.transformScanToDTO(scan);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.db
            .delete(schema.scans)
            .where(eq(schema.scans.id, id))
            .returning();

        return result.length > 0;
    }

    async startScan(id: string): Promise<ScanDTO> {
        return this.update(id, {
            status: 'RUNNING' as any,
        });
    }

    /**
     * Start a quick scan - creates scan job and publishes event
     */
    async startQuickScan(target: string): Promise<ScanDTO> {
        const scan = await this.create({
            name: `Quick Scan - ${target}`,
            target,
            type: 'QUICK' as any,
        });

        // Publish scan created event
        await this.scanEventsService.scanCreated(scan.id, target);

        return scan;
    }

    /**
     * Update scan progress
     */
    async updateProgress(id: string, progress: number): Promise<void> {
        await this.db
            .update(schema.scans)
            .set({
                progress: progress.toString(),
                updatedAt: new Date(),
            })
            .where(eq(schema.scans.id, id));

        // Publish progress event
        await this.scanEventsService.scanProgress(id, progress);
    }

    /**
     * Add a subdomain result to the scan
     */
    async addSubdomainResult(id: string, subdomain: SubdomainResult): Promise<void> {
        const scan = await this.findById(id);
        if (!scan) throw new Error(`Scan ${id} not found`);

        const subdomains = scan.subdomains || [];
        subdomains.push(subdomain);

        await this.db
            .update(schema.scans)
            .set({
                subdomains: subdomains as any,
                updatedAt: new Date(),
            })
            .where(eq(schema.scans.id, id));

        // Publish subdomain found event
        await this.scanEventsService.subdomainFound(id, subdomain);
    }

    /**
     * Add a port result to the scan
     */
    async addPortResult(id: string, port: PortResult): Promise<void> {
        const scan = await this.findById(id);
        if (!scan) throw new Error(`Scan ${id} not found`);

        const openPorts = scan.openPorts || [];
        openPorts.push(port);

        await this.db
            .update(schema.scans)
            .set({
                openPorts: openPorts as any,
                updatedAt: new Date(),
            })
            .where(eq(schema.scans.id, id));

        // Publish port found event
        await this.scanEventsService.portFound(id, port);
    }

    /**
     * Mark scan as completed
     */
    async completeScan(id: string): Promise<ScanDTO> {
        const scan = await this.update(id, {
            status: 'COMPLETED' as any,
        });

        const [updated] = await this.db
            .update(schema.scans)
            .set({
                completedAt: new Date(),
                progress: '100',
                updatedAt: new Date(),
            })
            .where(eq(schema.scans.id, id))
            .returning();

        // Publish completed event
        await this.scanEventsService.scanCompleted(id, {
            subdomains: updated.subdomains,
            openPorts: updated.openPorts,
        });

        return this.transformScanToDTO(updated);
    }

    /**
     * Mark scan as failed
     */
    async failScan(id: string, error: string): Promise<ScanDTO> {
        const [scan] = await this.db
            .update(schema.scans)
            .set({
                status: 'FAILED',
                error,
                completedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(schema.scans.id, id))
            .returning();

        // Publish failed event
        await this.scanEventsService.scanFailed(id, error);

        return this.transformScanToDTO(scan);
    }
}

