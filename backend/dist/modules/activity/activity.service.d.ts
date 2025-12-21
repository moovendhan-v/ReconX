import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../db/schema';
import { CreateActivityLogInput, ActivityFiltersInput, ActivityListResponse, ActivityLog as ActivityLogDTO } from './dto/activity.dto';
export declare class ActivityService {
    private db;
    constructor(db: NodePgDatabase<typeof schema>);
    findAll(filters?: ActivityFiltersInput): Promise<ActivityListResponse>;
    create(input: CreateActivityLogInput): Promise<ActivityLogDTO>;
}
