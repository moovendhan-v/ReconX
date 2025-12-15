import { Module } from '@nestjs/common';
import { PocResolver } from './poc.resolver';
import { PocService } from './poc.service';
import { ExecutionService } from './execution.service';

@Module({
  providers: [PocResolver, PocService, ExecutionService],
  exports: [PocService, ExecutionService],
})
export class PocModule {}