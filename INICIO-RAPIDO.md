# 🚀 Guia de Início Rápido

## Instalação

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar banco de dados
```bash
# Gerar cliente Prisma
npm run db:generate

# Criar/atualizar tabelas no banco
npm run db:push
```

## Uso

### Coletar dados de empresas

#### Coletar empresas específicas:
```bash
npm run scrape PETR4 VALE3 ITUB4
```

#### Coletar todas as empresas ativas:
```bash
npm run scrape
```

### Visualizar dados

1. Inicie o servidor:
```bash
npm run dev
```

2. Acesse no navegador:
```
http://localhost:3000
```

## Funcionalidades

### ✨ Coleta Automática
- ✅ **Dados Diários**: Coleta automática às 9h e 18h (dias úteis)
- ✅ **Dados Trimestrais**: Verificação a cada 3 horas
- ✅ **Sistema Inteligente**: 
  - Verifica se dados já estão atualizados
  - Retenta após 3 horas se dados não disponíveis
  - Mantém histórico de todas as tentativas
  - Detecta quando novos trimestres são publicados

### Interface Web
- ✅ Cadastrar novas empresas
- ✅ Visualizar lista de empresas
- ✅ Ver detalhes de cada empresa
- ✅ Histórico diário de cotações
- ✅ Dados trimestrais (3m e 12m)
- ✅ Métricas: P/L, EV/EBITDA, ROE, ROIC, Div. Yield
- ✅ Logs de coleta automática

### API REST

**Empresas:**
- `GET /api/empresas` - Listar todas
- `GET /api/empresas/:codigo` - Buscar por código
- `POST /api/empresas` - Criar nova
- `PUT /api/empresas/:id` - Atualizar
- `DELETE /api/empresas/:id` - Deletar

**Dados:**
- `GET /api/empresas/:codigo/resumo` - Resumo completo
- `GET /api/empresas/:codigo/diarios` - Histórico diário
- `GET /api/empresas/:codigo/trimestrais` - Dados trimestrais

**Coleta Automática:**
- `POST /api/coleta/executar` - Executar coleta manual
  - Body: `{ "tipo": "diario" | "trimestral" | "ambos" }`
- `GET /api/coleta/logs` - Listar todos os logs
- `GET /api/coleta/logs/:codigo` - Logs de uma empresa específica

### Prisma Studio

Abra uma interface visual para gerenciar o banco:
```bash
npm run db:studio
```

## Estrutura do Banco de Dados

### Model: Empresa
- `id` - ID único
- `codigo` - Código da ação (ex: PETR4)
- `nome` - Nome da empresa
- `setor` - Setor econômico
- `subsetor` - Subsetor
- `ativo` - Status (true/false)

### Model: DadosTrimestral
- Receita Líquida (3m e 12m)
- EBIT (3m e 12m)
- Lucro Líquido (3m e 12m)
- Data do balanço

### Model: DadosDiario
- Cotação
- # Model: LogColeta
- Histórico de tentativas de coleta
- Status: sucesso, erro, dados_indisponiveis
- Tipo: diario ou trimestral
- Data de referência dos dados
- Mensagem de erro (se houver)

## Coleta Automática

O sistema roda automaticamente quando você inicia o servidor:

```bash
npm run dev
```

### Agendamentos:
- **09:00** - Coleta dados diários (após abertura da bolsa)
- **18:00** - Coleta dados diários (após fechamento)
- **A cada 3 horas** - Verifica e coleta dados trimestrais

### Lógica Inteligente:
1. Verifica se dados já estão atualizados
2. Se dados não disponíveis, aguarda 3 horas para retentar
3. Mantém histórico de todas as tentativas
4. Detecta automaticamente novos trimestres publicados

### Executar Coleta Manual:

Via API:
```bash
curl -X POST http://localhost:3000/api/coleta/executar \
- **Node-Cron** - Agendamento de tarefas

## Monitoramento

### Ver logs de coleta:
```bash
# Todos os logs
curl http://localhost:3000/api/coleta/logs

# Logs de uma empresa
curl http://localhost:3000/api/coleta/logs/PETR4
```

### Prisma Studio:
```bash
npm run db:studio
```

Acesse a tabela `logs_coleta` para ver histórico completo.

## Próximos Passos

- [ ] Exportar para Google Sheets
- [x] Coleta automática de dados
- [ ] Adicionar mais sites de dados
- [ ] Criar gráficos de evolução
- [ ] Adicionar alertas de preço
- [ ] Dashboard de monitoramento de coletas

##P/L
- EV/EBITDA
- ROE, ROIC
- Div. Yield
- Data da coleta

## Exemplo de Uso

```bash
# 1. Instalar e configurar
npm install
npm run db:generate
npm run db:push

# 2. Iniciar servidor
npm run dev

# 3. Coletar dados (em outro terminal)
npm run scrape PETR4 VALE3 ITUB4 BBDC4 ABEV3

# 4. Acessar http://localhost:3000
```

## Tecnologias

- **Node.js + TypeScript**
- **Prisma ORM** - Gerenciamento de banco de dados
- **SQLite** - Banco de dados local
- **Express** - Servidor HTTP
- **Cheerio** - Web scraping
- **Axios** - Cliente HTTP

## Próximos Passos

- [ ] Exportar para Google Sheets
- [ ] Adicionar mais sites de dados
- [ ] Agendar coletas automáticas
- [ ] Criar gráficos de evolução
- [ ] Adicionar alertas de preço
