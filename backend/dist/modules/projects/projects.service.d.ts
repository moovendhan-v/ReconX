import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../db/schema';
import { CreateProjectInput, UpdateProjectInput, ProjectFiltersInput, ProjectListResponse, Project as ProjectDTO } from './dto/project.dto';
export declare class ProjectsService {
    private db;
    constructor(db: NodePgDatabase<typeof schema>);
    findAll(filters?: ProjectFiltersInput): Promise<ProjectListResponse>;
    findById(id: string): Promise<ProjectDTO | null>;
    create(input: CreateProjectInput): Promise<ProjectDTO>;
    update(id: string, input: UpdateProjectInput): Promise<ProjectDTO>;
    delete(id: string): Promise<boolean>;
}
