-- CreateEnum
CREATE TYPE "NivelEducativo" AS ENUM ('INICIAL', 'BASICA', 'BACHILLERATO');

-- CreateEnum
CREATE TYPE "JornadaEstudio" AS ENUM ('MATUTINA', 'VESPERTINA');

-- CreateEnum
CREATE TYPE "EstadoMatricula" AS ENUM ('PENDIENTE', 'CONTACTADO', 'MATRICULADO', 'DESCARTADO');

-- CreateTable
CREATE TABLE "eventos" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matriculas" (
    "id" TEXT NOT NULL,
    "nombreEstudiante" TEXT NOT NULL,
    "nivel" "NivelEducativo" NOT NULL,
    "jornada" "JornadaEstudio" NOT NULL,
    "nombreRepresentante" TEXT NOT NULL,
    "telefonoRepresentante" TEXT NOT NULL,
    "emailRepresentante" TEXT,
    "mensaje" TEXT,
    "estado" "EstadoMatricula" NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matriculas_pkey" PRIMARY KEY ("id")
);
