import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as compression from 'compression';
import helmet from 'helmet';
import { ConsoleLogger } from '@nestjs/common';
import * as morgan from 'morgan';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './common/filters/http-exceptionfilter';
import { CustomZodValidationPipe } from './common/pipelines/zod-custom.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: '*',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.use(
    helmet({
      xssFilter: true,
      frameguard: { action: 'deny' },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: { directives: { defaultSrc: ["'self'"] } },
      noSniff: true,
    }),
  );

  const logger = new ConsoleLogger();

  app.use(
    morgan('dev', {
      stream: {
        write: (str) => {
          logger.log(str.replace('\n', ''), 'RouterLogger');
        },
      },
    }),
  );

  app.use(compression());

  const httpAdapterHost = app.get(HttpAdapterHost);

  app.useGlobalPipes(new CustomZodValidationPipe());

  app.useGlobalFilters(new HttpExceptionFilter(httpAdapterHost, configService));

  await app.listen(configService.get('PORT') || 5001);

  const url = await app.getUrl();

  logger.log(`Application is running on: ${url}`);
}
bootstrap();
