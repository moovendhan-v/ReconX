import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { CveService } from './cve.service';
import {
  CVE,
  CreateCVEInput,
  UpdateCVEInput,
  CVEFiltersInput,
  CVEListResponse,
  CVEStatistics
} from './dto/cve.dto';
import { POC } from '../poc/dto/poc.dto';

@Resolver(() => CVE)
export class CveResolver {
  constructor(private readonly cveService: CveService) { }

  @Query(() => CVEListResponse, { name: 'cves' })
  async findAll(@Args('filters', { nullable: true }) filters?: CVEFiltersInput): Promise<CVEListResponse> {
    return this.cveService.findAll(filters);
  }

  @Query(() => CVE, { name: 'cve' })
  async findOne(@Args('id', { type: () => ID }) id: string): Promise<CVE> {
    return this.cveService.findOne(id);
  }

  @Query(() => CVE, { name: 'cveByNumber' })
  async findByCveId(@Args('cveId') cveId: string): Promise<CVE> {
    return this.cveService.findByCveId(cveId);
  }

  @Query(() => CVE, { name: 'cveWithPocs' })
  async findWithPocs(@Args('id', { type: () => ID }) id: string): Promise<CVE> {
    return this.cveService.findWithPocs(id);
  }

  @Query(() => [CVE], { name: 'searchCves' })
  async search(@Args('query') query: string): Promise<CVE[]> {
    return this.cveService.search(query);
  }

  @Query(() => CVEStatistics, { name: 'cveStatistics' })
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