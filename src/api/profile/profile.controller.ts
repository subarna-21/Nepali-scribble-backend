import {
  Controller,
  Get,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { HttpResponse } from 'src/common/utils/http-response.util';
import { LoggedUser } from 'src/common/decorators/logged-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { createParseFilePipeBuiler } from 'src/common/builders/parse-file.builder';

@Controller('profile')
export class ProfileController {
  constructor(private readonly service: ProfileService) {}

  @Get()
  async get(@LoggedUser() loggedUser: LoggedUser): Promise<HttpResponse> {
    const data = await this.service.get(loggedUser);

    return new HttpResponse({
      data,
    });
  }

  @Put('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @LoggedUser() loggedUser: LoggedUser,
    @UploadedFile(createParseFilePipeBuiler()) file: Express.Multer.File,
  ): Promise<HttpResponse> {
    const data = await this.service.upload({
      id: loggedUser.id,
      loggedUser,
      postData: file,
    });
    return new HttpResponse({
      data,
    });
  }
}
