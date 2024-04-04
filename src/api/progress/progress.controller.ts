import {
  BadRequestException,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { LoggedUser } from 'src/common/decorators/logged-user.decorator';
import { HttpResponse } from 'src/common/utils/http-response.util';
import { ProgressService } from './progress.service';
import { FileInterceptor } from '@nestjs/platform-express';
import * as sharp from 'sharp';

@Controller('progress')
export class ProgressController {
  constructor(private readonly service: ProgressService) {}

  @Get('current')
  async getCurrentProgress(
    @LoggedUser() loggedUser: LoggedUser,
  ): Promise<HttpResponse> {
    const data = await this.service.getCurrentProgress(loggedUser);

    return new HttpResponse({
      data,
    });
  }

  @Get('latest')
  async getLatestProgress(
    @LoggedUser() loggedUser: LoggedUser,
  ): Promise<HttpResponse> {
    const data = await this.service.getLatestProgress(loggedUser);

    return new HttpResponse({
      data,
    });
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createOrUpdateProgress(
    @LoggedUser() loggedUser: LoggedUser,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<HttpResponse> {
    const compressor = sharp(file.buffer);
    const compressedBuffer = await compressor
      .resize({ width: 64, height: 64 })
      .flatten({ background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .negate({
        alpha: true,
      })
      .toFormat('png')
      .toBuffer();

    if (!file) throw new BadRequestException('asdj');
    const data = await this.service.createOrUpdateProgress({
      loggedUser,
      postData: {
        ...file,
        buffer: compressedBuffer,
      },
    });

    return new HttpResponse({
      data,
    });
  }

  @Get()
  async getProgress(
    @LoggedUser() loggedUser: LoggedUser,
  ): Promise<HttpResponse> {
    const data = await this.service.getAllProgress(loggedUser);

    return new HttpResponse({
      data,
    });
  }
}
