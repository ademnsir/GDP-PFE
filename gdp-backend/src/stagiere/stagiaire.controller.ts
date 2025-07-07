import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    ParseIntPipe,
    UseInterceptors,
    UploadedFile,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { StagiaireService } from './stagiaire.service';
  import { CreateStagiaireDto, UpdateStagiaireDto } from './dto/stagiaire.dto';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { diskStorage } from 'multer';
  import { extname } from 'path';
  
  @Controller('stagiaires')
  export class StagiaireController {
    constructor(private readonly stagiaireService: StagiaireService) {}
  
    @Get('/all')
    findAll() {
      return this.stagiaireService.findAll();
    }
  
    @Get('/:id')
    findOne(@Param('id', ParseIntPipe) id: number) {
      return this.stagiaireService.findOne(id);
    }
  
    @Post('/add')
    @UseInterceptors(
      FileInterceptor('photo', {
        storage: diskStorage({
          destination: './uploads/photos',
          filename: (req, file, callback) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            callback(null, `${uniqueSuffix}${ext}`);
          },
        }),
        fileFilter: (req, file, callback) => {
          if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
            return callback(
              new HttpException('Seules les images JPG, JPEG et PNG sont autorisées', HttpStatus.BAD_REQUEST),
              false,
            );
          }
          callback(null, true);
        },
      }),
    )
    async create(
      @UploadedFile() file: Express.Multer.File,
      @Body() createStagiaireDto: CreateStagiaireDto,
    ) {
      try {
        if (file) {
          createStagiaireDto.photo = `/uploads/photos/${file.filename}`;
        }
  
        return await this.stagiaireService.create(createStagiaireDto);
      } catch (error) {
        throw new HttpException(
          'Erreur lors de la création du stagiaire',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  
    @Put('/update/:id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateStagiaireDto: UpdateStagiaireDto) {
      return this.stagiaireService.update(id, updateStagiaireDto);
    }
  
    @Delete('/remove/:id')
    delete(@Param('id', ParseIntPipe) id: number) {
      return this.stagiaireService.delete(id);
    }
  }
  