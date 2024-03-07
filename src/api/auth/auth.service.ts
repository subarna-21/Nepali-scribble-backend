import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/global/prisma/prisma.service';
import { registerDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { loginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async register(postData: registerDto) {
    const { name, email, dob } = postData;

    const alreadyExist = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (alreadyExist) throw new BadRequestException('Email already exists');

    const password = await bcrypt.hash(postData.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password,
        dob,
      },
    });

    return user;
  }

  async login(postData: loginDto) {
    const { email, password } = postData;

    const valid = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!valid) throw new BadRequestException('Invalid Credentials');

    const passwordCompare = await bcrypt.compare(password, valid.password);

    if (!passwordCompare) throw new BadRequestException('Invalid Credentials');

    const token = jwt.sign(
      { id: valid.id },
      this.configService.get('JWT_SECRET'),
      {
        expiresIn: '3d',
      },
    );

    return token;
  }
}
