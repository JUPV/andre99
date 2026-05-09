# Fundamentus Scraper

Sistema para coletar e visualizar dados de empresas do site Fundamentus.

## Estrutura do Projeto

- `prisma/` - Schema do Prisma para o banco de dados
- `src/database/` - Configuração do Prisma e repositories
- `src/scrapers/` - Scripts de coleta de dados
- `src/routes/` - Rotas da API
- `public/` - Arquivos estáticos (HTML, CSS, JS)

## Instalação

```bash
npm install
```

## Configuração do Banco de Dados

### Gerar cliente Prisma
```bash
npm run db:generate
```

### Sincronizar schema com o banco
```bash
npm run db:push
```

### Abrir Prisma Studio (interface visual)
```bash
npm run db:studio
```

## Uso

### Iniciar servidor
```bash
npm run dev
```

### Coletar dados
```bash
npm run scrape PETR4 VALE3 ITUB4
```

### Acessar visualização
Abra o navegador em: http://localhost:3000

## Estrutura do Banco de Dados (Prisma)

### Model: Empresa
Cadastro de empresas a serem monitoradas

### Model: DadosTrimestral
Receita Líquida, EBIT e Lucro Líquido (últimos 3 e 12 meses)

### Model: DadosDiario
Cotação, P/L, EV/EBITDA diários

## Tecnologias

- **Backend**: Node.js + TypeScript + Express
- **ORM**: Prisma
- **Database**: SQLite
- **Scraping**: Axios + Cheerio
- **Frontend**: HTML + JavaScript (Vanilla)
