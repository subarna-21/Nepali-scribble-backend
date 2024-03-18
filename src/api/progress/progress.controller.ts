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
      .flatten({ background: { r: 0, g: 0, b: 0, alpha: 1 } })
      .toFormat('png')
      .toBuffer();

    // const base64 = Buffer.from(compressedBuffer).toString('base64');
    if (!file) throw new BadRequestException('asdj');
    await this.service.createOrUpdateProgress({
      loggedUser,
      postData: {
        ...file,
        buffer: compressedBuffer,
      },
    });

    return new HttpResponse({});
  }
}
