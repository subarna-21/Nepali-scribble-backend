import { BadRequestException, Injectable } from '@nestjs/common';
import { characters } from 'src/common/data';
import { ModelService } from 'src/global/model/model.service';
import { PrismaService } from 'src/global/prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly model: ModelService,
  ) {}

  async getCurrentProgress(data: LoggedUser) {
    const progress = await this.prisma.progress.findFirst({
      where: {
        userId: data.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!progress)
      return {
        char: characters[0],
      };

    if (!progress.completed) return progress;

    const next = characters[characters.indexOf(progress.char) + 1];

    return {
      char: next,
    };
  }

  async getLatestProgress(data: LoggedUser) {
    const progress = await this.prisma.progress.findFirst({
      where: {
        userId: data.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return progress;
  }

  async createOrUpdateProgress(data: CreateParam<Express.Multer.File>) {
    // let accuracy = 0;
    const current = await this.getCurrentProgress(data.loggedUser);

    const prediction = await this.model.predict(data.postData);

    // const ssim = await this.model.checkSimilarity(data.postData, current.char);

    console.log(prediction);
    // console.log(ssim);

    if (current.char === prediction)
      throw new BadRequestException('Could not predict');

    // if (current.char) {
    //   await this.prisma.progress.update({
    //     where: {
    //       userId: data.loggedUser.id,
    //     },
    //     data: {
    //       char: current.char,
    //       completed: true,
    //     },
    //   });
    // }
  }
}
