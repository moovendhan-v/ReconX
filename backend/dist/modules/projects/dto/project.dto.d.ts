export declare class Project {
    id: string;
    name: string;
    description?: string;
    status: string;
    metadata?: any;
    createdAt: Date;
    updatedAt: Date;
}
export declare class CreateProjectInput {
    name: string;
    description?: string;
    metadata?: any;
}
export declare class UpdateProjectInput {
    name?: string;
    description?: string;
    status?: string;
    metadata?: any;
}
export declare class ProjectFiltersInput {
    search?: string;
    status?: string;
    limit?: number;
    offset?: number;
}
export declare class ProjectListResponse {
    projects: Project[];
    total: number;
}
