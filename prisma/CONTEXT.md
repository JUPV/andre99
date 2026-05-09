# 🗃️ Prisma - Banco de Dados e ORM

## 📌 Propósito

Esta pasta contém o **schema do banco de dados** e configurações do Prisma ORM.

## 📁 Arquivos

### `schema.prisma`
- **Função**: Define o schema do banco de dados
- **Linguagem**: Prisma Schema Language (DSL)
- **Provider**: SQLite (arquivo local)

### `fundamentus.db`
- **Tipo**: SQLite Database
- **Localização**: `../fundamentus.db` (raiz do projeto)
- **Tamanho**: Cresce conforme dados são inseridos
- **Backup**: É um arquivo único e portátil

## 📊 Schema do Banco

### 1. **Empresa**
Tabela principal com empresas cadastradas.

```prisma
model Empresa {
  id            Int       @id @default(autoincrement())
  codigo        String    @unique          // Ex: PETR4, VALE3
  nome          String                     // Nome completo
  setor         String?                    // Setor econômico
  subsetor      String?                    // Subsetor
  ativo         Boolean   @default(true)   // Se deve ser coletado
  criadoEm      DateTime  @default(now())
  atualizadoEm  DateTime  @updatedAt

  // Relacionamentos
  dadosTrimestrais  DadosTrimestral[]
  dadosDiarios      DadosDiario[]
  logsColeta        LogColeta[]

  @@map("empresas")
}
```

**Constraints:**
- `codigo` é UNIQUE - não pode cadastrar empresa com código duplicado
- `ativo` controla se a empresa é incluída nas coletas automáticas

### 2. **DadosTrimestral**
Dados dos balanços trimestrais (Lucro, Receita, EBIT).

```prisma
model DadosTrimestral {
  id                  Int       @id @default(autoincrement())
  empresaId           Int
  dataBalanco         String                   // Ex: "31/03/2026"
  
  // Dados dos últimos 3 meses
  receitaLiquida3m    Float?
  ebit3m              Float?
  lucroLiquido3m      Float?
  
  // Dados dos últimos 12 meses
  receitaLiquida12m   Float?
  ebit12m             Float?
  lucroLiquido12m     Float?
  
  coletadoEm          DateTime  @default(now())
  
  empresa             Empresa   @relation(fields: [empresaId], references: [id], onDelete: Cascade)
  
  @@unique([empresaId, dataBalanco])
  @@map("dados_trimestrais")
}
```

**Constraints:**
- `empresaId + dataBalanco` é UNIQUE - não pode duplicar balanço da mesma data
- Campos numéricos podem ser NULL (quando dados não disponíveis)
- `onDelete: Cascade` - deleta dados ao deletar empresa

### 3. **DadosDiario**
Dados diários de cotação e indicadores.

```prisma
model DadosDiario {
  id            Int       @id @default(autoincrement())
  empresaId     Int
  data          String                       // Ex: "2026-05-09"
  
  // Indicadores
  cotacao       Float?                       // Preço da ação
  pl            Float?                       // Preço/Lucro
  evEbitda      Float?                       // Enterprise Value / EBITDA
  valorMercado  Float?                       // Market Cap
  valorFirma    Float?                       // Enterprise Value
  divYield      Float?                       // Dividend Yield (%)
  roe           Float?                       // Return on Equity (%)
  roic          Float?                       // Return on Invested Capital (%)
  
  coletadoEm    DateTime  @default(now())
  
  empresa       Empresa   @relation(fields: [empresaId], references: [id], onDelete: Cascade)
  
  @@unique([empresaId, data])
  @@map("dados_diarios")
}
```

**Constraints:**
- `empresaId + data` é UNIQUE - um registro por empresa por dia
- Todos os indicadores podem ser NULL

### 4. **LogColeta**
Histórico de todas as tentativas de coleta.

