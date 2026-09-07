import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export enum NivelEducativoDto {
  INICIAL = 'INICIAL',
  BASICA = 'BASICA',
  BACHILLERATO = 'BACHILLERATO',
}

export enum JornadaEstudioDto {
  MATUTINA = 'MATUTINA',
  VESPERTINA = 'VESPERTINA',
}

export class CreateMatriculaDto {
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  nombreEstudiante: string;

  @IsEnum(NivelEducativoDto)
  nivel: NivelEducativoDto;

  @IsEnum(JornadaEstudioDto)
  jornada: JornadaEstudioDto;

  @IsString()
  @MinLength(3)
  @MaxLength(150)
  nombreRepresentante: string;

  @IsString()
  @MinLength(7)
  @MaxLength(20)
  telefonoRepresentante: string;

  @IsOptional()
  @IsEmail()
  emailRepresentante?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  mensaje?: string;
}
