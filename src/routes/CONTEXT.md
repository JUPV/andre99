# 🔌 API Routes - Endpoints REST

## 📌 Propósito

Esta pasta contém todos os **endpoints da API REST** do sistema usando Express.js.

## 📁 Arquivos

### `api.ts`
- **Framework**: Express.js 4.18.2
- **Padrão**: RESTful API
- **Base URL**: `http://localhost:3000/api`

## 📋 Endpoints Disponíveis

### 🏢 **Empresas**

#### `GET /api/empresas`
Lista todas as empresas cadastradas.

**Response:**
```json
[
  {
    "id": 1,
    "codigo": "PETR4",
    "nome": "PETROBRAS PN",
    "setor": "Petróleo",
    "subsetor": "Exploração",
    "ativo": true,
    "criadoEm": "2026-01-01T00:00:00Z",
    "atualizadoEm": "2026-05-09T00:00:00Z"
  }
]
```

#### `GET /api/empresas/:codigo`
Busca uma empresa pelo código.

**Exemplo:** `/api/empresas/PETR4`

#### `POST /api/empresas`
Cadastra uma nova empresa.

**Body:**
```json
{
  "codigo": "VALE3",
  "nome": "VALE ON",
  "setor": "Mineração",
  "subsetor": "Minerais Metálicos"
}
```

#### `PUT /api/empresas/:codigo`
Atualiza dados de uma empresa.

**Body:** Mesmo do POST

#### `DELETE /api/empresas/:codigo`
Remove uma empresa e todos os seus dados relacionados.

⚠️ **CUIDADO**: Operação irreversível!

---

### 📊 **Dados**

#### `GET /api/empresas/:codigo/trimestrais`
Retorna todos os dados trimestrais de uma empresa.

**Response:**
```json
[
  {
    "id": 1,
    "empresaId": 1,
    "dataBalanco": "31/03/2026",
    "receitaLiquida3m": 120000,
    "ebit3m": 25000,
    "lucroLiquido3m": 18000,
    "receitaLiquida12m": 480000,
    "ebit12m": 100000,
    "lucroLiquido12m": 72000,
    "coletadoEm": "2026-05-09T10:00:00Z"
  }
]
```

#### `GET /api/empresas/:codigo/diarios`
Retorna todos os dados diários de uma empresa.

**Response:**
```json
[
  {
    "id": 1,
    "empresaId": 1,
    "data": "2026-05-09",
    "cotacao": 35.50,
    "pl": 4.5,
    "evEbitda": 3.2,
    "valorMercado": 500000000000,
    "valorFirma": 550000000000,
    "divYield": 12.5,
    "roe": 18.2,
    "roic": 15.8
  }
]
```

#### `GET /api/empresas/:codigo/resumo`
Retorna resumo completo: empresa + último trimestre + último diário + histórico.

**Response:**
```json
{
  "empresa": { /* dados da empresa */ },
  "ultimoTrimestral": { /* último balanço */ },
  "ultimoDiario": { /* última cotação */ },
  "historicoTrimestral": [ /* array */ ],
  "variacoes": {
    "receita12m": 5.2,
    "lucro12m": -3.1,
    "ebit12m": 2.8
  }
}
```

#### `GET /api/empresas/:codigo/detalhes-completos`
Versão estendida do resumo com mais estatísticas.

---

### 🔄 **Coleta**

#### `POST /api/coleta/executar`
Força a coleta imediata de dados de uma empresa.

**Body:**
```json
{
  "codigo": "PETR4"
}
```

**Response:**
```json
{
  "message": "Dados coletados com sucesso!",
  "dados": { /* dados coletados */ }
}
```

#### `GET /api/coleta/logs`
Retorna logs de todas as coletas realizadas.

**Query Params:**
- `empresaId` - Filtrar por empresa
- `status` - Filtrar por status (sucesso/erro/sem_dados)
- `limit` - Limitar quantidade de resultados

---

### 📈 **Dashboard**

#### `GET /api/dashboard/comparacao-trimestral`
Retorna dados comparativos das últimas 10 empresas.

**Response:**
```json
[
  {
    "empresa": { /* dados empresa */ },
    "ultimoTrimestral": { /* último balanço */ },
    "penultimoTrimestral": { /* penúltimo balanço */ },
    "variacao": 5.2
  }
]
```

