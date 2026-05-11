import * as fs from 'fs';
import * as path from 'path';
import { prisma } from '../database/repositories';

type LinhaPlanilha = Record<string, string>;

const TRIMESTRES_ALVO = ['1T24', '2T24', '3T24', '4T24', '1T25', '2T25', '3T25', '4T25'] as const;

const DATA_TRIMESTRE: Record<(typeof TRIMESTRES_ALVO)[number], string> = {
  '1T24': '2024-01-01',
  '2T24': '2024-04-01',
  '3T24': '2024-07-01',
  '4T24': '2024-10-01',
  '1T25': '2025-01-01',
  '2T25': '2025-04-01',
  '3T25': '2025-07-01',
  '4T25': '2025-10-01',
};

const DATA_TRIMESTRE_LEGADO: Record<(typeof TRIMESTRES_ALVO)[number], string> = {
  '1T24': '2024-03-31',
  '2T24': '2024-06-30',
  '3T24': '2024-09-30',
  '4T24': '2024-12-31',
  '1T25': '2025-03-31',
  '2T25': '2025-06-30',
  '3T25': '2025-09-30',
  '4T25': '2025-12-31',
};

interface ResultadoImportacao {
  totalLinhas: number;
  empresasCriadas: number;
  empresasExistentes: number;
  trimestresInseridos: number;
  trimestresAtualizados: number;
  trimestresIgnoradosSemValor: number;
  trimestresJaPreenchidos: number;
  trimestresLegadoRemovidos: number;
}

function parseNumeroPtBr(valor: unknown): number | null {
  if (valor === null || valor === undefined) return null;

  const texto = String(valor).trim();
  if (!texto || texto === '-') return null;

  const normalizado = texto
    .replace(/\./g, '')
    .replace(',', '.');

  const numero = Number(normalizado);
  return Number.isFinite(numero) ? numero : null;
}

async function importarHistorico() {
  const arquivo = path.join(process.cwd(), 'Planilha sem título - Página1.json');

  if (!fs.existsSync(arquivo)) {
    throw new Error('Arquivo Planilha sem título - Página1.json não encontrado na raiz.');
  }

  const conteudo = fs.readFileSync(arquivo, 'utf-8').replace(/^\uFEFF/, '');
  const linhas = JSON.parse(conteudo) as LinhaPlanilha[];

  if (!Array.isArray(linhas)) {
    throw new Error('JSON inválido: era esperado um array.');
  }

  const resultado: ResultadoImportacao = {
    totalLinhas: linhas.length,
    empresasCriadas: 0,
    empresasExistentes: 0,
    trimestresInseridos: 0,
    trimestresAtualizados: 0,
    trimestresIgnoradosSemValor: 0,
    trimestresJaPreenchidos: 0,
    trimestresLegadoRemovidos: 0,
  };

  for (const linha of linhas) {
    const codigo = String(linha['EMPRESA'] || '').trim().toUpperCase();
    if (!codigo) continue;

    let empresa = await prisma.empresa.findUnique({ where: { codigo } });

    if (!empresa) {
      empresa = await prisma.empresa.create({
        data: {
          codigo,
          nome: codigo,
          ativo: true,
        },
      });
      resultado.empresasCriadas++;
    } else {
      resultado.empresasExistentes++;
    }

    for (const chaveTrimestre of TRIMESTRES_ALVO) {
      const receita3m = parseNumeroPtBr(linha[chaveTrimestre]);

      if (receita3m === null) {
        resultado.trimestresIgnoradosSemValor++;
        continue;
      }

      const dataBalanco = DATA_TRIMESTRE[chaveTrimestre];
      const dataBalancoLegado = DATA_TRIMESTRE_LEGADO[chaveTrimestre];

      const existente = await prisma.dadosTrimestral.findUnique({
        where: {
          empresaId_dataBalanco: {
            empresaId: empresa.id,
            dataBalanco,
          },
        },
      });

      if (!existente) {
        await prisma.dadosTrimestral.create({
          data: {
            empresaId: empresa.id,
            dataBalanco,
            receitaLiquida3m: receita3m,
          },
        });
        resultado.trimestresInseridos++;
      } else if (existente.receitaLiquida3m === null || existente.receitaLiquida3m === undefined) {
        await prisma.dadosTrimestral.update({
          where: {
            empresaId_dataBalanco: {
              empresaId: empresa.id,
              dataBalanco,
            },
          },
          data: {
            receitaLiquida3m: receita3m,
          },
        });
        resultado.trimestresAtualizados++;
      } else {
        resultado.trimestresJaPreenchidos++;
      }

      // Limpa linha legada importada no campo incorreto (lucroLiquido12m no fim do trimestre).
      const legado = await prisma.dadosTrimestral.findUnique({
        where: {
          empresaId_dataBalanco: {
            empresaId: empresa.id,
            dataBalanco: dataBalancoLegado,
          },
        },
      });

      const legadoEImportacaoAntiga =
        !!legado &&
        legado.dataBalanco !== dataBalanco &&
        legado.receitaLiquida3m === null &&
        legado.ebit3m === null &&
        legado.lucroLiquido3m === null &&
        legado.receitaLiquida12m === null &&
        legado.ebit12m === null &&
        legado.lucroLiquido12m !== null &&
        legado.lucroLiquido12m === receita3m;

      if (legadoEImportacaoAntiga) {
        await prisma.dadosTrimestral.delete({
          where: {
            empresaId_dataBalanco: {
              empresaId: empresa.id,
              dataBalanco: dataBalancoLegado,
            },
          },
        });
        resultado.trimestresLegadoRemovidos++;
      }
    }
  }

  return resultado;
}

async function main() {
  try {
    console.log('Iniciando importacao de historico trimestral (1T24 a 4T25) em receitaLiquida3m...');
    const resultado = await importarHistorico();

    console.log('\nResumo:');
    console.log(`- Linhas no JSON: ${resultado.totalLinhas}`);
    console.log(`- Empresas criadas: ${resultado.empresasCriadas}`);
    console.log(`- Empresas ja existentes: ${resultado.empresasExistentes}`);
    console.log(`- Trimestres inseridos: ${resultado.trimestresInseridos}`);
    console.log(`- Trimestres atualizados (estavam nulos): ${resultado.trimestresAtualizados}`);
    console.log(`- Trimestres ja preenchidos: ${resultado.trimestresJaPreenchidos}`);
    console.log(`- Trimestres ignorados sem valor: ${resultado.trimestresIgnoradosSemValor}`);
    console.log(`- Trimestres legados removidos (importacao antiga): ${resultado.trimestresLegadoRemovidos}`);
  } catch (error: any) {
    console.error('Erro na importacao:', error?.message || error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
