# Importação de Dados Trimestrais - Status Invest

## 📋 Visão Geral

Sistema para importar dados históricos trimestrais de empresas do Status Invest, incluindo:
- Receita Líquida (3 meses)
- Lucro Líquido (3 meses)
- Despesas
- Margens (Bruta, EBITDA, EBIT, Líquida)
- Ano e Trimestre

## 🚀 Como Usar

### Importar Todas as Empresas

```bash
npm run importar:statusinvest
```

Este comando vai:
1. Buscar todas as empresas ativas no banco de dados
2. Para cada empresa, buscar dados históricos no Status Invest
3. Salvar os dados trimestrais no banco
4. Registrar logs de sucesso/erro
5. Usar delays aleatórios (2-5s) entre requisições para evitar bloqueio

### Processo de Importação

O script irá:
- ✅ Processar ~220 empresas cadastradas
- ⏱️ Aguardar 2-5 segundos entre cada empresa (delay aleatório)
- 📊 Mostrar progresso em tempo real
- 💾 Salvar automaticamente no banco
- 📝 Registrar logs de todas as operações
- 🔄 Usar `upsert` para evitar duplicatas

**Tempo estimado**: ~15-20 minutos para 220 empresas

## 📊 Campos Salvos

Para cada trimestre de cada empresa, são salvos:

```typescript
{
  empresaId: number;          // ID da empresa no banco
  dataBalanco: string;        // Data do balanço (YYYY-MM-DD)
  ano: number;                // Ano do trimestre
  trimestre: number;          // Trimestre (1, 2, 3 ou 4)
  receitaLiquida3m: number;   // Receita líquida do trimestre
  lucroLiquido3m: number;     // Lucro líquido do trimestre
  despesas: number;           // Despesas do trimestre
  margemBruta: number;        // Margem bruta (%)
  margemEbitda: number;       // Margem EBITDA (%)
  margemEbit: number;         // Margem EBIT (%)
  margemLiquida: number;      // Margem líquida (%)
  coletadoEm: DateTime;       // Data/hora da coleta
}
```

## 📈 Relatório Final

Ao final da importação, você verá:

```
=======================================================
RELATÓRIO FINAL
=======================================================
✅ Empresas com sucesso:      180
⚠️  Empresas sem dados:        25
❌ Empresas com erro:         15
📈 Total de trimestres:       3600
⏱️  Tempo total:               18m 32s
=======================================================
```

## 🔍 Logs de Coleta

Todos os resultados são registrados na tabela `logs_coleta`:
- **Status**: `sucesso`, `erro`, ou `dados_indisponiveis`
- **Mensagem**: Detalhes do resultado
- **Data de referência**: Trimestre mais recente coletado

## 🛡️ Proteções Implementadas

### Rate Limiting
- Delay aleatório de 2-5 segundos entre empresas
- Headers HTTP realistas para evitar bloqueio
- Timeout de 15 segundos por requisição
- Detecção de rate limit (erro 429)

### Tratamento de Erros
- ✅ Empresa não encontrada (404)
- ✅ Rate limit atingido (429)
- ✅ Timeout de conexão
- ✅ Dados inválidos ou ausentes
- ✅ Erros de banco de dados

### Integridade de Dados
- **Upsert**: Atualiza se já existir, cria se não existir
- **Unique constraint**: `empresaId + dataBalanco` (evita duplicatas)
- **Validação**: Verifica se a resposta da API é válida

## 📁 Estrutura de Arquivos

```
src/
├── scrapers/
│   └── statusinvest-scraper.ts      # Scraper do Status Invest
└── scripts/
    └── importar-historico-statusinvest.ts  # Script de importação
```

## 🔧 API do Status Invest

**Endpoint**: `https://statusinvest.com.br/acao/getrevenue`

**Parâmetros**:
- `code`: Código da ação (ex: PETR4, VALE3)
- `type`: 0 (trimestral)
- `viewType`: 1 (formato JSON)

**Exemplo**:
```
https://statusinvest.com.br/acao/getrevenue?code=PETR4&type=0&viewType=1
```

## 📝 Exemplo de Saída do Console

```
==========================================================
IMPORTAÇÃO DE DADOS TRIMESTRAIS - STATUS INVEST
==========================================================
Início: 11/05/2026 15:30:45

📊 Total de empresas a processar: 220

[1/220] Processando AERI3...
========================================
Processando: AERI3 - Aeris Energy
========================================
[StatusInvest] Buscando dados de AERI3...
[StatusInvest] AERI3: 20 trimestres encontrados
✅ Sucesso: 20 trimestres importados
[Delay] Aguardando 3245ms...

[2/220] Processando PETR4...
========================================
Processando: PETR4 - Petrobras
========================================
[StatusInvest] Buscando dados de PETR4...
[StatusInvest] PETR4: 40 trimestres encontrados
✅ Sucesso: 40 trimestres importados
[Delay] Aguardando 4112ms...

...
```

## ⚠️ Observações Importantes

1. **Banco de dados resetado**: Durante a migração, o banco foi resetado. Você precisará reimportar as empresas antes de rodar este script.

2. **Empresas ativas**: O script só processa empresas com `ativo = true`

3. **Dados históricos**: O Status Invest pode retornar dados de vários anos (normalmente 5+ anos)

4. **Delay obrigatório**: Sempre use delays entre requisições para evitar bloqueio permanente

5. **Verificar logs**: Sempre confira os logs de coleta após a importação para identificar problemas

## 🎯 Próximos Passos

Após a importação, você pode:

1. **Ver os dados no Prisma Studio**:
   ```bash
   npm run db:studio
   ```

2. **Criar endpoints de API** para consultar os dados

3. **Criar dashboards** para visualizar as métricas

4. **Calcular indicadores** adicionais (crescimento, médias, etc)

5. **Automatizar atualizações** trimestrais (executar após divulgação de balanços)

## 🆘 Troubleshooting

### Erro: "Empresa não encontrada"
- Verifique se o código da ação está correto
- Algumas empresas podem não estar no Status Invest

### Erro: "Rate limit atingido"
- Aumente o delay entre requisições
- Aguarde alguns minutos e tente novamente

### Dados não aparecem
- Verifique a tabela `logs_coleta` para ver o que aconteceu
- Use o Prisma Studio para inspecionar os dados

### Script travou
- Pressione `Ctrl+C` para cancelar
- O progresso já realizado foi salvo no banco
- Pode executar novamente (usará upsert, não duplicará)
