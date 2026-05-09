# 📄 Sistema de Logs e Relatórios

## 🎯 Visão Geral

Sistema completo de **monitoramento e logs** para rastrear todas as operações do sistema, identificar erros e gerar relatórios de saúde.

---

## 📊 Componentes

### 1. **Logger (src/utils/logger.ts)**
Sistema central de logs que salva em arquivos e console.

#### Tipos de Log
- 🔵 **INFO** - Informações gerais
- ✅ **SUCCESS** - Operações bem-sucedidas
- ⚠️ **WARNING** - Avisos (não críticos)
- ❌ **ERROR** - Erros que precisam atenção

#### Como Usar
```typescript
import { logger } from '../utils/logger';

// Logs simples
logger.info('MODULO', 'Mensagem de informação');
logger.success('MODULO', 'Operação concluída');
logger.warning('MODULO', 'Atenção necessária');
logger.error('MODULO', 'Erro detectado');

// Logs com detalhes
logger.success('COLETA', 'PETR4 atualizado', { 
  cotacao: 38.50,
  dataBalanco: '31/03/2026'
});
```

#### Armazenamento
- **Local**: `logs/sistema-YYYY-MM-DD.log`
- **Formato**: JSON (uma linha por log)
- **Retenção**: 30 dias (limpeza automática)
- **Console**: Colorido para fácil identificação

---

### 2. **API de Relatórios**

#### Endpoint: `GET /api/relatorios/logs`
Retorna logs do sistema com filtros.

**Parâmetros:**
- `tipo` (opcional): `info`, `success`, `warning`, `error`
- `limite` (opcional): Número de registros (padrão: 100)

**Exemplo:**
```bash
GET /api/relatorios/logs?tipo=error&limite=50
```

**Resposta:**
```json
{
  "logs": [
    {
      "timestamp": "2026-05-09T20:36:47.226Z",
      "tipo": "success",
      "modulo": "COLETA-AUTO",
      "mensagem": "PETR4: Cotação R$ 38.50",
      "detalhes": { "cotacao": 38.50 }
    }
  ],
  "total": 1
}
```

---

#### Endpoint: `GET /api/relatorios/estatisticas`
Estatísticas completas do sistema.

**Exemplo:**
```bash
GET /api/relatorios/estatisticas
```

**Resposta:**
```json
{
  "sistema": {
    "online": true,
    "versao": "1.0.0",
    "dataHora": "2026-05-09T20:36:38.211Z"
  },
  "banco": {
    "totalEmpresas": 106,
    "empresasAtivas": 103,
    "totalTrimestrais": 2450,
    "totalDiarios": 15830,
    "totalLogs": 1037
  },
  "coletas": {
    "porStatus": {
      "sucesso": 1025,
      "erro": 12,
      "dados_indisponiveis": 0
    },
    "ultimas24h": 1037,
    "errosUltimas24h": 0,
    "taxaSucesso": "100.0%"
  },
  "logs": {
    "sistema": {
      "total": 5843,
      "porTipo": {
        "info": 234,
        "success": 5240,
        "warning": 345,
        "error": 24
      },
      "ultimasHoras": {
        "info": 12,
        "success": 320,
        "warning": 5,
        "error": 0
      }
    }
  }
}
```

---

#### Endpoint: `GET /api/relatorios/saude`
Status de saúde do sistema (health check).

**Exemplo:**
```bash
GET /api/relatorios/saude
```

**Resposta:**
```json
{
  "status": "saudavel",  // "saudavel" | "atencao" | "critico"
  "timestamp": "2026-05-09T20:36:38.211Z",
  "metricas": {
    "coletasUltimas24h": 1037,
    "errosUltimas24h": 0,
    "taxaSucesso": "100.0%",
    "empresasSemDados": 3
  },
  "problemas": [
    "3 empresas ativas sem dados"
  ]
}
```

**Status:**
- ✅ **saudavel**: Sistema funcionando normalmente
- ⚠️ **atencao**: Taxa de erro entre 20-50% ou nenhuma coleta em 24h
- ❌ **critico**: Taxa de erro > 50% ou erro na verificação

---

### 3. **Interface Web (relatorios.html)**

#### URL
```
http://localhost:3000/relatorios.html
```

#### Funcionalidades

**🎯 Cards de Status:**
- Status do Sistema (Saudável/Atenção/Crítico)
- Total de Logs
- Erros nas últimas 24h
- Taxa de Sucesso

**📊 Estatísticas Detalhadas:**
- Banco de Dados (empresas, dados)
- Coletas (sucessos, erros, taxa)
- Logs do Sistema (por tipo)
- Últimas Coletas (tempo real)

**🔍 Filtros:**
- Tipo de Log (Info/Success/Warning/Error)
- Limite de Registros (50/100/200/500)

**📋 Tabela de Logs:**
- Timestamp formatado
- Tipo com ícone colorido
- Módulo de origem
- Mensagem descritiva
- Botão "Ver Detalhes" (quando disponível)

**🔄 Auto-atualização:**
- A página atualiza automaticamente a cada 30 segundos

---

## 🎨 Módulos com Logs

### SERVIDOR
- Inicialização do servidor
- Configuração de rotas
- Limpeza de logs antigos

