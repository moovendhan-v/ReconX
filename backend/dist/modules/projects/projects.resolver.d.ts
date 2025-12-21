import { ProjectsService } from './projects.service';
import { Project, CreateProjectInput, UpdateProjectInput, ProjectFiltersInput, ProjectListResponse } from './dto/project.dto';
export declare class ProjectsResolver {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    findAll(filters?: ProjectFiltersInput): Promise<ProjectListResponse>;
    findById(id: string): Promise<Project | null>;
    createProject(input: CreateProjectInput): Promise<Project>;
    updateProject(id: string, input: UpdateProjectInput): Promise<Project>;
    deleteProject(id: string): Promise<boolean>;
}
