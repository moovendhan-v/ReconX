import { Module } from '@nestjs/common';
import { ScansService } from './scans.service';
import { ScansResolver } from './scans.resolver';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [DatabaseModule],
    providers: [ScansService, ScansResolver],
    exports: [ScansService],
})
export class ScansModule { }
