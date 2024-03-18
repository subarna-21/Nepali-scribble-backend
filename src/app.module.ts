import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GlobalModule } from './global/global.module';
import { AuthModule } from './api/auth/auth.module';
import { ProgressModule } from './api/progress/progress.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './common/guards/auth.guard';
import { ProfileModule } from './api/profile/profile.module';

@Module({
  imports: [GlobalModule, AuthModule, ProgressModule, ProfileModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
