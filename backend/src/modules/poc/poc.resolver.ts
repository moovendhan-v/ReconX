import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent, Int } from '@nestjs/graphql';
import { UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { PocService } from './poc.service';
import { ExecutionService } from './execution.service';
import { 
  POC, 
  CreatePOCInput, 
  UpdatePOCInput, 
  POCFiltersInput,
  POCListResponse,
  ExecutePOCInput,
  ExecuteResponse,
  ExecutionLog,
  CVE 
} from './dto/poc.dto';

@Resolver(() => POC)
export class PocResolver {
  constructor(
    private readonly pocService: PocService,
    private readonly executionService: ExecutionService,
  ) {}

  @Query(() => POCListResponse, { name: 'pocs' })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60) // Cache for 1 minute
  async findAll(@Args('filters', { nullable: true }) filters?: POCFiltersInput): Promise<POCListResponse> {
    return this.pocService.findAll(filters);
  }

  @Query(() => POC, { name: 'poc' })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300) // Cache for 5 minutes
  async findOne(@Args('id', { type: () => ID }) id: string): Promise<POC> {
    return this.pocService.findOne(id);
  }

  @Query(() => POC, { name: 'pocWithLogs' })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60) // Cache for 1 minute (logs change frequently)
  async findWithLogs(@Args('id', { type: () => ID }) id: string): Promise<POC> {
    return this.pocService.findWithLogs(id);
  }

  @Query(() => [POC], { name: 'pocsByCve' })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(180) // Cache for 3 minutes
  async findByCveId(@Args('cveId') cveId: string): Promise<POC[]> {
    return this.pocService.findByCveId(cveId);
  }

  @Query(() => [ExecutionLog], { name: 'pocLogs' })
  async getLogs(
    @Args('pocId') pocId: string,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 50 }) limit?: number,
  ): Promise<ExecutionLog[]> {
    return this.pocService.getLogs(pocId, limit);
  }

  @Mutation(() => POC)
  async createPoc(@Args('input') input: CreatePOCInput): Promise<POC> {
    return this.pocService.create(input);
  }

  @Mutation(() => POC)
  async updatePoc(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdatePOCInput,
  ): Promise<POC> {
    return this.pocService.update(id, input);
  }

  @Mutation(() => Boolean)
  async deletePoc(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.pocService.remove(id);
  }

  @Mutation(() => ExecuteResponse)
  async executePoc(
    @Args('pocId') pocId: string,
    @Args('input') input: ExecutePOCInput,
  ): Promise<ExecuteResponse> {
    return this.executionService.executePOC(pocId, input);
  }

  @ResolveField(() => CVE, { nullable: true })
  async cve(@Parent() poc: POC): Promise<CVE> {
    // This will be resolved by the CVE service if needed
    return poc.cve;
  }

  @ResolveField(() => [ExecutionLog], { nullable: true })
  async executionLogs(@Parent() poc: POC): Promise<ExecutionLog[]> {
    if (poc.executionLogs) {
      return poc.executionLogs;
    }
    // Lazy load execution logs if not already loaded
    return this.pocService.getLogs(poc.id, 10);
  }
}