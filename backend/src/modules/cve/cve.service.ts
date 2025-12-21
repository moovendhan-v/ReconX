import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, desc, asc, and, or, like, gte, lte, count, sql } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service';
import { RedisService } from '../redis/redis.service';
import { cves, pocs } from '../../db/schema';
import {
  CVE,
  CreateCVEInput,
  UpdateCVEInput,
  CVEFiltersInput,
  CVEListResponse,
  CVEStatistics,
  Severity
} from './dto/cve.dto';

@Injectable()
export class CveService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly redisService: RedisService,
  ) { }

  async findAll(filters: CVEFiltersInput = {}): Promise<CVEListResponse> {
    const db = this.databaseService.getDb();
    const { search, severity, dateFrom, dateTo, limit = 20 } = filters;
    const page = Math.max(1, filters.page || 1);

    // Build where conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(cves.cveId, `%${search}%`),
          like(cves.title, `%${search}%`),
          like(cves.description, `%${search}%`)
        )
      );
    }

    if (severity) {
      conditions.push(eq(cves.severity, severity));
    }

    if (dateFrom) {
      conditions.push(gte(cves.publishedDate, new Date(dateFrom)));
    }

    if (dateTo) {
      conditions.push(lte(cves.publishedDate, new Date(dateTo)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ totalCount }] = await db
      .select({ totalCount: count() })
      .from(cves)
      .where(whereClause);

    // Get paginated results
    const offset = (page - 1) * limit;
    const results = await db
      .select()
      .from(cves)
      .where(whereClause)
      .orderBy(desc(cves.createdAt))
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

  async findOne(id: string): Promise<CVE> {
    const db = this.databaseService.getDb();

    // Try cache first
    const cacheKey = `cve:${id}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const result = await db
      .select()
      .from(cves)
      .where(eq(cves.id, id))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException(`CVE with ID ${id} not found`);
    }

    const cve = this.mapCVEFromDb(result[0]);

    // Cache for 5 minutes
    await this.redisService.set(cacheKey, JSON.stringify(cve), 300);

    return cve;
  }

  async findByCveId(cveId: string): Promise<CVE> {
    const db = this.databaseService.getDb();

    const result = await db
      .select()
      .from(cves)
      .where(eq(cves.cveId, cveId))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException(`CVE with CVE ID ${cveId} not found`);
    }

    return this.mapCVEFromDb(result[0]);
  }

  async findWithPocs(id: string): Promise<CVE> {
    const db = this.databaseService.getDb();

    const cve = await this.findOne(id);

    const pocResults = await db
      .select()
      .from(pocs)
      .where(eq(pocs.cveId, id))
      .orderBy(desc(pocs.createdAt));

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

  async create(input: CreateCVEInput): Promise<CVE> {
    const db = this.databaseService.getDb();

    // Check if CVE ID already exists
    const existing = await db
      .select()
      .from(cves)
      .where(eq(cves.cveId, input.cveId))
      .limit(1);

    if (existing.length > 0) {
      throw new BadRequestException(`CVE with ID ${input.cveId} already exists`);
    }

    const [result] = await db
      .insert(cves)
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

  async update(id: string, input: UpdateCVEInput): Promise<CVE> {
    const db = this.databaseService.getDb();

    const [result] = await db
      .update(cves)
      .set({
        ...input,
        publishedDate: input.publishedDate ? new Date(input.publishedDate) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(cves.id, id))
      .returning();

    if (!result) {
      throw new NotFoundException(`CVE with ID ${id} not found`);
    }

    // Invalidate cache
    await this.redisService.del(`cve:${id}`);

    return this.mapCVEFromDb(result);
  }

  async remove(id: string): Promise<boolean> {
    const db = this.databaseService.getDb();

    const result = await db
      .delete(cves)
      .where(eq(cves.id, id))
      .returning({ id: cves.id });

    if (result.length === 0) {
      throw new NotFoundException(`CVE with ID ${id} not found`);
    }

    // Invalidate cache
    await this.redisService.del(`cve:${id}`);

    return true;
  }

  async search(query: string): Promise<CVE[]> {
    const db = this.databaseService.getDb();

    const results = await db
      .select()
      .from(cves)
      .where(
        or(
          like(cves.cveId, `%${query}%`),
          like(cves.title, `%${query}%`),
          like(cves.description, `%${query}%`)
        )
      )
      .orderBy(desc(cves.createdAt))
      .limit(50);

    return results.map(this.mapCVEFromDb);
  }

  async getStatistics(): Promise<CVEStatistics> {
    const db = this.databaseService.getDb();

    // Try cache first
    const cacheKey = 'cve:statistics';
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(cves);

    // Get count by severity
    const severityStats = await db
      .select({
        severity: cves.severity,
        count: count(),
      })
      .from(cves)
      .groupBy(cves.severity);

    // Get recent count (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [{ recent }] = await db
      .select({ recent: count() })
      .from(cves)
      .where(gte(cves.createdAt, thirtyDaysAgo));

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

    // Cache for 10 minutes
    await this.redisService.set(cacheKey, JSON.stringify(statistics), 600);

    return statistics;
  }

  private mapCVEFromDb(dbCve: any): CVE {
    return {
      id: dbCve.id,
      cveId: dbCve.cveId,
      title: dbCve.title,
      description: dbCve.description,
      severity: dbCve.severity as Severity,
      cvssScore: dbCve.cvssScore,
      publishedDate: dbCve.publishedDate,
      affectedProducts: dbCve.affectedProducts,
      references: dbCve.references,
      createdAt: dbCve.createdAt,
      updatedAt: dbCve.updatedAt,
    };
  }
}