```typescript
logger.success('SERVIDOR', 'Servidor iniciado na porta 3000', {
  urls: {
    dashboard: 'http://localhost:3000/dashboard.html',
    relatorios: 'http://localhost:3000/relatorios.html'
  }
});
```

---

### SISTEMA
- Início do serviço de coleta automática
- Agendamento de tarefas cron
- Tentativas de reinicialização

```typescript
logger.success('SISTEMA', 'Serviço de coleta automática iniciado', {
  agendamentos: ['9h diário', '18h diário', 'a cada 3h trimestral']
});
```

---

### CRON
- Execução de tarefas agendadas
- Horários programados (9h, 18h, 3h em 3h)

```typescript
logger.info('CRON', 'Executando coleta diária agendada (9h)');
```

---

### COLETA-AUTO
- Verificação de dados trimestrais
- Coleta de dados diários
- Resultados por empresa

```typescript
logger.success('COLETA-AUTO', 'PETR4: Dados trimestrais atualizados', { 
  dataBalanco: '31/03/2026' 
});

logger.success('COLETA-AUTO', 'PETR4: Cotação R$ 38.50');

logger.error('COLETA-AUTO', 'Erro ao coletar PETR4', { 
  erro: 'Timeout na requisição' 
});

logger.warning('COLETA-AUTO', 'PETR4: Dados trimestrais indisponíveis');

logger.info('COLETA-AUTO', 'Coleta diária concluída', { 
  total: 106, 
  sucessos: 103, 
  erros: 0, 
  jaColetados: 3 
});
```

---

### COLETA-MANUAL
- Execuções manuais via API
- Tipos de coleta solicitados

```typescript
logger.info('COLETA-MANUAL', 'Executando coleta manual: diario');
logger.success('COLETA-MANUAL', 'Coleta manual concluída com sucesso');
```

---

### LOGGER
- Remoção de logs antigos
- Erros no próprio sistema de logs

```typescript
logger.info('LOGGER', 'Log antigo removido: sistema-2026-04-09.log');
logger.error('LOGGER', 'Erro ao limpar logs antigos', error);
```

---

## 📁 Estrutura de Arquivos de Log

```
logs/
├── sistema-2026-05-09.log   ← Hoje
├── sistema-2026-05-08.log   ← Ontem
├── sistema-2026-05-07.log
└── ...
```

**Formato de cada linha:**
```json
{"timestamp":"2026-05-09T20:36:47.226Z","tipo":"success","modulo":"COLETA-AUTO","mensagem":"PETR4: Cotação R$ 38.50","detalhes":{"cotacao":38.50}}
```

---

## 🔧 Manutenção

### Limpeza Automática
O sistema remove logs com **mais de 30 dias** automaticamente ao iniciar.

### Limpeza Manual
```typescript
import { limparLogsAntigos } from './utils/logger';
limparLogsAntigos();
```

### Análise de Logs
Você pode usar ferramentas como `jq` para analisar:

```bash
# Linux/Mac (com jq instalado)
cat logs/sistema-2026-05-09.log | jq 'select(.tipo == "error")'

# PowerShell (Windows)
Get-Content logs/sistema-2026-05-09.log | ConvertFrom-Json | Where-Object tipo -eq "error"
```

---

## 🚨 Alertas e Monitoramento

### Status "Atenção"
O sistema entra em modo **atenção** quando:
- Taxa de erro entre 20-50%
- Nenhuma coleta nas últimas 24h
- Empresas ativas sem dados

### Status "Crítico"
O sistema entra em modo **crítico** quando:
- Taxa de erro > 50%
- Erro ao verificar saúde do sistema

---

## 📊 Casos de Uso

### 1. Verificar se o sistema está funcionando
```
Acessar: http://localhost:3000/relatorios.html
Ver: Card "Status do Sistema" (verde = ok)
```

### 2. Identificar empresas com erro na coleta
```
Filtrar por: Tipo = "Error"
Buscar por: "COLETA-AUTO" no módulo
Ver mensagens de erro
```

### 3. Acompanhar coleta em tempo real
```
Página atualiza a cada 30s automaticamente
Ver últimas coletas na seção "Últimas Coletas"
```

### 4. Auditoria de operações
```
Usar endpoint /api/relatorios/logs
Filtrar por data e tipo
Exportar dados para análise
```

---

## 🎯 Próximas Melhorias

- [ ] Notificações por email quando status "crítico"
- [ ] Exportação de relatórios em PDF
- [ ] Dashboard com gráficos de logs (Chart.js)
- [ ] Integração com ferramentas de monitoring (Grafana, Sentry)
- [ ] Alertas no Telegram/Discord
- [ ] Logs de performance (tempo de resposta)
- [ ] Compactação de logs antigos (.gz)

---

## ✅ Vantagens do Sistema

✅ **Rastreabilidade**: Todos os eventos são registrados  
✅ **Debugging**: Fácil identificar origem de erros  
✅ **Monitoramento**: Health check em tempo real  
✅ **Auditoria**: Histórico completo de operações  
✅ **Performance**: Logs em arquivo, sem impacto no banco  
✅ **Automático**: Limpeza e retenção gerenciadas  
✅ **Visual**: Interface web amigável  

---

**Criado em:** 09/05/2026  
**Versão:** 1.0.0  
**Status:** ✅ Totalmente funcional
