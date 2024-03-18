import { ConflictException, Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/global/cloudinary/cloudinary.service';
import { PrismaService } from 'src/global/prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  get(data: LoggedUser) {
    return this.prisma.user.findUnique({
      where: {
        id: data.id,
      },
    });
  }

  async upload(data: UpdateParam<Express.Multer.File>) {
    const upload = await this.cloudinary
      .uploadImage(data.postData)
      .catch(() => {
        throw new ConflictException('Could not upload image');
      });

    if (data.loggedUser.image) {
      await this.cloudinary.deleteImage(data.loggedUser.image).catch(() => {
        throw new ConflictException('Could not delete image');
      });
    }

    const profile = await this.prisma.user.update({
      where: {
        id: data.loggedUser.id,
      },
      data: {
        image: upload.url,
      },
    });

    return profile;
  }
}
