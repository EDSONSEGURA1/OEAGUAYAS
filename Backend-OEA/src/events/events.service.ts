import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.evento.findMany({
      orderBy: { date: 'asc' },
    });
  }

  async findOne(id: string) {
    const evento = await this.prisma.evento.findUnique({ where: { id } });
    if (!evento) {
      throw new NotFoundException(`No existe un evento con id ${id}`);
    }
    return evento;
  }

  create(data: CreateEventDto) {
    return this.prisma.evento.create({
      data: {
        title: data.title,
        description: data.description,
        date: new Date(data.date),
        imageUrl: data.imageUrl,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.evento.delete({ where: { id } });
  }
}
