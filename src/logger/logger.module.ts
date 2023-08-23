import { Module } from '@nestjs/common';
import { NDILogger } from './logger.service';


@Module({
  providers: [NDILogger],
  exports: [NDILogger]
})
export class LoggerModule {}
