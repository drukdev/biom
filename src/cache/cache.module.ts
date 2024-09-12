import { Module } from '@nestjs/common';

import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    NestCacheModule.register({
      ttl: Number(process.env.CACHE_DEFAULT_EXPIRY),
      max: Number(process.env.CACHE_MAX_LIMIT)
    })
  ], //Time To Live is in milliseconds
  exports: [NestCacheModule]
})
export class CacheModule {}
