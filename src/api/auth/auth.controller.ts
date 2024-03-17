import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { registerDto } from './dto/register.dto';
import { HttpResponse } from 'src/common/utils/http-response.util';
import { loginDto } from './dto/login.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ModelService } from 'src/global/model/model.service';
import { Public } from 'src/common/decorators/route-type.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly service: AuthService,
    private readonly modelService: ModelService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() postData: registerDto): Promise<HttpResponse> {
    await this.service.register(postData);

    return new HttpResponse({
      message: 'User successfully registered',
    });
  }

  @Public()
  @Post('login')
  async login(@Body() postData: loginDto): Promise<HttpResponse> {
    const data = await this.service.login(postData);

    return new HttpResponse({
      message: 'User successfully logged in',
      data,
    });
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<HttpResponse> {
    // const data

    await this.modelService.predict(file);

    return new HttpResponse({
      message: 'asjd',
    });
  }
}
