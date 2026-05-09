# ⚙️ Services - Serviços de Negócio

## 📌 Propósito

Esta pasta contém a **lógica de negócio** do sistema, incluindo automação e orquestração de tarefas.

## 📁 Arquivos

### `coleta-automatica.ts`
- **Função**: Sistema de coleta automática com agendamento
- **Tecnologia**: node-cron
- **Status**: Inicia automaticamente quando o servidor sobe

## 🕒 Agendamentos Configurados

### 1. **Coleta Diária** (9h e 18h)
```typescript
cron.schedule('0 9,18 * * *', coletarDadosDiarios);
```

**O que faz:**
- Coleta cotações e indicadores diários
- Roda para TODAS as empresas ativas
- Horários: Após abertura (9h) e após fechamento (18h) da bolsa
- Duração: ~15 minutos para 100 empresas (com delay de 10s)

**Dados coletados:**
- Cotação da ação
- P/L (Preço/Lucro)
- EV/EBITDA
- Valor de Mercado
- ROE, ROIC
- Dividend Yield

### 2. **Verificação Trimestral** (A cada 3 horas)
```typescript
cron.schedule('0 */3 * * *', verificarEColetarTrimestrais);
```

**O que faz:**
- Verifica se há novos balanços trimestrais
- **Retry inteligente**: Tenta a cada 3h até conseguir
- Para quando encontra dados novos
- Resume no próximo trimestre

**Dados coletados:**
- Receita Líquida (3M e 12M)
- EBIT (3M e 12M)
- Lucro Líquido (3M e 12M)
- Data do balanço

## 🧠 Lógica de Retry

### Trimestral (3 horas)
```typescript
const ultimoLog = await logColetaRepository.buscarUltimo(empresa.id, 'trimestral');
const horasDesdeUltimaTentativa = (Date.now() - new Date(ultimoLog.tentativaEm).getTime()) / (1000 * 60 * 60);

if (horasDesdeUltimaTentativa >= 3) {
  // Tentar coletar novamente
}
```

**Por que 3 horas?**
- Balanços podem demorar para serem publicados
- Evita spam ao site
- Garante que pegamos dados assim que disponíveis

### Diária (1 dia)
```typescript
const ultimoDiario = await dadosDiariosRepository.buscarUltimo(empresa.id);
const dataUltimo = new Date(ultimoDiario.data);
const hoje = new Date().toISOString().split('T')[0];

if (dataUltimo < hoje) {
  // Coletar dados de hoje
}
```

## 🔄 Fluxo de Execução

### Coleta Diária
```
1. Listar todas empresas ativas
2. Para cada empresa:
   a. Verificar se já coletou hoje
   b. Se não: coletar dados
   c. Aguardar 10 segundos
   d. Próxima empresa
3. Registrar logs
```

### Verificação Trimestral
```
1. Listar empresas ativas
2. Para cada empresa:
   a. Buscar último log de coleta trimestral
   b. Verificar se passaram 3+ horas
   c. Se sim: tentar coletar
   d. Se sucesso: registrar e parar até próximo trimestre
   e. Se erro: registrar e tentar daqui 3h
3. Aguardar próximo ciclo (3h)
```

## ⏱️ Delays e Performance

### Delay entre empresas: 10 segundos
```typescript
const DELAY_ENTRE_COLETAS = 10000;
await new Promise(resolve => setTimeout(resolve, DELAY_ENTRE_COLETAS));
```

**Por quê?**
- Evita bloqueio de IP pelo site
- Respeita os recursos do servidor
- 10s é tempo ideal: não é lento, não é spam

### Tempo estimado
- 100 empresas × 10s = ~16 minutos
- 200 empresas × 10s = ~33 minutos

## 📊 Logs Gerados

Cada coleta gera um registro em `LogColeta`:

```typescript
{
  empresaId: number,
  tipoColeta: 'diaria' | 'trimestral',
  status: 'sucesso' | 'erro' | 'sem_dados',
  mensagem: string,
  dataReferencia: string,
  tentativaEm: DateTime
}
```

**Status:**
- **sucesso**: Dados coletados e salvos
- **erro**: Erro na coleta (site fora, timeout, etc)
- **sem_dados**: Site não retornou dados (empresa suspensa, etc)

## 🚦 Controle de Estado

### Empresas Ativas
Apenas empresas com `ativo = true` são coletadas:

```typescript
const empresasAtivas = await empresaRepository.listarTodas();
const ativas = empresasAtivas.filter(e => e.ativo);
```

Para desativar coleta de uma empresa:
```typescript
await empresaRepository.toggleAtivo(empresaId);
```

## 🛠️ Inicialização

O serviço inicia automaticamente quando o servidor sobe:

```typescript
// src/index.ts
import { iniciarColetaAutomatica } from './services/coleta-automatica';

app.listen(PORT, () => {
  console.log('🚀 Servidor rodando');
  iniciarColetaAutomatica(); // ← Inicia os cron jobs
});
```

## 🔧 Desabilitar Coleta Automática

Para desabilitar temporariamente:

```typescript
// src/index.ts
// iniciarColetaAutomatica(); // ← Comentar esta linha
```

Ou criar variável de ambiente:
```typescript
if (process.env.ENABLE_AUTO_COLLECT === 'true') {
  iniciarColetaAutomatica();
}
```

## ⚠️ Considerações

### 1. **Servidor deve ficar sempre ligado**
Cron jobs só rodam enquanto o servidor está ativo.

### 2. **Timezone**
Cron usa timezone do servidor. Certifique-se que está correto:
```typescript
cron.schedule('0 9 * * *', task, {
  timezone: 'America/Sao_Paulo'
});
```

### 3. **Rate Limiting**
Se o site bloquear:
- Aumentar delay para 15s
- Usar proxy/VPN
- Reduzir horários de coleta

### 4. **Logs crescem com o tempo**
Considere limpar logs antigos periodicamente:
```sql
DELETE FROM log_coleta WHERE tentativa_em < NOW() - INTERVAL '30 days';
```

## 📈 Monitoramento

Ver status das coletas:
```
http://localhost:3000/status-coletas.html
```

Ver logs via API:
```
GET /api/coleta/logs
```

## 🧪 Testes Manuais

Testar coleta de uma empresa:
```bash
npm run scrape PETR4
```

Testar coleta de todas:
```bash
npm run coletar
```

## 🚀 Melhorias Futuras

- [ ] Notificações por email quando dados novos chegarem
- [ ] Dashboard de monitoramento em tempo real
- [ ] Coleta paralela (múltiplas empresas ao mesmo tempo)
- [ ] Detecção automática de quando balanços são publicados
- [ ] Sistema de prioridade (empresas mais importantes coletadas primeiro)
- [ ] Webhook para integração com outros sistemas

## 📦 Dependências

```json
{
  "node-cron": "^3.0.3",
  "@types/node-cron": "^3.0.11"
}
```

## 🔗 Integrações

- **Scrapers**: Usa `fundamentus-scraper.ts` para coletar
- **Database**: Usa repositories para salvar
- **API**: Endpoint `/api/coleta/executar` para coleta manual
