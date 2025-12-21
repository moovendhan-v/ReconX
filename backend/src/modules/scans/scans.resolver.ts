import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ScansService } from './scans.service';
import {
    Scan,
    CreateScanInput,
    UpdateScanInput,
    ScanFiltersInput,
    ScanListResponse,
} from './dto/scan.dto';

@Resolver(() => Scan)
export class ScansResolver {
    constructor(private readonly scansService: ScansService) { }

    @Query(() => ScanListResponse, { name: 'scans' })
    async findAll(
        @Args('filters', { type: () => ScanFiltersInput, nullable: true })
        filters?: ScanFiltersInput,
    ): Promise<ScanListResponse> {
        return this.scansService.findAll(filters);
    }

    @Query(() => Scan, { name: 'scan', nullable: true })
    async findById(@Args('id') id: string): Promise<Scan | null> {
        return this.scansService.findById(id);
    }

    @Mutation(() => Scan)
    async createScan(
        @Args('input') input: CreateScanInput,
    ): Promise<Scan> {
        return this.scansService.create(input);
    }

    @Mutation(() => Scan)
    async updateScan(
        @Args('id') id: string,
        @Args('input') input: UpdateScanInput,
    ): Promise<Scan> {
        return this.scansService.update(id, input);
    }

    @Mutation(() => Boolean)
    async deleteScan(@Args('id') id: string): Promise<boolean> {
        return this.scansService.delete(id);
    }

    @Mutation(() => Scan)
    async startScan(@Args('id') id: string): Promise<Scan> {
        return this.scansService.startScan(id);
    }
}
