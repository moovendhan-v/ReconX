"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const projects_service_1 = require("./projects.service");
const project_dto_1 = require("./dto/project.dto");
let ProjectsResolver = class ProjectsResolver {
    constructor(projectsService) {
        this.projectsService = projectsService;
    }
    async findAll(filters) {
        return this.projectsService.findAll(filters);
    }
    async findById(id) {
        return this.projectsService.findById(id);
    }
    async createProject(input) {
        return this.projectsService.create(input);
    }
    async updateProject(id, input) {
        return this.projectsService.update(id, input);
    }
    async deleteProject(id) {
        return this.projectsService.delete(id);
    }
};
exports.ProjectsResolver = ProjectsResolver;
__decorate([
    (0, graphql_1.Query)(() => project_dto_1.ProjectListResponse, { name: 'projects' }),
    __param(0, (0, graphql_1.Args)('filters', { type: () => project_dto_1.ProjectFiltersInput, nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [project_dto_1.ProjectFiltersInput]),
    __metadata("design:returntype", Promise)
], ProjectsResolver.prototype, "findAll", null);
__decorate([
    (0, graphql_1.Query)(() => project_dto_1.Project, { name: 'project', nullable: true }),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectsResolver.prototype, "findById", null);
__decorate([
    (0, graphql_1.Mutation)(() => project_dto_1.Project),
    __param(0, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [project_dto_1.CreateProjectInput]),
    __metadata("design:returntype", Promise)
], ProjectsResolver.prototype, "createProject", null);
__decorate([
    (0, graphql_1.Mutation)(() => project_dto_1.Project),
    __param(0, (0, graphql_1.Args)('id')),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, project_dto_1.UpdateProjectInput]),
    __metadata("design:returntype", Promise)
], ProjectsResolver.prototype, "updateProject", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectsResolver.prototype, "deleteProject", null);
exports.ProjectsResolver = ProjectsResolver = __decorate([
    (0, graphql_1.Resolver)(() => project_dto_1.Project),
    __metadata("design:paramtypes", [projects_service_1.ProjectsService])
], ProjectsResolver);
//# sourceMappingURL=projects.resolver.js.map