import { ActivityService } from './activity.service';
import { ActivityLog, CreateActivityLogInput, ActivityFiltersInput, ActivityListResponse } from './dto/activity.dto';
export declare class ActivityResolver {
    private readonly activityService;
    constructor(activityService: ActivityService);
    findAll(filters?: ActivityFiltersInput): Promise<ActivityListResponse>;
    createActivityLog(input: CreateActivityLogInput): Promise<ActivityLog>;
}
