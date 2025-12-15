import { Module } from '@nestjs/common';
import { CveResolver } from './cve.resolver';
import { CveService } from './cve.service';

@Module({
  providers: [CveResolver, CveService],
  exports: [CveService],
})
export class CveModule {}