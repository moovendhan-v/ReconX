import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ActivityService } from './activity.service';
import { ActivityLog, CreateActivityLogInput, ActivityFiltersInput, ActivityListResponse } from './dto/activity.dto';

@Resolver(() => ActivityLog)
export class ActivityResolver {
    constructor(private readonly activityService: ActivityService) { }

    @Query(() => ActivityListResponse, { name: 'activities' })
    async findAll(@Args('filters', { type: () => ActivityFiltersInput, nullable: true }) filters?: ActivityFiltersInput): Promise<ActivityListResponse> {
        return this.activityService.findAll(filters);
    }

    @Mutation(() => ActivityLog)
    async createActivityLog(@Args('input') input: CreateActivityLogInput): Promise<ActivityLog> {
        return this.activityService.create(input);
    }
}
