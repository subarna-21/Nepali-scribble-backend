import {
  BadRequestException,
  Body,
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
    @Body() body: any,
  ): Promise<HttpResponse> {
    console.log(body);
    console.log(file);
    if (!file) throw new BadRequestException('asdj');
    await this.service.createOrUpdateProgress({
      loggedUser,
      postData: file,
    });

    return new HttpResponse({});
  }
}
