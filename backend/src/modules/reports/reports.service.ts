import { Injectable, Inject } from '@nestjs/common';
import { eq, and, like, desc } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../db/schema';
import { CreateReportInput, ReportFiltersInput, ReportListResponse, Report as ReportDTO } from './dto/report.dto';

@Injectable()
export class ReportsService {
    constructor(@Inject('DATABASE') private db: NodePgDatabase<typeof schema>) { }

    async findAll(filters: ReportFiltersInput = {}): Promise<ReportListResponse> {
        const { search, type, limit = 20, offset = 0 } = filters;

        let query = this.db.select().from(schema.reports).$dynamic();
        const conditions = [];

        if (search) {
            conditions.push(like(schema.reports.title, `%${search}%`));
        }
        if (type) {
            conditions.push(eq(schema.reports.type, type));
        }

        if (conditions.length > 0) {
            query = query.where(and(...conditions)) as any;
        }

        query = query.orderBy(desc(schema.reports.createdAt)) as any;

        if (limit) query = query.limit(limit) as any;
        if (offset) query = query.offset(offset) as any;

        const reports = await query;

        let countQuery = this.db.select().from(schema.reports).$dynamic();
        if (conditions.length > 0) {
            countQuery = countQuery.where(and(...conditions)) as any;
        }
        const totalReports = await countQuery;

        return { reports: reports as ReportDTO[], total: totalReports.length };
    }

    async findById(id: string): Promise<ReportDTO | null> {
        const [report] = await this.db.select().from(schema.reports).where(eq(schema.reports.id, id));
        return report as ReportDTO || null;
    }

    async create(input: CreateReportInput): Promise<ReportDTO> {
        const [report] = await this.db.insert(schema.reports).values(input).returning();
        return report as ReportDTO;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.db.delete(schema.reports).where(eq(schema.reports.id, id)).returning();
        return result.length > 0;
    }
}
