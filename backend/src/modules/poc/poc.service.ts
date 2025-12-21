import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, desc, and, or, like, count } from 'drizzle-orm';
import { DatabaseService } from '../database/database.service';
import { RedisService } from '../redis/redis.service';
import { pocs, cves, executionLogs } from '../../db/schema';
import {
  POC,
  CreatePOCInput,
  UpdatePOCInput,
  POCFiltersInput,
  POCListResponse,
  ExecutionLog
} from './dto/poc.dto';

@Injectable()
export class PocService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly redisService: RedisService,
  ) { }

  async findAll(filters: POCFiltersInput = {}): Promise<POCListResponse> {
    const db = this.databaseService.getDb();
    const { cveId, language, author, search, limit, offset } = filters;

    // Build where conditions
    const conditions = [];

    // ... (existing conditions) ...

    if (cveId) {
      conditions.push(eq(pocs.cveId, cveId));
    }

    if (language) {
      conditions.push(eq(pocs.language, language));
    }

    if (author) {
      conditions.push(like(pocs.author, `%${author}%`));
    }

    if (search) {
      conditions.push(
        or(
          like(pocs.name, `%${search}%`),
          like(pocs.description, `%${search}%`),
          like(pocs.language, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ totalCount }] = await db
      .select({ totalCount: count() })
      .from(pocs)
      .where(whereClause);

    // Get results
    let query: any = db
      .select()
      .from(pocs)
      .where(whereClause)
      .orderBy(desc(pocs.createdAt));

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

  async findOne(id: string): Promise<POC> {
    const db = this.databaseService.getDb();

    // Try cache first
    const cacheKey = `poc:${id}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const result = await db
      .select()
      .from(pocs)
      .where(eq(pocs.id, id))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundException(`POC with ID ${id} not found`);
    }

    const poc = this.mapPOCFromDb(result[0]);

    // Cache for 5 minutes
    await this.redisService.set(cacheKey, JSON.stringify(poc), 300);

    return poc;
  }

  async findWithLogs(id: string): Promise<POC> {
    const db = this.databaseService.getDb();

    const poc = await this.findOne(id);

    const logResults = await db
      .select()
      .from(executionLogs)
      .where(eq(executionLogs.pocId, id))
      .orderBy(desc(executionLogs.executedAt))
      .limit(50); // Limit to last 50 executions

    poc.executionLogs = logResults.map(log => ({
      id: log.id,
      pocId: log.pocId,
      targetUrl: log.targetUrl,
      command: log.command,
      output: log.output,
      status: log.status as any,
      executedAt: log.executedAt,
    }));

    return poc;
  }

  async findByCveId(cveId: string): Promise<POC[]> {
    const db = this.databaseService.getDb();

    const results = await db
      .select()
      .from(pocs)
      .where(eq(pocs.cveId, cveId))
      .orderBy(desc(pocs.createdAt));

    return results.map(this.mapPOCFromDb);
  }

  async create(input: CreatePOCInput): Promise<POC> {
    const db = this.databaseService.getDb();

    // Verify CVE exists
    const cveExists = await db
      .select()
      .from(cves)
      .where(eq(cves.id, input.cveId))
      .limit(1);

    if (cveExists.length === 0) {
      throw new BadRequestException(`CVE with ID ${input.cveId} not found`);
    }

    const [result] = await db
      .insert(pocs)
      .values({
        cveId: input.cveId,
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

  async update(id: string, input: UpdatePOCInput): Promise<POC> {
    const db = this.databaseService.getDb();

    const [result] = await db
      .update(pocs)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(pocs.id, id))
      .returning();

    if (!result) {
      throw new NotFoundException(`POC with ID ${id} not found`);
    }

    // Invalidate cache
    await this.redisService.del(`poc:${id}`);

    return this.mapPOCFromDb(result);
  }

  async remove(id: string): Promise<boolean> {
    const db = this.databaseService.getDb();

    const result = await db
      .delete(pocs)
      .where(eq(pocs.id, id))
      .returning({ id: pocs.id });

    if (result.length === 0) {
      throw new NotFoundException(`POC with ID ${id} not found`);
    }

    // Invalidate cache
    await this.redisService.del(`poc:${id}`);

    return true;
  }

  async getLogs(pocId: string, limit: number = 50): Promise<ExecutionLog[]> {
    const db = this.databaseService.getDb();

    // Verify POC exists
    await this.findOne(pocId);

    const results = await db
      .select()
      .from(executionLogs)
      .where(eq(executionLogs.pocId, pocId))
      .orderBy(desc(executionLogs.executedAt))
      .limit(Math.min(limit, 100)); // Max 100 logs

    return results.map(log => ({
      id: log.id,
      pocId: log.pocId,
      targetUrl: log.targetUrl,
      command: log.command,
      output: log.output,
      status: log.status as any,
      executedAt: log.executedAt,
    }));
  }

  private mapPOCFromDb(dbPoc: any): POC {
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
}