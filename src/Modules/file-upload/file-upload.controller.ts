// src/Modules/file-upload/file-upload.controller.ts
import { FileUploadService } from './file-upload.service';
import {
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Files')
@Controller('files')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @ApiOperation({ summary: 'Subir imagen para un inhumado específico' })
  // @ApiBearerAuth()
  @Post('uploadImage/:inhumadoId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadInhumadoImage(
    @Param('inhumadoId', ParseIntPipe) inhumadoId: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 2000000,
            message: 'El tamaño de la imagen debe ser inferior a 2MB',
          }),
          new FileTypeValidator({
            fileType: /^(image\/jpeg|image\/png)$/,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.fileUploadService.uploadInhumadoImage(file, inhumadoId);
  }
}
