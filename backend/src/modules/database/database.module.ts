import { Module, Global } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Global()
@Module({
  providers: [
    DatabaseService,
    {
      provide: 'DATABASE',
      useFactory: (databaseService: DatabaseService) => databaseService.getDb(),
      inject: [DatabaseService],
    },
  ],
  exports: [DatabaseService, 'DATABASE'],
})
export class DatabaseModule { }