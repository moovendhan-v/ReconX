import { Injectable, Inject } from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../db/schema';
import { CreateActivityLogInput, ActivityFiltersInput, ActivityListResponse, ActivityLog as ActivityLogDTO } from './dto/activity.dto';

@Injectable()
export class ActivityService {
    constructor(@Inject('DATABASE') private db: NodePgDatabase<typeof schema>) { }

    async findAll(filters: ActivityFiltersInput = {}): Promise<ActivityListResponse> {
        const { entity, action, limit = 50, offset = 0 } = filters;
        let query = this.db.select().from(schema.activityLogs).$dynamic();
        const conditions = [];

        if (entity) conditions.push(eq(schema.activityLogs.entity, entity));
        if (action) conditions.push(eq(schema.activityLogs.action, action));

        if (conditions.length > 0) query = query.where(and(...conditions)) as any;
        query = query.orderBy(desc(schema.activityLogs.createdAt)) as any;

        if (limit) query = query.limit(limit) as any;
        if (offset) query = query.offset(offset) as any;

        const activities = await query;

        let countQuery = this.db.select().from(schema.activityLogs).$dynamic();
        if (conditions.length > 0) countQuery = countQuery.where(and(...conditions)) as any;
        const totalActivities = await countQuery;

        return { activities: activities as ActivityLogDTO[], total: totalActivities.length };
    }

    async create(input: CreateActivityLogInput): Promise<ActivityLogDTO> {
        const [activity] = await this.db.insert(schema.activityLogs).values(input).returning();
        return activity as ActivityLogDTO;
    }
}
