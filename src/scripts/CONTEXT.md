# 📜 Scripts - Utilitários e Automações

## 📌 Propósito

Esta pasta contém **scripts utilitários** para tarefas administrativas, importação em massa e manutenção.

## 📁 Arquivos

### `importar-empresas.ts`
- **Função**: Importação em massa de empresas do arquivo `empresa.json`
- **Uso**: `npm run importar` ou `npm run importar -- --coletar`
- **Duração**: 
  - Modo rápido (só cadastro): ~1s por empresa
  - Modo completo (com coleta): ~10s por empresa

### `coletar-todas.ts`
- **Função**: Coleta manual de dados de todas as empresas cadastradas
- **Uso**: `npm run coletar`
- **Duração**: ~10s por empresa

## 🚀 Como Usar

### Importação em Massa

#### Modo 1: Apenas Cadastro (Rápido)
```bash
npm run importar
```

**O que faz:**
- Lê o arquivo `empresa.json`
- Cadastra empresas no banco
- NÃO coleta dados do site
- Delay: 100ms entre cada empresa
- Útil para: Cadastro rápido de muitas empresas

#### Modo 2: Cadastro + Coleta (Completo)
```bash
npm run importar -- --coletar
```

**O que faz:**
- Lê o arquivo `empresa.json`
- Cadastra empresas no banco
- **Coleta dados do site Fundamentus**
- Delay: 10 segundos entre cada empresa
- Útil para: Primeira importação ou atualização completa

**Tempo estimado:**
- 100 empresas: ~16 minutos
- 200 empresas: ~33 minutos

### Coleta Manual

```bash
npm run coletar
```

**O que faz:**
- Busca todas as empresas ativas
- Coleta dados trimestrais e diários
- Delay: 10 segundos entre empresas
- Registra logs de sucesso/erro

## 📊 Arquivo `empresa.json`

**Localização**: Raiz do projeto (`empresa.json`)

**Formato:**
```json
[
  {
    "ticker": "PETR4",
    "nome": "PETROBRAS PN",
    "setor": "Petróleo, Gás e Biocombustíveis",
    "subsetor": "Exploração, Refino e Distribuição"
  },
  {
    "ticker": "VALE3",
    "nome": "VALE ON",
    "setor": "Mineração",
    "subsetor": "Minerais Metálicos"
  }
]
```

**Campos:**
- `ticker` → Código da ação (ex: PETR4)
- `nome` → Nome completo da empresa
- `setor` → Setor econômico
- `subsetor` → Subsetor específico

## ⏱️ Rate Limiting

### Por que delays?

**Problema**: O site Fundamentus pode bloquear IPs que fazem muitas requisições.

**Solução**: Delays entre requisições.

### Delays Configurados

```typescript
const DELAY_ENTRE_COLETAS = 10000;      // 10 segundos (com coleta)
const DELAY_APENAS_CADASTRO = 100;      // 100ms (sem coleta)
```

### Ajustar delays

Se o site bloquear, aumente:
```typescript
const DELAY_ENTRE_COLETAS = 15000; // 15 segundos
```

## 📝 Relatórios JSON

Após cada importação, um relatório é gerado em `logs/`:

**Formato do nome:**
```
logs/importacao-2026-05-09T18-42-14.json
```

**Conteúdo:**
```json
{
  "dataHora": "2026-05-09T18:42:14.205Z",
  "total": 106,
  "cadastradas": 105,
  "jaExistiam": 1,
  "coletadas": 105,
  "erros": 0,
  "detalhes": [
    {
      "codigo": "PETR4",
      "status": "cadastrada_e_coletada",
      "mensagem": "Dados coletados com sucesso"
    },
    {
      "codigo": "MRFG3",
      "status": "erro",
      "mensagem": "Cotação não disponível"
    }
  ]
}
```

## 🔄 Fluxo de Importação

```
1. Ler empresa.json
2. Para cada empresa:
   a. Verificar se já existe (pelo código)
   b. Se não existe:
      - Cadastrar no banco
      - Se --coletar: buscar dados no site
      - Aguardar delay
   c. Se existe:
      - Pular (ou atualizar se quiser)
3. Gerar relatório JSON
4. Exibir resumo no console
```

