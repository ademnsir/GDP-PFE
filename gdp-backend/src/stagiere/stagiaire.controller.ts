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
  import { createImageUploadInterceptor } from '../common/utils/file-upload.util';
  
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
    @UseInterceptors(createImageUploadInterceptor('photo'))
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
  