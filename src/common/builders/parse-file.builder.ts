import { HttpStatus, ParseFilePipeBuilder } from '@nestjs/common';
import { FileValidator } from '@nestjs/common';

export const MAX_IMAGE_SIZE = 5.4 * 1024 * 1024;

export const mimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export class UploadFileTypeValidator extends FileValidator {
  private allowedMimeTypes: string[];

  constructor() {
    const types = mimeTypes;
    super({
      fileType: types,
    });
    this.allowedMimeTypes = mimeTypes;
  }

  public isValid(
    file?: Express.Multer.File | undefined,
  ): boolean | Promise<boolean> {
    if (!file?.buffer) return false;

    if (!this.allowedMimeTypes.includes(file.mimetype)) return false;

    return true;
  }

  public buildErrorMessage(): string {
    return `Upload not allowed. Allowed file types: ${this.allowedMimeTypes.map((i) => i.split('/')[1]).join(',')}`;
  }
}

export const createParseFilePipeBuiler = () => {
  return new ParseFilePipeBuilder()
    .addValidator(new UploadFileTypeValidator())
    .addMaxSizeValidator({
      maxSize: MAX_IMAGE_SIZE,
    })
    .build({
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    });
};
