# 📚 GUIA PARA INTELIGÊNCIAS ARTIFICIAIS

## 🎯 Propósito deste Documento

Este documento serve como **contexto inicial** para qualquer IA que for modificar ou adicionar código neste projeto.

**Leia este arquivo ANTES de fazer qualquer alteração no código!**

## 📋 Sobre o Projeto

### Nome
**Fundamentus Scraper - Sistema de Análise de Ações**

### Objetivo Principal
Acompanhar automaticamente a performance financeira de mais de 200 empresas brasileiras para auxiliar nas decisões de investimento.

### Dados Monitorados
- **Trimestrais**: Lucro, Prejuízo, Receita Líquida, EBIT
- **Diários**: Cotação da ação, P/L (Preço/Lucro), EV/EBITDA, ROE, ROIC, etc.

### Fonte dos Dados
**Fundamentus.com.br** - Site que disponibiliza dados fundamentalistas gratuitos.

## 🔧 Stack Tecnológico

```
Backend:
- Node.js v24.11.0
- TypeScript 5.3.3
- Express.js 4.18.2
- Prisma ORM 5.11.0
- SQLite (fundamentus.db)

Web Scraping:
- Axios 1.6.0
- Cheerio 1.0.0 (jQuery-like parser)
- TextDecoder ISO-8859-1 (CRITICAL!)

Automação:
- node-cron 3.0.3

Frontend:
- HTML5/CSS3/JavaScript Vanilla
- Chart.js 4.4.0
- Dark Theme profissional
```

## 📁 Estrutura de Pastas

Cada pasta possui um arquivo `CONTEXT.md` com documentação detalhada:

```
Andre/
├── src/
│   ├── database/        → CONTEXT.md disponível
│   ├── scrapers/        → CONTEXT.md disponível
│   ├── services/        → CONTEXT.md disponível
│   ├── routes/          → CONTEXT.md disponível
│   └── scripts/         → CONTEXT.md disponível
├── public/              → CONTEXT.md disponível
├── prisma/              → CONTEXT.md disponível
└── README.md            → Documentação completa
```

## ⚠️ REGRAS CRÍTICAS - NÃO VIOLE!

### 1. 🔴 ENCODING ISO-8859-1
O site Fundamentus usa ISO-8859-1, NÃO UTF-8.

**NUNCA remova este código do scraper:**
```typescript
const response = await axios.get(url, {
  responseType: 'arraybuffer'  // ← OBRIGATÓRIO
});
const buffer = Buffer.from(response.data);
const html = new TextDecoder('iso-8859-1').decode(buffer);  // ← OBRIGATÓRIO
```

**Motivo:** Sem isso, caracteres portugueses ficam corrompidos (�����).

### 2. 🔴 RATE LIMITING
O site pode bloquear IPs com muitas requisições.

**SEMPRE usar delays:**
```typescript
const DELAY_ENTRE_COLETAS = 10000; // 10 segundos
await new Promise(resolve => setTimeout(resolve, DELAY_ENTRE_COLETAS));
```

**Nunca remova ou reduza abaixo de 10s!**

### 3. 🔴 USAR REPOSITORIES, NÃO PRISMA DIRETO
❌ **ERRADO:**
```typescript
const empresa = await prisma.empresa.findUnique({ where: { codigo: 'PETR4' } });
```

✅ **CORRETO:**
```typescript
const empresa = await empresaRepository.buscarPorCodigo('PETR4');
```

**Motivo:** Camada de abstração facilita manutenção e testes.

### 4. 🔴 NULL SAFETY
Muitos campos podem ser NULL (quando dados não disponíveis).

**SEMPRE verificar:**
```typescript
if (atual.receitaLiquida12m && anterior.receitaLiquida12m) {
  const variacao = (atual.receitaLiquida12m - anterior.receitaLiquida12m) / anterior.receitaLiquida12m * 100;
}
```

### 5. 🔴 BIGINT SERIALIZATION
Prisma retorna BigInt para count(), mas JSON não suporta BigInt.

**SEMPRE converter:**
```typescript
const count = await prisma.empresa.count();
res.json({ count: Number(count) }); // ← Converter
```

## 🔍 Antes de Modificar uma Pasta

### 1. Leia o CONTEXT.md da pasta
Cada pasta tem um arquivo `CONTEXT.md` com:
- Propósito da pasta
- Padrões de código
- Regras específicas
- Exemplos de uso
- Avisos críticos

### 2. Entenda os relacionamentos
```
Empresa (1) ──────> (N) DadosTrimestral
Empresa (1) ──────> (N) DadosDiario
Empresa (1) ──────> (N) LogColeta
```

### 3. Verifique dependências
- Não adicione bibliotecas pesadas sem necessidade
- Use bibliotecas já instaladas quando possível
- TypeScript strict mode está ativo

## 🎯 Fluxos Principais

