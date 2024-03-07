import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ModelService } from './model/model.service';

@Global()
@Module({
  imports: [ConfigModule.forRoot()],
  providers: [PrismaService, ConfigService, ModelService],
  exports: [PrismaService, ConfigService, ModelService],
})
export class GlobalModule {}
