import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ProjectsService } from './projects.service';
import { Project, CreateProjectInput, UpdateProjectInput, ProjectFiltersInput, ProjectListResponse } from './dto/project.dto';

@Resolver(() => Project)
export class ProjectsResolver {
    constructor(private readonly projectsService: ProjectsService) { }

    @Query(() => ProjectListResponse, { name: 'projects' })
    async findAll(@Args('filters', { type: () => ProjectFiltersInput, nullable: true }) filters?: ProjectFiltersInput): Promise<ProjectListResponse> {
        return this.projectsService.findAll(filters);
    }

    @Query(() => Project, { name: 'project', nullable: true })
    async findById(@Args('id') id: string): Promise<Project | null> {
        return this.projectsService.findById(id);
    }

    @Mutation(() => Project)
    async createProject(@Args('input') input: CreateProjectInput): Promise<Project> {
        return this.projectsService.create(input);
    }

    @Mutation(() => Project)
    async updateProject(@Args('id') id: string, @Args('input') input: UpdateProjectInput): Promise<Project> {
        return this.projectsService.update(id, input);
    }

    @Mutation(() => Boolean)
    async deleteProject(@Args('id') id: string): Promise<boolean> {
        return this.projectsService.delete(id);
    }
}