### Fluxo de Coleta Automática
```
1. Cron job inicia (9h ou 18h para diário, 3h em 3h para trimestral)
2. Busca empresas ativas no banco
3. Para cada empresa:
   a. Verifica se deve coletar
   b. Faz request ao Fundamentus (com delay de 10s)
   c. Parseia HTML com Cheerio
   d. Salva no banco via repositories
   e. Registra log (sucesso/erro/sem_dados)
4. Aguarda próximo ciclo
```

### Fluxo de Importação em Massa
```
1. Lê empresa.json
2. Para cada empresa:
   a. Verifica se já existe
   b. Cadastra no banco
   c. Se --coletar: coleta dados (com delay 10s)
   d. Atualiza progresso
3. Gera relatório JSON em /logs
```

### Fluxo da Interface Web
```
1. Usuário acessa página HTML
2. JavaScript faz fetch() para API
3. API consulta banco via repositories
4. Retorna JSON
5. JavaScript renderiza na página
```

## 📝 Convenções de Código

### Nomenclatura
- **Variáveis/Funções**: camelCase (empresaAtiva, coletarDados)
- **Classes/Tipos**: PascalCase (Empresa, DadosTrimestral)
- **Constantes**: UPPER_SNAKE_CASE (DELAY_ENTRE_COLETAS)
- **Arquivos**: kebab-case (fundamentus-scraper.ts)

### Banco de Dados
- **Tabelas**: snake_case (dados_trimestrais)
- **TypeScript**: camelCase (dadosTrimestrais)
- **Prisma faz conversão automática**

### API REST
- **Verbos HTTP corretos**: GET (ler), POST (criar), PUT (atualizar), DELETE (deletar)
- **Status codes apropriados**: 200 (ok), 201 (criado), 400 (bad request), 404 (not found), 500 (erro)
- **Nomes em português nos endpoints**: /api/empresas, /api/coleta

### Frontend
- **Classes CSS**: kebab-case (.page-header, .card-body)
- **IDs HTML**: camelCase (empresaNome, totalEmpresas)
- **Dark theme**: Todas as páginas usam tema escuro

## 🧪 Testando Alterações

### Compilar TypeScript
```bash
npm run build
```

### Iniciar servidor de desenvolvimento
```bash
npm run dev
```

### Testar coleta de uma empresa
```bash
npm run scrape PETR4
```

### Importação em massa
```bash
npm run importar            # Só cadastro
npm run importar -- --coletar  # Com coleta
```

## 🚨 Checklist Antes de Commitar

- [ ] Código compila sem erros (`npm run build`)
- [ ] Não violou nenhuma regra crítica
- [ ] Testou localmente (`npm run dev`)
- [ ] Adicionou tratamento de erros (try/catch)
- [ ] Verificou null safety em campos nullable
- [ ] Usou repositories ao invés de prisma direto
- [ ] Manteve rate limiting (delays de 10s)
- [ ] Documentou funções complexas
- [ ] Atualizou CONTEXT.md se necessário

## 📚 Documentação Disponível

```
README.md                     → Documentação completa para usuários
src/database/CONTEXT.md       → Camada de banco de dados
src/scrapers/CONTEXT.md       → Web scraping
src/services/CONTEXT.md       → Serviços e automação
src/routes/CONTEXT.md         → API REST
src/scripts/CONTEXT.md        → Scripts utilitários
public/CONTEXT.md             → Frontend
prisma/CONTEXT.md             → Schema e ORM
```

## 🆘 Em Caso de Dúvida

1. **Leia o CONTEXT.md da pasta relevante**
2. **Consulte o README.md principal**
3. **Veja exemplos no código existente**
4. **Não invente padrões novos** - siga os existentes
5. **Pergunte antes de fazer mudanças estruturais grandes**

## 🎓 Conceitos Importantes

### Web Scraping
Técnica de extrair dados de sites HTML. Usamos Cheerio (jQuery-like) para parsear.

### ORM (Prisma)
Object-Relational Mapping. Acessa banco de dados com código TypeScript ao invés de SQL.

### Repository Pattern
Camada de abstração entre o código e o banco. Todos os acessos passam pelos repositories.

### Cron Jobs
Tarefas agendadas que rodam automaticamente em horários específicos.

### Rate Limiting
Limitar requisições para não sobrecarregar ou ser bloqueado pelo site.

## 🚀 Roadmap Futuro

- [ ] Integração com Google Sheets (objetivo original do usuário)
- [ ] Notificações por email quando dados novos chegarem
- [ ] Análise de múltiplos (Método Graham)
- [ ] Ranking de empresas por indicador
- [ ] Backtesting de estratégias
- [ ] Migração para Prisma 7
- [ ] Testes automatizados
- [ ] Docker para deploy

## 📞 Suporte

Ao modificar o código:
- Mantenha a simplicidade
- Priorize legibilidade sobre cleverness
- Documente decisões não-óbvias
- Teste antes de commitar
- Mantenha os CONTEXT.md atualizados

---

**Última atualização:** 09/05/2026

**Versão:** 1.0.0

**Status:** ✅ Sistema totalmente funcional com 106 empresas importadas
