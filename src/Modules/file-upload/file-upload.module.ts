// src/Modules/file-upload/file-upload.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';
import { Inhumado } from '../../Entities/inhumados.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Inhumado])],
  controllers: [FileUploadController],
  providers: [FileUploadService],
  exports: [FileUploadService],
})
export class FileUploadModule {}
