export declare class ActivityLog {
    id: string;
    action: string;
    entity: string;
    entityId?: string;
    details?: any;
    performedBy?: string;
    createdAt: Date;
}
export declare class CreateActivityLogInput {
    action: string;
    entity: string;
    entityId?: string;
    details?: any;
    performedBy?: string;
}
export declare class ActivityFiltersInput {
    entity?: string;
    action?: string;
    limit?: number;
    offset?: number;
}
export declare class ActivityListResponse {
    activities: ActivityLog[];
    total: number;
}
