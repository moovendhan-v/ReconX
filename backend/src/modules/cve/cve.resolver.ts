import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { CveService } from './cve.service';
import { 
  CVE, 
  CreateCVEInput, 
  UpdateCVEInput, 
  CVEFiltersInput, 
  CVEListResponse, 
  CVEStatistics,
  POC 
} from './dto/cve.dto';

@Resolver(() => CVE)
export class CveResolver {
  constructor(private readonly cveService: CveService) {}

  @Query(() => CVEListResponse, { name: 'cves' })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60) // Cache for 1 minute
  async findAll(@Args('filters', { nullable: true }) filters?: CVEFiltersInput): Promise<CVEListResponse> {
    return this.cveService.findAll(filters);
  }

  @Query(() => CVE, { name: 'cve' })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300) // Cache for 5 minutes
  async findOne(@Args('id', { type: () => ID }) id: string): Promise<CVE> {
    return this.cveService.findOne(id);
  }

  @Query(() => CVE, { name: 'cveByNumber' })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300) // Cache for 5 minutes
  async findByCveId(@Args('cveId') cveId: string): Promise<CVE> {
    return this.cveService.findByCveId(cveId);
  }

  @Query(() => CVE, { name: 'cveWithPocs' })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(180) // Cache for 3 minutes
  async findWithPocs(@Args('id', { type: () => ID }) id: string): Promise<CVE> {
    return this.cveService.findWithPocs(id);
  }

  @Query(() => [CVE], { name: 'searchCves' })
  async search(@Args('query') query: string): Promise<CVE[]> {
    return this.cveService.search(query);
  }

  @Query(() => CVEStatistics, { name: 'cveStatistics' })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(600) // Cache for 10 minutes
  async getStatistics(): Promise<CVEStatistics> {
    return this.cveService.getStatistics();
  }

  @Mutation(() => CVE)
  async createCve(@Args('input') input: CreateCVEInput): Promise<CVE> {
    return this.cveService.create(input);
  }

  @Mutation(() => CVE)
  async updateCve(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateCVEInput,
  ): Promise<CVE> {
    return this.cveService.update(id, input);
  }

  @Mutation(() => Boolean)
  async deleteCve(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.cveService.remove(id);
  }

  @ResolveField(() => [POC], { nullable: true })
  async pocs(@Parent() cve: CVE): Promise<POC[]> {
    // This will be resolved by the POC service
    return cve.pocs || [];
  }
}