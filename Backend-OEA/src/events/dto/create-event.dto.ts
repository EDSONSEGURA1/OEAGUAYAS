import { IsDateString, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title: string;

  @IsString()
  @MinLength(3)
  @MaxLength(600)
  description: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
