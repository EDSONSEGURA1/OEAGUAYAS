import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const titles = [
    'Feria de Ciencias 2026',
    'Campeonato interno de básquet',
    'Casa abierta de admisiones',
  ];

  await prisma.evento.deleteMany({
    where: { title: { in: titles } },
  });

  await prisma.evento.createMany({
    data: [
      {
        title: 'Feria de Ciencias 2026',
        description: 'Nuestros estudiantes de Bachillerato exponen proyectos de investigación aplicada.',
        date: new Date('2026-10-14'),
        imageUrl: 'img/escudo-oea.png',
      },
      {
        title: 'Campeonato interno de básquet',
        description: 'Jornada deportiva entre cursos de Básica y Bachillerato en las canchas del colegio.',
        date: new Date('2026-10-21'),
        imageUrl: 'img/escudo-oea.png',
      },
      {
        title: 'Casa abierta de admisiones',
        description: 'Espacio para que nuevas familias conozcan las instalaciones y la propuesta educativa OEA.',
        date: new Date('2026-11-04'),
        imageUrl: 'img/escudo-oea.png',
      },
    ],
  });
  console.log('Eventos de ejemplo creados.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
