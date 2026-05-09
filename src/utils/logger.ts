import fs from 'fs';
import path from 'path';

// Diretório de logs
const LOG_DIR = path.join(process.cwd(), 'logs');

// Criar diretório se não existir
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Tipos de log
export type TipoLog = 'info' | 'success' | 'warning' | 'error';

interface LogEntry {
  timestamp: string;
  tipo: TipoLog;
  modulo: string;
  mensagem: string;
  detalhes?: any;
}

// Função para formatar data
function formatarData(): string {
  const agora = new Date();
  return agora.toISOString();
}

// Função para formatar data do arquivo (yyyy-mm-dd)
function formatarDataArquivo(): string {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

// Função principal de log
export function log(tipo: TipoLog, modulo: string, mensagem: string, detalhes?: any) {
  const entry: LogEntry = {
    timestamp: formatarData(),
    tipo,
    modulo,
    mensagem,
    detalhes
  };

  // Log no console com cores
  const cores: Record<TipoLog, string> = {
    info: '\x1b[36m',    // Ciano
    success: '\x1b[32m', // Verde
    warning: '\x1b[33m', // Amarelo
    error: '\x1b[31m'    // Vermelho
  };

  const reset = '\x1b[0m';
  const cor = cores[tipo];

  console.log(`${cor}[${tipo.toUpperCase()}]${reset} [${modulo}] ${mensagem}`);

  if (detalhes) {
    console.log('  Detalhes:', detalhes);
  }

  // Salvar em arquivo
  try {
    const nomeArquivo = `sistema-${formatarDataArquivo()}.log`;
    const caminhoArquivo = path.join(LOG_DIR, nomeArquivo);

    const linha = JSON.stringify(entry) + '\n';
    fs.appendFileSync(caminhoArquivo, linha, 'utf8');
  } catch (error) {
    console.error('Erro ao salvar log:', error);
  }
}

// Funções helper
export const logger = {
  info: (modulo: string, mensagem: string, detalhes?: any) => log('info', modulo, mensagem, detalhes),
  success: (modulo: string, mensagem: string, detalhes?: any) => log('success', modulo, mensagem, detalhes),
  warning: (modulo: string, mensagem: string, detalhes?: any) => log('warning', modulo, mensagem, detalhes),
  error: (modulo: string, mensagem: string, detalhes?: any) => log('error', modulo, mensagem, detalhes),
};

// Função para ler logs
export function lerLogs(dataInicio?: Date, dataFim?: Date, tipo?: TipoLog): LogEntry[] {
  try {
    const arquivos = fs.readdirSync(LOG_DIR).filter(f => f.endsWith('.log')).sort().reverse();
    const logs: LogEntry[] = [];

    // Limitar aos últimos 7 dias para performance
    const arquivosRecentes = arquivos.slice(0, 7);

    for (const arquivo of arquivosRecentes) {
      const conteudo = fs.readFileSync(path.join(LOG_DIR, arquivo), 'utf8');
      const linhas = conteudo.split('\n').filter(l => l.trim());

      for (const linha of linhas) {
        try {
          const entry: LogEntry = JSON.parse(linha);

          // Filtros
          if (tipo && entry.tipo !== tipo) continue;

          const entryDate = new Date(entry.timestamp);
          if (dataInicio && entryDate < dataInicio) continue;
          if (dataFim && entryDate > dataFim) continue;

          logs.push(entry);
        } catch (e) {
          // Linha inválida, ignorar
        }
      }
    }

    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    console.error('Erro ao ler logs:', error);
    return [];
  }
}

// Função para obter estatísticas
export function obterEstatisticas(): {
  total: number;
  porTipo: Record<TipoLog, number>;
  ultimasHoras: Record<TipoLog, number>;
} {
  const logs = lerLogs();
  const agora = new Date();
  const umaDiaAtras = new Date(agora.getTime() - 24 * 60 * 60 * 1000);

  const stats = {
    total: logs.length,
    porTipo: {
      info: 0,
      success: 0,
      warning: 0,
      error: 0
    } as Record<TipoLog, number>,
    ultimasHoras: {
      info: 0,
      success: 0,
      warning: 0,
      error: 0
    } as Record<TipoLog, number>
  };

  for (const entry of logs) {
    stats.porTipo[entry.tipo]++;

    const entryDate = new Date(entry.timestamp);
    if (entryDate >= umaDiaAtras) {
      stats.ultimasHoras[entry.tipo]++;
    }
  }

  return stats;
}

// Função para limpar logs antigos (manter últimos 30 dias)
export function limparLogsAntigos() {
  try {
    const arquivos = fs.readdirSync(LOG_DIR).filter(f => f.endsWith('.log'));
    const agora = new Date();
    const trintaDiasAtras = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);

    for (const arquivo of arquivos) {
      const match = arquivo.match(/sistema-(\d{4}-\d{2}-\d{2})\.log/);
      if (match) {
        const dataArquivo = new Date(match[1]);
        if (dataArquivo < trintaDiasAtras) {
          fs.unlinkSync(path.join(LOG_DIR, arquivo));
          logger.info('LOGGER', `Log antigo removido: ${arquivo}`);
        }
      }
    }
  } catch (error) {
    logger.error('LOGGER', 'Erro ao limpar logs antigos', error);
  }
}
