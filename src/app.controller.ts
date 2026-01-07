import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { RedisService } from './services/redis.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly redisService: RedisService // FORCE LOAD
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
