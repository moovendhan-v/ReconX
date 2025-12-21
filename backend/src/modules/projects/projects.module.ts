import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsResolver } from './projects.resolver';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [DatabaseModule],
    providers: [ProjectsService, ProjectsResolver],
    exports: [ProjectsService],
})
export class ProjectsModule { }
