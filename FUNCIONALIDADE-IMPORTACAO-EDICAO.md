# 📊 Funcionalidade de Importação e Edição de Dados Trimestrais

## ✨ Novas Funcionalidades Implementadas

### 1. **Importação de Dados no Cadastro de Empresa**

Ao cadastrar uma nova empresa, agora você pode:

#### Opções Disponíveis:
- ✅ **Checkbox "Importar dados trimestrais dos últimos 5 anos (Status Invest)"**
  - Quando marcado, exibe uma seção de preview
  - Busca dados diretamente do Status Invest
  - Permite visualizar antes de confirmar a importação

#### Como Usar:
1. Acesse **Nova Empresa** no menu
2. Preencha o código da empresa (ex: PETR4)
3. Marque o checkbox **"Importar dados trimestrais..."**
4. Clique em **"🔍 Buscar Dados"**
5. Visualize os dados em uma tabela de preview
6. Preencha os demais campos da empresa
7. Clique em **"💾 Salvar Empresa"**

#### O que é Importado:
- Receita Líquida 3m
- Lucro Líquido 3m
- Despesas
- Margem Bruta (%)
- Margem EBITDA (%)
- Margem EBIT (%)
- Margem Líquida (%)
- Últimos 5 anos de dados (até 20 trimestres)

### 2. **Edição de Dados Trimestrais**

Na página de detalhes da empresa, você pode corrigir dados incorretos:

#### Como Editar:
1. Acesse a página de **Detalhes da Empresa**
2. Na tabela **"Histórico Trimestral"**, encontre o trimestre desejado
3. Clique no botão **✏️** na coluna "Ações"
4. Um modal será aberto com todos os campos editáveis
5. Modifique os valores necessários
6. Clique em **"💾 Salvar"**

#### Campos Editáveis:
- **Dados de 3 Meses:**
  - Receita Líquida 3m
  - EBIT 3m
  - Lucro Líquido 3m
  - Despesas

- **Dados de 12 Meses:**
  - Receita Líquida 12m
  - EBIT 12m
  - Lucro Líquido 12m

- **Margens (%):**
  - Margem Bruta
  - Margem EBITDA
  - Margem EBIT
  - Margem Líquida

## 🔌 APIs Criadas

### 1. Preview de Dados (GET)
```
GET /api/empresas/:codigo/preview-status-invest
```

**Retorno:**
```json
{
  "sucesso": true,
  "codigo": "PETR4",
  "totalTrimestres": 20,
  "dados": [
    {
      "year": 2026,
      "quarter": 1,
      "receitaLiquida": 100000000,
      "lucroLiquido": 20000000,
      "margemLiquida": 20.5,
      "margemEbitda": 35.2,
      ...
    }
  ]
}
```

### 2. Importar Dados (POST)
```
POST /api/empresas/:codigo/importar-trimestrais
Content-Type: application/json

{
  "dados": [...]
}
```

**Retorno:**
```json
{
  "sucesso": true,
  "codigo": "PETR4",
  "salvos": 18,
  "atualizados": 2,
  "erros": 0,
  "total": 20
}
```

### 3. Editar Dado Trimestral (PUT)
```
PUT /api/dados-trimestrais/:id
Content-Type: application/json

{
  "receitaLiquida3m": 100000000,
  "lucroLiquido3m": 20000000,
  "margemLiquida": 20.5,
  ...
}
```

**Retorno:**
```json
{
  "id": 123,
  "empresaId": 1,
  "dataBalanco": "2026-03-31",
  "receitaLiquida3m": 100000000,
  ...
}
```

## 📁 Arquivos Modificados

### Backend (TypeScript)
- ✅ `src/routes/api.ts` - Novas rotas adicionadas

### Frontend (HTML/JS)
- ✅ `public/cadastro.html` - Checkbox e preview de importação
- ✅ `public/empresa-detalhes.html` - Coluna de ações e modal de edição
- ✅ `public/empresa-detalhes.js` - Funções de edição

## 🎯 Fluxo de Uso Completo

### Cadastrando Nova Empresa com Dados:

1. **Cadastro** → Preencher código
2. **Preview** → Buscar dados Status Invest
3. **Visualizar** → Conferir trimestres encontrados
4. **Salvar** → Empresa + dados importados
5. **Acessar** → Ver detalhes completos

### Corrigindo Dados Incorretos:

1. **Detalhes** → Acessar empresa
2. **Localizar** → Encontrar trimestre errado
3. **Editar** → Clicar em ✏️
4. **Corrigir** → Modificar valores
5. **Salvar** → Atualizar no banco

## 🔄 Integração com Sistema Existente

- ✅ Mantém compatibilidade com coleta automática
- ✅ Não interfere em dados já existentes (usa upsert)
- ✅ Permite importação manual de dados históricos
- ✅ Facilita correção de dados incorretos

## 📝 Observações

- A importação busca os **últimos 5 anos** (máximo 20 trimestres)
- Dados já existentes são **atualizados** (não duplicados)
- O preview é **obrigatório** antes da importação
- A edição **não requer confirmação** adicional
- Todos os campos são **opcionais** (aceita null)

## 🚀 Próximos Passos Sugeridos

1. Adicionar log de edições (quem editou e quando)
2. Permitir importação em lote (múltiplas empresas)
3. Adicionar validação de dados (alertas para valores suspeitos)
4. Criar histórico de alterações (audit trail)
5. Adicionar botão "Importar Trimestres" na página de detalhes

---

✅ **Sistema pronto para uso!**
