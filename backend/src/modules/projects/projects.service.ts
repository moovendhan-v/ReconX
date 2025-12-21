import { Injectable, Inject } from '@nestjs/common';
import { eq, and, like, desc } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../db/schema';
import { CreateProjectInput, UpdateProjectInput, ProjectFiltersInput, ProjectListResponse, Project as ProjectDTO } from './dto/project.dto';

@Injectable()
export class ProjectsService {
    constructor(@Inject('DATABASE') private db: NodePgDatabase<typeof schema>) { }

    async findAll(filters: ProjectFiltersInput = {}): Promise<ProjectListResponse> {
        const { search, status, limit = 20, offset = 0 } = filters;
        let query = this.db.select().from(schema.projects).$dynamic();
        const conditions = [];

        if (search) conditions.push(like(schema.projects.name, `%${search}%`));
        if (status) conditions.push(eq(schema.projects.status, status));

        if (conditions.length > 0) query = query.where(and(...conditions)) as any;
        query = query.orderBy(desc(schema.projects.createdAt)) as any;

        if (limit) query = query.limit(limit) as any;
        if (offset) query = query.offset(offset) as any;

        const projects = await query;

        let countQuery = this.db.select().from(schema.projects).$dynamic();
        if (conditions.length > 0) countQuery = countQuery.where(and(...conditions)) as any;
        const totalProjects = await countQuery;

        return { projects: projects as ProjectDTO[], total: totalProjects.length };
    }

    async findById(id: string): Promise<ProjectDTO | null> {
        const [project] = await this.db.select().from(schema.projects).where(eq(schema.projects.id, id));
        return project as ProjectDTO || null;
    }

    async create(input: CreateProjectInput): Promise<ProjectDTO> {
        const [project] = await this.db.insert(schema.projects).values({ ...input, status: 'ACTIVE' }).returning();
        return project as ProjectDTO;
    }

    async update(id: string, input: UpdateProjectInput): Promise<ProjectDTO> {
        const [project] = await this.db.update(schema.projects).set({ ...input, updatedAt: new Date() }).where(eq(schema.projects.id, id)).returning();
        if (!project) throw new Error(`Project with ID ${id} not found`);
        return project as ProjectDTO;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.db.delete(schema.projects).where(eq(schema.projects.id, id)).returning();
        return result.length > 0;
    }
}
