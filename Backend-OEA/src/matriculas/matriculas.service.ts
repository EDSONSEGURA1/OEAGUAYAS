import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatriculaDto } from './dto/create-matricula.dto';

@Injectable()
export class MatriculasService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.matricula.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const matricula = await this.prisma.matricula.findUnique({ where: { id } });
    if (!matricula) {
      throw new NotFoundException(`No existe una matrícula con id ${id}`);
    }
    return matricula;
  }

  create(data: CreateMatriculaDto) {
    return this.prisma.matricula.create({
      data: {
        nombreEstudiante: data.nombreEstudiante,
        nivel: data.nivel,
        jornada: data.jornada,
        nombreRepresentante: data.nombreRepresentante,
        telefonoRepresentante: data.telefonoRepresentante,
        emailRepresentante: data.emailRepresentante,
        mensaje: data.mensaje,
      },
    });
  }

  async actualizarEstado(id: string, estado: string) {
    await this.findOne(id);
    return this.prisma.matricula.update({
      where: { id },
      data: { estado: estado as any },
    });
  }
}
