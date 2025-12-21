import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ReportsService } from './reports.service';
import { Report, CreateReportInput, ReportFiltersInput, ReportListResponse } from './dto/report.dto';

@Resolver(() => Report)
export class ReportsResolver {
    constructor(private readonly reportsService: ReportsService) { }

    @Query(() => ReportListResponse, { name: 'reports' })
    async findAll(@Args('filters', { type: () => ReportFiltersInput, nullable: true }) filters?: ReportFiltersInput): Promise<ReportListResponse> {
        return this.reportsService.findAll(filters);
    }

    @Query(() => Report, { name: 'report', nullable: true })
    async findById(@Args('id') id: string): Promise<Report | null> {
        return this.reportsService.findById(id);
    }

    @Mutation(() => Report)
    async createReport(@Args('input') input: CreateReportInput): Promise<Report> {
        return this.reportsService.create(input);
    }

    @Mutation(() => Boolean)
    async deleteReport(@Args('id') id: string): Promise<boolean> {
        return this.reportsService.delete(id);
    }
}
