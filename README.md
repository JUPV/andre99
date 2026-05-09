# 📊 Fundamentus Scraper - Sistema de Análise de Ações

Sistema completo para coletar, armazenar e visualizar dados fundamentalistas de empresas da bolsa de valores brasileira (B3), extraídos do site Fundamentus.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Uso do Sistema](#-uso-do-sistema)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [API Endpoints](#-api-endpoints)
- [Coleta Automática](#-coleta-automática)
- [Importação em Massa](#-importação-em-massa)
- [Páginas Web](#-páginas-web)
- [Banco de Dados](#-banco-de-dados)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Sobre o Projeto

O **Fundamentus Scraper** é um sistema completo que automatiza a coleta de dados fundamentalistas de empresas brasileiras, permitindo análise e comparação de indicadores financeiros de forma simples e intuitiva.

### O que o sistema faz?

1. **Coleta dados** do site Fundamentus.com.br (preços, indicadores, balanços)
2. **Armazena** em banco de dados local (SQLite)
3. **Disponibiliza** através de uma API REST
4. **Visualiza** em dashboards modernos e interativos
5. **Atualiza** automaticamente nos horários programados

### Para quem é este projeto?

- 📈 **Investidores** que desejam acompanhar empresas da bolsa
- 💼 **Analistas financeiros** que precisam comparar indicadores
- 👨‍💻 **Desenvolvedores** que querem aprender sobre web scraping
- 📊 **Estudantes** de programação e finanças

---

## ✨ Funcionalidades

### 🔍 Coleta de Dados
- ✅ Coleta automática de dados trimestrais e diários
- ✅ Importação em massa de até 200 empresas
- ✅ Rate limiting para evitar bloqueios do site
- ✅ Sistema de retry inteligente
- ✅ Logs detalhados de cada coleta

### 📊 Visualização
- ✅ Dashboard principal com gráficos interativos
- ✅ Página de comparativo trimestral
- ✅ Detalhes completos de cada empresa
- ✅ Histórico de cotações e indicadores
- ✅ Filtros por setor, métrica e período
- ✅ Exportação de dados em CSV
- ✅ Menu lateral retrátil para mais espaço

### 🔄 Automação
- ✅ Coleta automática às 9h e 18h (horários pós-pregão)
- ✅ Verificação trimestral a cada 3 horas
- ✅ Atualização automática de dados desatualizados
- ✅ Sistema de notificação de erros

### 📱 Interface
- ✅ Design profissional dark theme
- ✅ Responsivo para mobile e desktop
- ✅ Gráficos interativos com Chart.js
- ✅ Tabelas com sticky headers
- ✅ Navegação intuitiva

---

## 🛠 Tecnologias Utilizadas

### Backend
- **Node.js** (v24.11.0) - Runtime JavaScript
- **TypeScript** (v5.3.3) - Tipagem estática
- **Express.js** (v4.18.2) - Framework web
- **Prisma ORM** (v5.11.0) - ORM para banco de dados
- **SQLite** - Banco de dados local

### Web Scraping
- **Axios** (v1.6.0) - Cliente HTTP
- **Cheerio** (v1.0.0) - Parser HTML (jQuery-like)
- **Text Decoder** - Tratamento de encoding ISO-8859-1

### Frontend
- **HTML5/CSS3/JavaScript** - Interface web
- **Chart.js** (v4.4.0) - Gráficos interativos
- **Vanilla JS** - Sem frameworks pesados

### Automação
- **node-cron** (v3.0.3) - Agendamento de tarefas

---

## 📋 Pré-requisitos

Antes de começar, você precisa ter instalado em sua máquina:

### Obrigatório:
- **Node.js** versão 18.0 ou superior
  - [Download Node.js](https://nodejs.org/)
  - Verificar versão: `node --version`

### Opcional (mas recomendado):
- **Git** para clonar o repositório
  - [Download Git](https://git-scm.com/)
- **VS Code** como editor de código
  - [Download VS Code](https://code.visualstudio.com/)

### Conhecimentos necessários:
- **Iniciante**: Apenas saber abrir o terminal/prompt de comando
- **Intermediário**: Entender conceitos básicos de API REST
- **Avançado**: Conhecimento em TypeScript e Prisma para modificações

---

## 🚀 Instalação

### Passo 1: Obter o código

Se você tem Git instalado:
```bash
git clone <url-do-repositorio>
cd Andre
```

Ou baixe o ZIP e extraia em uma pasta de sua preferência.

### Passo 2: Instalar dependências

Abra o terminal/prompt na pasta do projeto e execute:

```bash
npm install
```

Este comando irá baixar e instalar todas as bibliotecas necessárias (~150 pacotes). Aguarde alguns minutos.

### Passo 3: Configurar o banco de dados

Execute os comandos na ordem:

```bash
# Gerar o cliente Prisma (necessário sempre)
npm run db:generate

# Criar as tabelas no banco de dados
npm run db:push
```

### Passo 4: Verificar instalação

Teste se está tudo funcionando:

```bash
npm run dev
```

Se aparecer a mensagem:
```
🚀 Servidor rodando em http://localhost:3000
📊 Dashboard: http://localhost:3000/dashboard.html
🔌 API: http://localhost:3000/api/empresas
```

**Parabéns! 🎉 A instalação foi concluída com sucesso!**

---

## 💻 Uso do Sistema

### Iniciando o servidor

```bash
npm run dev
```

O servidor ficará rodando em `http://localhost:3000`

**Deixe esta janela do terminal aberta enquanto usa o sistema!**

### Acessando as páginas

Abra seu navegador e acesse:

1. **Dashboard Principal**: http://localhost:3000/dashboard.html
   - Visão geral com gráficos
   - Cards de estatísticas
   - Tabela comparativa

2. **Comparativo Trimestral**: http://localhost:3000/comparativo.html
   - Análise trimestral completa
   - Variações percentuais
   - Filtros por setor e métrica
   - Exportação CSV

3. **Lista de Empresas**: http://localhost:3000/empresas.html
   - CRUD completo
   - Filtros e pesquisa
   - Ativar/desativar empresas

4. **Detalhes da Empresa**: http://localhost:3000/empresa-detalhes.html?codigo=PETR4
   - Gráficos históricos
   - Dados trimestrais
   - Indicadores diários
   - Forçar atualização

5. **Status de Coletas**: http://localhost:3000/status-coletas.html
   - Timeline de coletas
   - Logs de erro
   - Próximas execuções

6. **Cadastro**: http://localhost:3000/cadastro.html
   - Adicionar novas empresas
   - Editar existentes

---

## 📦 Estrutura do Projeto

```
Andre/
├── prisma/
│   ├── schema.prisma          # Schema do banco de dados
│   └── fundamentus.db         # Banco SQLite (gerado automaticamente)
│
├── src/
│   ├── database/
│   │   ├── prisma.ts          # Configuração do Prisma
│   │   └── repositories.ts    # Funções de acesso ao BD
│   │
│   ├── scrapers/
│   │   └── fundamentus-scraper.ts  # Lógica de web scraping
│   │
│   ├── services/
│   │   └── coleta-automatica.ts    # Agendamento automático
│   │
│   ├── routes/
│   │   └── api.ts             # Endpoints da API REST
│   │
│   ├── scripts/
│   │   ├── importar-empresas.ts    # Importação em massa
│   │   └── coletar-todas.ts        # Coleta manual de todas
│   │
│   └── index.ts               # Servidor Express
│
├── public/                    # Arquivos da interface web
│   ├── styles.css             # Estilos globais (dark theme)
│   ├── dashboard.html/js      # Dashboard principal
│   ├── comparativo.html/js    # Página de comparativos
│   ├── empresas.html          # Lista de empresas
│   ├── empresa-detalhes.html/js  # Detalhes de empresa
│   ├── status-coletas.html    # Status de coletas
│   ├── cadastro.html          # Cadastro de empresas
│   └── index.html             # Redirecionador inteligente
│
├── logs/                      # Logs de importação (gerado automaticamente)
├── empresa.json               # Lista de empresas para importar
├── package.json               # Dependências do projeto
├── tsconfig.json              # Configuração TypeScript
└── README.md                  # Este arquivo
```

---

## 🔌 API Endpoints

### Empresas

```http
GET /api/empresas
```
Lista todas as empresas cadastradas

```http
GET /api/empresas/:codigo
```
Busca uma empresa pelo código (ex: PETR4)

```http
POST /api/empresas
```
Cadastra uma nova empresa
```json
{
  "codigo": "PETR4",
  "nome": "PETROBRAS PN",
  "setor": "Petróleo, Gás e Biocombustíveis",
  "subsetor": "Exploração, Refino e Distribuição"
}
```

```http
PUT /api/empresas/:codigo
```
Atualiza dados de uma empresa

```http
DELETE /api/empresas/:codigo
```
Remove uma empresa

### Dados

```http
GET /api/empresas/:codigo/trimestrais
```
Retorna dados trimestrais de uma empresa

```http
GET /api/empresas/:codigo/diarios
```
Retorna dados diários de uma empresa

```http
GET /api/empresas/:codigo/resumo
```
Retorna resumo completo (empresa + último trimestre + último diário + histórico)

```http
GET /api/empresas/:codigo/detalhes-completos
```
Retorna detalhes completos com histórico e variações

### Coleta

```http
POST /api/coleta/executar
```
Força a coleta de dados de uma empresa
```json
{
  "codigo": "PETR4"
}
```

```http
GET /api/coleta/logs
```
Retorna logs de coletas

### Dashboard

```http
GET /api/dashboard/comparacao-trimestral
```
Retorna dados para comparação trimestral (últimas 10 empresas)

```http
GET /api/comparativo-trimestral
```
Retorna comparativo completo de todas as empresas com dados organizados por trimestre

---

## ⏰ Coleta Automática

O sistema possui coleta automática configurada:

### Coleta Diária
- **Horários**: 09:00 e 18:00 (após fechamento do pregão)
- **Função**: Atualiza cotações e indicadores de todas as empresas ativas
- **Duração**: ~15 minutos para 100 empresas

### Verificação Trimestral
- **Frequência**: A cada 3 horas
- **Função**: Verifica se há novos balanços trimestrais
- **Lógica**: Só coleta se passaram mais de 3 horas desde a última tentativa

### Desabilitar coleta automática

Edite o arquivo `src/index.ts` e comente a linha:

```typescript
// iniciarColetaAutomatica();
```

---

## 📥 Importação em Massa

O sistema permite importar várias empresas de uma vez usando o arquivo `empresa.json`.

### Formato do arquivo empresa.json

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

### Modo 1: Apenas Cadastro (Rápido)

```bash
npm run importar
```

- **Velocidade**: ~1 segundo por empresa
- **Função**: Apenas cadastra no banco, não coleta dados
- **Uso**: Quando quer apenas registrar as empresas

### Modo 2: Cadastro + Coleta (Lento)

```bash
npm run importar -- --coletar
```

- **Velocidade**: ~10 segundos por empresa (devido ao delay anti-bloqueio)
- **Função**: Cadastra E coleta todos os dados do site
- **Duração**: ~33 minutos para 200 empresas
- **Uso**: Primeira importação ou atualização completa

### Entendendo os delays

```typescript
DELAY_ENTRE_COLETAS = 10000  // 10 segundos entre cada empresa
DELAY_APENAS_CADASTRO = 100  // 100ms apenas para cadastro
```

Estes delays **são necessários** para evitar bloqueio pelo site Fundamentus.

---

## 🗄 Banco de Dados

### Tecnologia
- **SQLite** - Banco de dados local em arquivo
- **Localização**: `prisma/fundamentus.db`
- **Vantagens**: 
  - Não precisa instalar servidor de banco
  - Arquivo único e portátil
  - Rápido para médio volume de dados

### Estrutura (4 tabelas)

#### 1. Empresa
- Código, nome, setor, subsetor
- Status ativo/inativo
- Datas de criação e atualização

#### 2. DadosTrimestral
- Dados de balanços trimestrais
- Receita, EBIT, Lucro (3M e 12M)
- Referência da data do balanço

#### 3. DadosDiario
- Cotação e indicadores diários
- P/L, EV/EBITDA, ROE, ROIC
- Valor de mercado e firma

#### 4. LogColeta
- Histórico de tentativas de coleta
- Status (sucesso/erro/sem_dados)
- Logs de debugging

### Visualizar Banco de Dados

Para abrir uma interface visual do banco:

```bash
npm run db:studio
```

Abrirá o Prisma Studio em http://localhost:5555

---

## 🔧 Troubleshooting

### Problema: Porta 3000 já está em uso

**Erro:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solução:**

Windows (PowerShell):
```powershell
Get-Process -Name node | Stop-Process -Force
```

Linux/Mac:
```bash
killall node
```

### Problema: Erro ao instalar dependências

**Solução:**
```bash
npm cache clean --force
npm install
```

### Problema: Site Fundamentus bloqueou o IP

**Sintomas:**
- Coletas retornam "sem dados"
- Muitas empresas com erro "Cotação não disponível"

**Solução:**
1. Aguarde algumas horas antes de nova coleta
2. Aumente o delay entre coletas para 15 segundos

### Problema: Dados não aparecem no Dashboard

**Solução:**
```bash
# Verifique se há empresas cadastradas
npm run db:studio

# Se não houver dados, importe e colete:
npm run importar -- --coletar
```

### Problema: Erro "Cannot find module '@prisma/client'"

**Solução:**
```bash
npm run db:generate
npm install
```

---

## 📚 Conceitos para Iniciantes

### O que é Web Scraping?

Web scraping é a técnica de extrair dados de sites automaticamente. É como um robô que:
1. Acessa uma página web
2. Lê o HTML
3. Extrai as informações desejadas
4. Salva em banco de dados

### O que é uma API REST?

API REST é uma forma de um programa conversar com outro através da internet usando HTTP (mesmo protocolo do navegador).

Exemplo:
- `GET /api/empresas` = "Me dê a lista de empresas"
- `POST /api/empresas` = "Cadastre esta empresa"
- `DELETE /api/empresas/PETR4` = "Delete a empresa PETR4"

### O que é TypeScript?

TypeScript é JavaScript com "tipos". Ajuda a evitar erros:

```typescript
// TypeScript - detecta o erro
let preco: number = 100;
preco = "100"; // ERRO! preco deve ser number
```

### O que é ORM (Prisma)?

ORM significa "Object-Relational Mapping". Em vez de escrever SQL:

```sql
SELECT * FROM empresas WHERE codigo = 'PETR4'
```

Você escreve TypeScript:

```typescript
await prisma.empresa.findUnique({
  where: { codigo: 'PETR4' }
})
```

---

## ⚠️ Avisos Importantes

### Legal
- ⚠️ Este projeto é apenas para fins educacionais
- ⚠️ Respeite os Termos de Uso do site Fundamentus
- ⚠️ Não use para fins comerciais sem autorização
- ⚠️ Não faça scraping excessivo (respeite os delays)

### Financeiro
- ⚠️ Os dados são fornecidos "como estão"
- ⚠️ Não é recomendação de investimento
- ⚠️ Sempre consulte um profissional certificado
- ⚠️ Investimentos envolvem riscos

### Técnico
- ⚠️ O site Fundamentus pode mudar e quebrar o scraper
- ⚠️ Rate limiting é essencial para não ser bloqueado
- ⚠️ Faça backups regulares do banco de dados
- ⚠️ Teste em ambiente local antes de produção

---

## 📊 Status do Projeto

- ✅ Versão 1.0.0 - Sistema completo funcional
- ✅ 106 empresas importadas
- ✅ Coleta automática implementada
- ✅ Dashboard profissional
- ✅ Comparativo trimestral
- ✅ Sistema de logs

---

**Desenvolvido com ❤️ por investidores para investidores**

**⭐ Se este projeto te ajudou, deixe uma estrela no GitHub!**

---

*Última atualização: Maio de 2026*

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
