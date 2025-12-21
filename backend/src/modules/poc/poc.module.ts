import { Module } from '@nestjs/common';
import { PocService } from './poc.service';
import { PocResolver } from './poc.resolver';
import { ExecutionService } from './execution.service';
import { ExecutionLogsGateway } from './execution-logs.gateway';
import { DatabaseModule } from '../database/database.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [DatabaseModule, RedisModule],
  providers: [
    PocService,
    PocResolver,
    ExecutionService,
    ExecutionLogsGateway,
  ],
  exports: [PocService, ExecutionService],
})
export class PocModule { }