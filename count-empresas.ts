import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const total = await prisma.empresa.count();
  console.log(`Total de empresas: ${total}`);

  const ativas = await prisma.empresa.count({ where: { ativo: true } });
  console.log(`Empresas ativas: ${ativas}`);

  const comDados = await prisma.empresa.count({
    where: {
      dadosTrimestrais: { some: {} }
    }
  });
  console.log(`Com dados trimestrais: ${comDados}`);

  // Listar primeiras 10 empresas
  const empresas = await prisma.empresa.findMany({
    take: 10,
    orderBy: { codigo: 'asc' }
  });

  console.log('\nPrimeiras 10 empresas:');
  empresas.forEach(emp => {
    console.log(`  ${emp.codigo} - ${emp.nome}`);
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
