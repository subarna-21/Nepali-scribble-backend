import { ConflictException, Injectable } from '@nestjs/common';
import {
  DeleteApiResponse,
  UploadApiErrorResponse,
  UploadApiResponse,
  v2,
} from 'cloudinary';
import * as toStream from 'buffer-to-stream';
import sharp from 'sharp';
import { extractPublicId } from 'cloudinary-build-url';
@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
    compress: boolean = false,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    try {
      if (compress) {
        const compressor = sharp(file.buffer);

        file.buffer = await compressor
          .toFormat('jpeg', {
            quality: 40,
            progressive: true,
          })
          .toBuffer();
        file.mimetype = 'image/jpeg';
        file.originalname = file.filename + '.jpg';
      }
    } catch (_err) {
      throw new ConflictException('Could not compress image');
    }
    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream((error, result) => {
        if (error) return reject(error);
        resolve(result);
      });

      toStream(file.buffer).pipe(upload);
    });
  }

  async deleteImage(url: string): Promise<DeleteApiResponse> {
    const public_id = extractPublicId(url);

    console.log(public_id);
    return new Promise((resolve, reject) => {
      v2.uploader.destroy(public_id, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    });
  }
}