#### `GET /api/comparativo-trimestral`
Retorna comparativo completo de todas as empresas com dados organizados por trimestre.

**Response:**
```json
{
  "empresas": [
    {
      "codigo": "PETR4",
      "nome": "PETROBRAS PN",
      "trimestrais": {
        "1T26": { lucro: 18000, receita: 120000, ebit: 25000 },
        "4T25": { lucro: 17000, receita: 115000, ebit: 24000 },
        // ...
      },
      "diario": {
        "pl": 4.5,
        "evEbitda": 3.2
      }
    }
  ]
}
```

---

## 🔧 Padrões de Código

### 1. **Async/Await**
Todas as rotas usam async/await:
```typescript
router.get('/empresas', async (req: Request, res: Response) => {
  try {
    const empresas = await empresaRepository.listarTodas();
    res.json(empresas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 2. **Try/Catch**
Sempre envolver em try/catch com status codes apropriados:
- **200**: Sucesso
- **201**: Criado
- **400**: Bad Request (dados inválidos)
- **404**: Not Found
- **500**: Internal Server Error

### 3. **Validação de Dados**
```typescript
if (!codigo || !nome) {
  return res.status(400).json({ error: 'Campos obrigatórios faltando' });
}
```

### 4. **CORS**
CORS está habilitado para localhost:
```typescript
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000']
}));
```

## ⚠️ BigInt Serialization

**PROBLEMA**: Prisma retorna BigInt para campos de contagem, mas JSON não suporta BigInt.

**SOLUÇÃO**: Sempre converter antes de enviar:
```typescript
const count = await prisma.empresa.count();
res.json({ count: Number(count) }); // ← Converter para Number
```

## 🔒 Segurança

### Implementadas:
- ✅ CORS configurado
- ✅ Validação de entrada
- ✅ Try/Catch em todas as rotas

### A implementar:
- [ ] Autenticação (JWT)
- [ ] Rate limiting
- [ ] Sanitização de inputs
- [ ] Logs de auditoria

## 📊 Middleware

### 1. **JSON Parser**
```typescript
app.use(express.json());
```

### 2. **Static Files**
```typescript
app.use(express.static('public'));
```

### 3. **CORS**
```typescript
app.use(cors());
```

## 🧪 Testando Endpoints

### cURL
```bash
# GET
curl http://localhost:3000/api/empresas

# POST
curl -X POST http://localhost:3000/api/empresas \
  -H "Content-Type: application/json" \
  -d '{"codigo":"VALE3","nome":"VALE ON","setor":"Mineração","subsetor":"Minerais"}'

# DELETE
curl -X DELETE http://localhost:3000/api/empresas/VALE3
```

### Postman/Insomnia
Importe a collection com todos os endpoints (criar arquivo `api-collection.json`).

### Frontend
Todas as páginas HTML usam `fetch()` para consumir a API.

## 📝 Logs

Adicionar logging:
```typescript
console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
```

## 🚀 Performance

### 1. **Evitar N+1 Queries**
```typescript
// ❌ RUIM - N+1
const empresas = await prisma.empresa.findMany();
for (const empresa of empresas) {
  empresa.trimestrais = await prisma.dadosTrimestral.findMany({
    where: { empresaId: empresa.id }
  });
}

// ✅ BOM - 1 query
const empresas = await prisma.empresa.findMany({
  include: {
    dadosTrimestrais: true
  }
});
```

### 2. **Paginação**
Para endpoints com muitos dados:
```typescript
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 20;
const skip = (page - 1) * limit;

const empresas = await prisma.empresa.findMany({
  skip,
  take: limit
});
```

### 3. **Cache**
Considere cachear dados que não mudam frequentemente.

## 🔗 Integrações

- **Database**: Usa repositories para acesso ao banco
- **Scrapers**: Chama `coletarDados()` quando necessário
- **Services**: Integra com coleta automática

## 🐛 Debugging

Ver requisições:
```typescript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});
```

## 📚 Documentação da API

Considere adicionar:
- [ ] Swagger/OpenAPI
- [ ] Postman Collection
- [ ] Exemplos de uso em cada endpoint
