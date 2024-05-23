import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Progress } from '@prisma/client';
import { characters } from 'src/common/data';
import { CloudinaryService } from 'src/global/cloudinary/cloudinary.service';
import { ModelService } from 'src/global/model/model.service';
import { PrismaService } from 'src/global/prisma/prisma.service';
import { createWorker } from 'tesseract.js';

@Injectable()
export class ProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly model: ModelService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async getCurrentProgress(
    data: LoggedUser,
  ): Promise<Progress | { char: string }> {
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
    let accuracy = 20;
    const worker = await createWorker('nep');
    const current = await this.getCurrentProgress(data.loggedUser);

    const prediction = await this.model.predict(data.postData);
    const predictionX = await worker.recognize(data.postData.buffer);

    // const ssim = await this.model.checkSimilarity(data.postData, current.char);

    if (current.char === prediction) {
      accuracy += Math.floor(Math.random() * 21) + 40;
    }    

    if (current.char === predictionX.data.text.charAt(0))  {
      accuracy += Math.floor(Math.random() * 21) + 40;
    };

    if(accuracy >= 100) {
      accuracy = Math.floor(Math.random() * 8) + 90;
    }

    const image = await this.cloudinary
      .uploadImage(data.postData, false)
      .catch(() => {
        throw new ConflictException('Could not upload image');
      });

    if (accuracy < 50)
      if ('id' in current) {
        if (current.noOfTry > 5) {
          return await this.prisma.progress.update({
            where: {
              id: current.id,
            },
            data: {
              accuracy,
              noOfTry: {
                increment: 1,
              },
              completed: true,
              input: image.url,
            },
          });
        }
        await this.prisma.progress.update({
          where: {
            id: current.id,
          },
          data: {
            accuracy,
            noOfTry: {
              increment: 1,
            },
            input: image.url,
          },
        });
        throw new BadRequestException('Accuracy too low');
      } else {
        await this.prisma.progress.create({
          data: {
            char: current.char,
            userId: data.loggedUser.id,
            completed: false,
            accuracy,
            input: image.url,
            noOfTry: 1,
          },
        });
        throw new BadRequestException('Accuracy too low');
      }

    let progress: Progress | undefined;

    if ('id' in current && current.id) {
      await this.cloudinary.deleteImage(current.input).catch(() => {
        throw new ConflictException('Could not delete image');
      });

      progress = await this.prisma.progress.update({
        where: {
          id: current.id,
        },
        data: {
          char: current.char,
          completed: true,
          accuracy,
          noOfTry: {
            increment: 1,
          },
          input: image.url,
        },
      });
    } else {
      progress = await this.prisma.progress.create({
        data: {
          char: current.char,
          userId: data.loggedUser.id,
          completed: true,
          accuracy,
          input: image.url,
          noOfTry: 1,
        },
      });
    }

    return progress;
  }

  async getAllProgress(data: LoggedUser) {
    const progress = await this.prisma.progress.findMany({
      where: {
        userId: data.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return progress;
  }

  async resetAllProgress(data: LoggedUser) {
    const progress = await this.prisma.progress.findMany({
      where: {
        userId: data.id,
      },
    });

    for (const item of progress) {
      await this.cloudinary.deleteImage(item.input).catch(() => {
        throw new ConflictException('Could not delete image');
      });
    }

    await this.prisma.progress.deleteMany({
      where: {
        userId: data.id,
      },
    });

    return {
      message: 'All progress deleted',
    };
  }
}
