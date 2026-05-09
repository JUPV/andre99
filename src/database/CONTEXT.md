# 🗄️ Database Layer - Camada de Banco de Dados

## 📌 Propósito

Esta pasta contém toda a lógica de acesso ao banco de dados usando **Prisma ORM**.

## 📁 Arquivos

### `prisma.ts`
- **Função**: Singleton do PrismaClient
- **Uso**: Importar em qualquer lugar que precise acessar o banco
- **Padrão**: 
  ```typescript
  import prisma from './prisma';
  const empresas = await prisma.empresa.findMany();
  ```

### `repositories.ts`
- **Função**: Camada de abstração para todas as operações do banco
- **Padrão**: Repository Pattern
- **Exports**:
  - `empresaRepository` - CRUD de empresas
  - `dadosTrimestraisRepository` - Dados trimestrais (Lucro, Receita, EBIT)
  - `dadosDiariosRepository` - Dados diários (Cotação, P/L, etc)
  - `logColetaRepository` - Logs de coletas

## 🔧 Convenções

### 1. **Sempre usar repositories, NÃO usar prisma diretamente**
❌ **ERRADO:**
```typescript
const empresa = await prisma.empresa.findUnique({ where: { codigo: 'PETR4' } });
```

✅ **CORRETO:**
```typescript
const empresa = await empresaRepository.buscarPorCodigo('PETR4');
```

### 2. **Nomes de métodos em português**
- `criar()` - Criar registro
- `buscarPorId()` - Buscar por ID
- `buscarPorCodigo()` - Buscar por código
- `listarTodas()` - Listar todos
- `atualizar()` - Atualizar registro
- `deletar()` - Deletar registro

### 3. **Upsert para dados que podem existir**
```typescript
await dadosTrimestraisRepository.inserir({
  empresaId,
  dataBalanco,
  receitaLiquida12m,
  lucroLiquido12m,
  ebit12m
});
// Usa upsert internamente para evitar duplicatas
```

## ⚠️ Regras Importantes

### 1. **Encoding ISO-8859-1**
O site Fundamentus usa ISO-8859-1. **SEMPRE** usar:
```typescript
responseType: 'arraybuffer'
new TextDecoder('iso-8859-1').decode(buffer)
```

### 2. **Unique Constraints**
- `Empresa.codigo` - UNIQUE
- `DadosTrimestral.empresaId + dataBalanco` - UNIQUE
- `DadosDiario.empresaId + data` - UNIQUE

### 3. **CamelCase vs snake_case**
- **Banco de dados**: snake_case (receita_liquida_12m)
- **TypeScript**: camelCase (receitaLiquida12m)
- **Prisma faz a conversão automaticamente**

### 4. **Valores Nullable**
Muitos campos podem ser NULL (quando dados não estão disponíveis):
```typescript
receitaLiquida12m: number | null
lucroLiquido12m: number | null
```

**SEMPRE verificar null antes de usar**:
```typescript
if (atual.receitaLiquida12m && anterior.receitaLiquida12m) {
  const variacao = ((atual.receitaLiquida12m - anterior.receitaLiquida12m) / Math.abs(anterior.receitaLiquida12m)) * 100;
}
```

## 🔗 Relacionamentos

```
Empresa (1) ----> (N) DadosTrimestral
Empresa (1) ----> (N) DadosDiario
Empresa (1) ----> (N) LogColeta
```

## 📊 Schema

Veja o schema completo em: `../../prisma/schema.prisma`

## 🚨 Antes de Modificar

1. **Nunca altere diretamente o banco** - Use Prisma migrations
2. **Sempre teste localmente** antes de fazer alterações
3. **Backup do banco**: `fundamentus.db` é arquivo único
4. **Consulte repositories.ts** para ver métodos disponíveis antes de criar novos

## 💡 Exemplos de Uso

```typescript
// Criar empresa
const empresa = await empresaRepository.criar({
  codigo: 'PETR4',
  nome: 'PETROBRAS PN',
  setor: 'Petróleo',
  subsetor: 'Exploração'
});

// Inserir dados trimestrais
await dadosTrimestraisRepository.inserir({
  empresaId: empresa.id,
  dataBalanco: '31/03/2026',
  receitaLiquida12m: 400000,
  lucroLiquido12m: 50000,
  ebit12m: 80000
});

// Verificar se deve retentar coleta
const deveRetentar = await logColetaRepository.verificarSeDeveRetentar(
  empresa.id,
  'trimestral'
);
```

## 🔄 Migração de Banco

Se precisar alterar o schema:

```bash
# 1. Edite prisma/schema.prisma
# 2. Gere a migration
npx prisma migrate dev --name nome_da_alteracao
# 3. Gere o cliente
npm run db:generate
```