```prisma
model LogColeta {
  id              Int       @id @default(autoincrement())
  empresaId       Int
  tipoColeta      String                     // 'diaria' ou 'trimestral'
  status          String                     // 'sucesso', 'erro', 'sem_dados'
  mensagem        String?                    // Detalhes do que aconteceu
  dataReferencia  String?                    // Data dos dados coletados
  tentativaEm     DateTime  @default(now())  // Quando tentou coletar
  
  empresa         Empresa   @relation(fields: [empresaId], references: [id], onDelete: Cascade)
  
  @@map("log_coleta")
}
```

**Status possíveis:**
- `sucesso` - Dados coletados e salvos com sucesso
- `erro` - Erro durante a coleta (timeout, site fora, etc)
- `sem_dados` - Site não retornou dados (empresa suspensa, delisted, etc)

## 🔗 Relacionamentos

```
Empresa (1) ──────> (N) DadosTrimestral
Empresa (1) ──────> (N) DadosDiario
Empresa (1) ──────> (N) LogColeta
```

Todos os relacionamentos usam `onDelete: Cascade`:
- Ao deletar uma empresa, todos os dados relacionados são deletados automaticamente

## 🔧 Comandos Prisma

### Gerar Cliente
```bash
npm run db:generate
# ou
npx prisma generate
```

**Quando usar:**
- Após alterar `schema.prisma`
- Após clonar o projeto
- Sempre que tiver erro de `@prisma/client` não encontrado

### Sincronizar Schema
```bash
npm run db:push
# ou
npx prisma db push
```

**Quando usar:**
- Primeira vez no projeto
- Após alterar o schema
- **CUIDADO**: Pode perder dados em produção!

### Migrations (Recomendado)
```bash
# Criar migration
npx prisma migrate dev --name adicionar_campo_x

# Aplicar migrations
npx prisma migrate deploy
```

**Vantagens:**
- Histórico versionado
- Rollback possível
- Seguro para produção

### Prisma Studio (UI Visual)
```bash
npm run db:studio
# ou
npx prisma studio
```

Abre em: http://localhost:5555

**Funcionalidades:**
- Ver todas as tabelas
- Editar registros
- Criar/deletar dados
- Executar queries

### Reset (PERIGOSO!)
```bash
npx prisma migrate reset
```

⚠️ **DELETA TODOS OS DADOS!**

## 📊 Tipos de Dados

### Prisma → TypeScript
```typescript
Int      → number
Float    → number
String   → string
Boolean  → boolean
DateTime → Date
```

### SQLite Storage
- `Int` → INTEGER
- `Float` → REAL
- `String` → TEXT
- `Boolean` → INTEGER (0 ou 1)
- `DateTime` → TEXT (ISO-8601)

## 🔍 Queries Comuns

### Criar
```typescript
const empresa = await prisma.empresa.create({
  data: {
    codigo: 'PETR4',
    nome: 'PETROBRAS PN',
    setor: 'Petróleo'
  }
});
```

### Buscar
```typescript
// Por ID
const empresa = await prisma.empresa.findUnique({
  where: { id: 1 }
});

// Por código
const empresa = await prisma.empresa.findUnique({
  where: { codigo: 'PETR4' }
});

// Todos
const empresas = await prisma.empresa.findMany();

// Com filtros
const empresas = await prisma.empresa.findMany({
  where: {
    ativo: true,
    setor: 'Petróleo'
  }
});
```

### Atualizar
```typescript
const empresa = await prisma.empresa.update({
  where: { codigo: 'PETR4' },
  data: { nome: 'PETROBRAS PN ATUALIZADO' }
});
```

### Deletar
```typescript
await prisma.empresa.delete({
  where: { codigo: 'PETR4' }
});
// Deleta automaticamente todos os dados relacionados (Cascade)
```

