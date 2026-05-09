# 🕷️ Web Scrapers - Coleta de Dados do Fundamentus

## 📌 Propósito

Esta pasta contém a lógica de **web scraping** para coletar dados financeiros do site **Fundamentus.com.br**.

## 📁 Arquivos

### `fundamentus-scraper.ts`
- **Função**: Scraper principal do site Fundamentus
- **URL Base**: `https://www.fundamentus.com.br/detalhes.php?papel={CODIGO}`
- **Método**: HTTP GET com parsing de HTML usando Cheerio

## 🔧 Funções Principais

### `coletarDados(codigo: string)`
Coleta todos os dados de uma empresa (trimestrais + diários).

**Retorna:**
```typescript
{
  empresa: { codigo, nome, setor, subsetor },
  dadosTrimestral: {
    dataBalanco,
    receitaLiquida3m,
    ebit3m,
    lucroLiquido3m,
    receitaLiquida12m,
    ebit12m,
    lucroLiquido12m
  },
  dadosDiario: {
    data,
    cotacao,
    pl,
    evEbitda,
    valorMercado,
    valorFirma,
    divYield,
    roe,
    roic
  }
}
```

### `salvarDados(dados)`
Salva os dados coletados no banco usando os repositories.

## ⚠️ CRITICAL - Encoding ISO-8859-1

O site Fundamentus usa **ISO-8859-1** (não UTF-8).

### ❌ NUNCA REMOVA ESTE CÓDIGO:
```typescript
const response = await axios.get(url, {
  responseType: 'arraybuffer'  // IMPORTANTE!
});

const buffer = Buffer.from(response.data);
const html = new TextDecoder('iso-8859-1').decode(buffer);
```

**Motivo**: Sem isso, caracteres portugueses ficam corrompidos (�����).

## 🔍 Parsing de HTML

### Seletores Usados

**Dados da Empresa:**
```typescript
$('.conteudo table.w728 tr').each((i, elem) => {
  const label = $(elem).find('td:first-child').text().trim();
  const value = $(elem).find('td:last-child').text().trim();
});
```

**Dados Trimestrais:**
```css
span.txt → Receita Líquida (3 meses)
span.txt → EBIT (3 meses)
span.txt → Lucro Líquido (3 meses)
```

**Dados Diários:**
```css
span.oscil → Cotação atual
td:contains("P/L") → Preço/Lucro
td:contains("EV / EBITDA") → Enterprise Value
```

## 🚨 Tratamento de Erros

### 1. **Empresa não encontrada**
```typescript
if (!cotacaoElement || cotacaoElement.length === 0) {
  throw new Error('Cotação não disponível');
}
```

### 2. **Dados parciais**
Alguns campos podem não existir. Sempre retornar `null`:
```typescript
const pl = parseFloat(plText) || null;
```

### 3. **Site fora do ar**
```typescript
try {
  const dados = await coletarDados(codigo);
} catch (error) {
  await logColetaRepository.criar({
    empresaId,
    tipoColeta: 'diaria',
    status: 'erro',
    mensagem: error.message
  });
}
```

## 📊 Formatos de Dados

### Números
```typescript
"1.234.567,89" → 1234567.89
"R$ 1,5 bi" → 1500000000
"12,34%" → 12.34
```

### Datas
```typescript
"31/03/2026" → string ISO ou Date
```

## 🔄 Rate Limiting

**IMPORTANTE**: O site pode bloquear IPs com muitas requisições.

### Delays Recomendados:
- **Coleta em massa**: 10 segundos entre requisições
- **Coleta única**: Sem delay
- **Retry após erro**: 1 minuto

```typescript
const DELAY_ENTRE_COLETAS = 10000; // 10 segundos
await new Promise(resolve => setTimeout(resolve, DELAY_ENTRE_COLETAS));
```

## 🛡️ Proteções Implementadas

1. **User-Agent real**: Para não parecer bot
2. **Timeout**: 30 segundos por requisição
3. **Retry**: Tenta 3x antes de falhar
4. **Encoding correto**: ISO-8859-1

## 🧪 Testando o Scraper

```bash
# Coletar dados de uma empresa
npm run scrape PETR4

# Coletar dados de várias
npm run scrape PETR4 VALE3 ITUB4
```

## 📝 Logs

Todo scraping gera logs na tabela `LogColeta`:
- **sucesso**: Dados coletados com sucesso
- **erro**: Erro na coleta
- **sem_dados**: Site não retornou dados

## 🚀 Melhorias Futuras

- [ ] Caching de dados para evitar coletas duplicadas no mesmo dia
- [ ] Proxy rotation para evitar bloqueios
- [ ] Scraping de mais indicadores (ROA, Margem Operacional)
- [ ] Notificações quando dados novos aparecerem

## 🔗 Dependências

```json
{
  "axios": "^1.6.0",    // Cliente HTTP
  "cheerio": "^1.0.0"   // Parser HTML
}
```

## ⚙️ Configuração

Alterar User-Agent se necessário:
```typescript
headers: {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...'
}
```

## 🐛 Debugging

Para ver o HTML coletado:
```typescript
console.log('HTML:', html);
console.log('Seletor encontrado:', $(seletor).html());
```

## ⚠️ Avisos Legais

- ⚠️ Respeite os Termos de Uso do Fundamentus
- ⚠️ Não faça scraping excessivo (máx 1 req/10s)
- ⚠️ Use apenas para fins educacionais
- ⚠️ O site pode mudar a estrutura HTML a qualquer momento
