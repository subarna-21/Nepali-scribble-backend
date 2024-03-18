import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ModelService } from './model/model.service';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Global()
@Module({
  imports: [ConfigModule.forRoot(), CloudinaryModule],
  providers: [PrismaService, ConfigService, ModelService],
  exports: [PrismaService, ConfigService, ModelService],
})
export class GlobalModule {}
