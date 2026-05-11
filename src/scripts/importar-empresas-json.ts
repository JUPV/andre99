import { prisma } from '../database/prisma';
import * as fs from 'fs';
import * as path from 'path';

interface EmpresaPlanilha {
  EMPRESA: string;
  [key: string]: any;
}

async function importarEmpresasDoJSON() {
  console.log('🚀 Importando empresas do JSON...\n');

  try {
    // Lê o arquivo JSON
    const jsonPath = path.join(process.cwd(), 'Planilha sem título - Página1.json');
    let jsonContent = fs.readFileSync(jsonPath, 'utf-8');

    // Remove BOM se existir
    if (jsonContent.charCodeAt(0) === 0xFEFF) {
      jsonContent = jsonContent.slice(1);
    }

    const empresas: EmpresaPlanilha[] = JSON.parse(jsonContent);

    console.log(`📊 ${empresas.length} empresas encontradas no arquivo\n`);

    let cadastradas = 0;
    let jaExistiam = 0;
    let erros = 0;

    for (const item of empresas) {
      const codigo = item.EMPRESA?.trim();

      if (!codigo) {
        console.log(`⚠️  Empresa sem código, pulando...`);
        erros++;
        continue;
      }

      try {
        // Verifica se já existe
        const empresaExistente = await prisma.empresa.findUnique({
          where: { codigo }
        });

        if (empresaExistente) {
          console.log(`⏭️  ${codigo} - Já existe`);
          jaExistiam++;
        } else {
          // Cria nova empresa
          await prisma.empresa.create({
            data: {
              codigo,
              nome: codigo, // Por enquanto usa o código como nome
              ativo: true
            }
          });
          console.log(`✅ ${codigo} - Cadastrada`);
          cadastradas++;
        }
      } catch (error: any) {
        console.error(`❌ ${codigo} - Erro: ${error.message}`);
        erros++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('RESUMO DA IMPORTAÇÃO');
    console.log('='.repeat(50));
    console.log(`Total de empresas:     ${empresas.length}`);
    console.log(`✅ Cadastradas:        ${cadastradas}`);
    console.log(`⏭️  Já existiam:        ${jaExistiam}`);
    console.log(`❌ Erros:              ${erros}`);
    console.log('='.repeat(50));

  } catch (error: any) {
    console.error('\n❌ Erro fatal:', error.message);
    throw error;
  }
}

// Execução
if (require.main === module) {
  importarEmpresasDoJSON()
    .then(() => {
      console.log('\n✅ Script finalizado!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erro fatal:', error);
      process.exit(1);
    });
}

export { importarEmpresasDoJSON };
