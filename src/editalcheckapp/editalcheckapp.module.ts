import { Module } from '@nestjs/common';
import { EditalcheckappService } from './editalcheckapp.service';
import { EditalcheckappController } from './editalcheckapp.controller';

@Module({
  providers: [EditalcheckappService],
  controllers: [EditalcheckappController]
})
export class EditalcheckappModule {}
