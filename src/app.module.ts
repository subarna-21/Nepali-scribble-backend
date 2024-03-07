import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GlobalModule } from './global/global.module';
import { AuthModule } from './api/auth/auth.module';

@Module({
  imports: [GlobalModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