## 🎯 Progress Bar

Os scripts mostram progresso em tempo real:
```
🔄 Importando empresas...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100% | 106/106 empresas
⏱️  Tempo decorrido: 33m 45s
✅ Cadastradas: 105
❌ Erros: 1
```

## ⚠️ Tratamento de Erros

### Empresa já existe
```typescript
try {
  await empresaRepository.criar(empresaData);
} catch (error) {
  if (error.code === 'P2002') {
    console.log(`⚠️  ${codigo} já existe`);
    jaExistiam++;
  }
}
```

### Site não retorna dados
```typescript
try {
  await coletarDados(codigo);
  coletadas++;
} catch (error) {
  console.error(`❌ ${codigo}: ${error.message}`);
  erros++;
}
```

## 🧪 Testando

### Importar apenas 3 empresas
Edite `empresa.json` temporariamente:
```json
[
  { "ticker": "PETR4", "nome": "PETROBRAS PN", ... },
  { "ticker": "VALE3", "nome": "VALE ON", ... },
  { "ticker": "ITUB4", "nome": "ITAU UNIBANCO PN", ... }
]
```

```bash
npm run importar -- --coletar
```

### Dry run (simulação)
Adicione flag `--dry-run` ao script:
```typescript
if (process.argv.includes('--dry-run')) {
  console.log('Modo simulação - nenhum dado será salvo');
  // ...não salvar no banco
}
```

## 📊 Logs Detalhados

Ver logs durante execução:
```bash
npm run importar -- --coletar --verbose
```

Implementar:
```typescript
const verbose = process.argv.includes('--verbose');

if (verbose) {
  console.log('Detalhes:', dados);
}
```

## 🔧 Customizações

### Atualizar empresas existentes
```typescript
const empresaExistente = await empresaRepository.buscarPorCodigo(codigo);

if (empresaExistente) {
  await empresaRepository.atualizar(codigo, {
    nome: novoNome,
    setor: novoSetor
  });
}
```

### Coletar apenas alguns tipos de dados
```typescript
if (process.argv.includes('--apenas-trimestrais')) {
  // Coletar só dados trimestrais
}
```

### Filtrar por setor
```typescript
const empresasFiltradas = empresas.filter(e => 
  e.setor === 'Petróleo'
);
```

## 🚀 Executar em Background

### Windows (PowerShell)
```powershell
Start-Job -ScriptBlock { npm run importar -- --coletar }
```

### Linux/Mac
```bash
nohup npm run importar -- --coletar > importacao.log 2>&1 &
```

## 📈 Monitoramento

Ver progresso em tempo real:
```bash
# Terminal 1
npm run importar -- --coletar

# Terminal 2 (acompanhar logs)
tail -f logs/importacao-*.json
```

## 🔗 Integrações

- **Database**: Usa repositories para salvar
- **Scrapers**: Usa `fundamentus-scraper.ts` para coletar
- **Logs**: Gera arquivos JSON em `/logs`

## 📚 Criar Novos Scripts

Template:
```typescript
import { empresaRepository } from '../database/repositories';

async function meuScript() {
  console.log('🚀 Iniciando...');
  
  try {
    // Seu código aqui
    
    console.log('✅ Concluído!');
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

meuScript();
```

Adicionar ao `package.json`:
```json
{
  "scripts": {
    "meu-script": "tsx src/scripts/meu-script.ts"
  }
}
```

## 🐛 Debugging

Adicionar breakpoints:
```typescript
debugger; // ← Pausar aqui
```

Rodar com debugger:
```bash
node --inspect-brk node_modules/tsx/dist/cli.js src/scripts/importar-empresas.ts
```

## 📝 Boas Práticas

1. **Sempre gerar relatório** ao final
2. **Tratar todos os erros** sem parar o script
3. **Mostrar progresso** para usuário
4. **Respeitar rate limiting** (delays)
5. **Validar dados** antes de salvar
6. **Fazer backup** antes de scripts destrutivos
