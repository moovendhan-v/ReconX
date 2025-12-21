import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PocService } from './poc.service';
import { ExecutionService } from './execution.service';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { User } from '../../db/schema';
import {
  POC,
  CreatePOCInput,
  UpdatePOCInput,
  POCFiltersInput,
  POCListResponse,
  ExecutePOCInput,
  ExecuteResponse,
  ExecutionLog
} from './dto/poc.dto';
import { CVE } from '../cve/dto/cve.dto';

@Resolver(() => POC)
export class PocResolver {
  constructor(
    private readonly pocService: PocService,
    private readonly executionService: ExecutionService,
  ) { }

  @Query(() => POCListResponse, { name: 'pocs' })
  @UseGuards(GqlAuthGuard)
  async findAll(
    @CurrentUser() user: User,
    @Args('filters', { nullable: true }) filters?: POCFiltersInput,
  ): Promise<POCListResponse> {
    return this.pocService.findAll(user.id, filters);
  }

  @Query(() => POC, { name: 'poc' })
  @UseGuards(GqlAuthGuard)
  async findOne(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<POC> {
    return this.pocService.findOne(id, user.id);
  }

  @Query(() => POC, { name: 'pocWithLogs' })
  @UseGuards(GqlAuthGuard)
  async findWithLogs(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<POC> {
    return this.pocService.findWithLogs(id, user.id);
  }

  @Query(() => [POC], { name: 'pocsByCve' })
  @UseGuards(GqlAuthGuard)
  async findByCveId(
    @CurrentUser() user: User,
    @Args('cveId') cveId: string,
  ): Promise<POC[]> {
    return this.pocService.findByCveId(cveId, user.id);
  }

  @Query(() => [ExecutionLog], { name: 'pocLogs' })
  @UseGuards(GqlAuthGuard)
  async getLogs(
    @CurrentUser() user: User,
    @Args('pocId') pocId: string,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 50 }) limit?: number,
  ): Promise<ExecutionLog[]> {
    return this.pocService.getLogs(pocId, user.id, limit);
  }

  @Mutation(() => POC)
  @UseGuards(GqlAuthGuard)
  async createPoc(
    @CurrentUser() user: User,
    @Args('input') input: CreatePOCInput,
  ): Promise<POC> {
    return this.pocService.create(input, user.id);
  }

  @Mutation(() => POC)
  @UseGuards(GqlAuthGuard)
  async updatePoc(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdatePOCInput,
  ): Promise<POC> {
    return this.pocService.update(id, input, user.id);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deletePoc(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.pocService.remove(id, user.id);
  }

  @Mutation(() => ExecuteResponse)
  @UseGuards(GqlAuthGuard)
  async executePoc(
    @CurrentUser() user: User,
    @Args('pocId') pocId: string,
    @Args('input') input: ExecutePOCInput,
  ): Promise<ExecuteResponse> {
    return this.executionService.executePOC(pocId, input, user.id);
  }

  @ResolveField(() => CVE, { nullable: true })
  async cve(@Parent() poc: POC): Promise<CVE> {
    // This will be resolved by the CVE service if needed
    return poc.cve;
  }

  @ResolveField(() => [ExecutionLog], { nullable: true })
  async executionLogs(
    @Parent() poc: POC,
    @CurrentUser() user: User,
  ): Promise<ExecutionLog[]> {
    if (poc.executionLogs) {
      return poc.executionLogs;
    }
    // Lazy load execution logs if not already loaded
    // Note: This will be called in the context of an authenticated query
    return this.pocService.getLogs(poc.id, user.id, 10);
  }
}