### Upsert
```typescript
await prisma.dadosTrimestral.upsert({
  where: {
    empresaId_dataBalanco: {
      empresaId: 1,
      dataBalanco: '31/03/2026'
    }
  },
  update: {
    receitaLiquida12m: 500000,
    lucroLiquido12m: 80000
  },
  create: {
    empresaId: 1,
    dataBalanco: '31/03/2026',
    receitaLiquida12m: 500000,
    lucroLiquido12m: 80000
  }
});
```

### Incluir Relacionamentos
```typescript
const empresa = await prisma.empresa.findUnique({
  where: { codigo: 'PETR4' },
  include: {
    dadosTrimestrais: true,
    dadosDiarios: true,
    logsColeta: true
  }
});
```

### Ordenação
```typescript
const dados = await prisma.dadosTrimestral.findMany({
  where: { empresaId: 1 },
  orderBy: { dataBalanco: 'desc' }
});
```

### Limitar Resultados
```typescript
const ultimos10 = await prisma.dadosDiario.findMany({
  where: { empresaId: 1 },
  orderBy: { data: 'desc' },
  take: 10
});
```

## 🔄 Alterando o Schema

### 1. Editar `schema.prisma`
```prisma
model Empresa {
  // ... campos existentes
  site String?  // ← Novo campo
}
```

### 2. Criar Migration
```bash
npx prisma migrate dev --name adicionar_campo_site
```

### 3. Gerar Cliente
```bash
npx prisma generate
```

### 4. Usar no Código
```typescript
const empresa = await prisma.empresa.create({
  data: {
    codigo: 'PETR4',
    nome: 'PETROBRAS',
    site: 'https://petrobras.com.br'  // ← Novo campo
  }
});
```

## 💾 Backup do Banco

### Fazer Backup
```bash
# Windows
copy fundamentus.db fundamentus_backup_2026-05-09.db

# Linux/Mac
cp fundamentus.db fundamentus_backup_2026-05-09.db
```

### Restaurar Backup
```bash
# Windows
copy fundamentus_backup_2026-05-09.db fundamentus.db

# Linux/Mac
cp fundamentus_backup_2026-05-09.db fundamentus.db
```

### Exportar para SQL
```bash
sqlite3 fundamentus.db .dump > backup.sql
```

### Importar de SQL
```bash
sqlite3 fundamentus.db < backup.sql
```

## ⚠️ Avisos Prisma 7

O schema atual mostra warning sobre Prisma 7:

```
The datasource property `url` is no longer supported in schema files.
```

**Status:** Aviso não-crítico para Prisma 5.x atual.

**Migração futura:** Quando atualizar para Prisma 7, mover URL para `prisma.config.ts`.

## 🐛 Problemas Comuns

### "Cannot find module '@prisma/client'"
```bash
npm run db:generate
```

### "P2002: Unique constraint failed"
Tentou inserir registro com chave duplicada. Use `upsert` ou verifique antes.

### "Database is locked"
Outro processo está usando o banco. Feche Prisma Studio ou outras conexões.

### Migrations desincronizadas
```bash
npx prisma migrate reset  # ⚠️ DELETA DADOS
npx prisma db push        # Alternativa mais segura
```

## 📚 Documentação Oficial

- Prisma Docs: https://www.prisma.io/docs
- Schema Reference: https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference
- Client API: https://www.prisma.io/docs/reference/api-reference/prisma-client-reference

## 🚀 Performance

### Índices
Prisma cria índices automaticamente para:
- `@id` (primary keys)
- `@unique` (unique constraints)
- Foreign keys

### N+1 Queries
Evitar:
```typescript
// ❌ BAD - N+1
for (const empresa of empresas) {
  const dados = await prisma.dadosTrimestral.findMany({
    where: { empresaId: empresa.id }
  });
}

// ✅ GOOD
const empresas = await prisma.empresa.findMany({
  include: { dadosTrimestrais: true }
});
```

### Connection Pool
SQLite não usa connection pool (single connection), mas o Prisma gerencia automaticamente.
