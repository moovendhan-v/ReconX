import { Module } from '@nestjs/common';
import { ScansService } from './scans.service';
import { ScansResolver } from './scans.resolver';
import { DatabaseModule } from '../database/database.module';
import { RedisModule } from '../redis/redis.module';
import { ScanEventsService } from './scan-events.service';
import { ScansGateway } from './scans.gateway';
import { ScanOrchestratorService } from './scan-orchestrator.service';

@Module({
    imports: [DatabaseModule, RedisModule],
    providers: [ScansService, ScansResolver, ScanEventsService, ScansGateway, ScanOrchestratorService],
    exports: [ScansService, ScanEventsService],
})
export class ScansModule { }
