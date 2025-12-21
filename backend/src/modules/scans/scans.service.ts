import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
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

@Injectable()
export class ScansService {
    constructor(
        @Inject('DATABASE') private db: NodePgDatabase<typeof schema>,
    ) { }

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

        return { scans: scans as ScanDTO[], total };
    }

    async findById(id: string): Promise<ScanDTO | null> {
        const [scan] = await this.db
            .select()
            .from(schema.scans)
            .where(eq(schema.scans.id, id));

        return scan as ScanDTO || null;
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

        return scan as ScanDTO;
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

        return scan as ScanDTO;
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
}
