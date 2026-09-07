import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MatriculasService } from './matriculas.service';
import { CreateMatriculaDto } from './dto/create-matricula.dto';
import { AdminApiKeyGuard } from './guards/admin-api-key.guard';

@Controller('matriculas')
export class MatriculasController {
  constructor(private readonly matriculasService: MatriculasService) {}

  @Get()
  @UseGuards(AdminApiKeyGuard)
  findAll() {
    return this.matriculasService.findAll();
  }

  @Get(':id')
  @UseGuards(AdminApiKeyGuard)
  findOne(@Param('id') id: string) {
    return this.matriculasService.findOne(id);
  }

  // Usado por el formulario público de matriculacion.html
  @Post()
  create(@Body() createMatriculaDto: CreateMatriculaDto) {
    return this.matriculasService.create(createMatriculaDto);
  }

  @Patch(':id/estado')
  @UseGuards(AdminApiKeyGuard)
  actualizarEstado(@Param('id') id: string, @Body('estado') estado: string) {
    return this.matriculasService.actualizarEstado(id, estado);
  }
}
