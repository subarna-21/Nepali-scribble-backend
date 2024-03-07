import { ConsoleLogger, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private logger = new ConsoleLogger(PrismaService.name);
  onModuleInit() {
    this.$connect()
      .then(() => {
        this.logger.log('Database connected');
      })
      .catch((err) => {
        this.logger.error('Database connection failed', err);
        process.exit(1);
      });
  }
}
