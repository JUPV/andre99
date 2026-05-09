# 📚 Índice de Documentação - Fundamentus Scraper

## 🎯 Para Inteligências Artificiais

**🔴 LEIA PRIMEIRO:** [`IA-CONTEXT.md`](IA-CONTEXT.md)

Este é o arquivo principal que toda IA deve ler antes de modificar qualquer código. Contém:
- Regras críticas do projeto
- Padrões de código
- Fluxos principais
- Checklist antes de commitar

---

## 📖 Documentação Principal

### [`README.md`](README.md)
**Documentação completa do projeto** para desenvolvedores e usuários.

**Contém:**
- Instalação passo a passo
- Uso do sistema
- API endpoints documentados
- Troubleshooting
- Conceitos para iniciantes

---

## 📁 Documentação por Pasta

### Backend (src/)

#### [`src/database/CONTEXT.md`](src/database/CONTEXT.md)
**Camada de Banco de Dados**

**Tópicos:**
- Repository Pattern
- Uso do Prisma ORM
- Relacionamentos entre tabelas
- Null safety e BigInt serialization
- Convenções de nomenclatura (camelCase vs snake_case)

#### [`src/scrapers/CONTEXT.md`](src/scrapers/CONTEXT.md)
**Web Scraping do Fundamentus**

**Tópicos:**
- 🔴 Encoding ISO-8859-1 (CRÍTICO!)
- Parsing de HTML com Cheerio
- Seletores CSS usados
- Rate limiting (delays de 10s)
- Tratamento de erros
- Formatos de dados

#### [`src/services/CONTEXT.md`](src/services/CONTEXT.md)
**Serviços e Automação**

**Tópicos:**
- Coleta automática (cron jobs)
- Horários programados (9h, 18h, 3h em 3h)
- Lógica de retry inteligente
- Sistema de logs
- Controle de empresas ativas

#### [`src/routes/CONTEXT.md`](src/routes/CONTEXT.md)
**API REST Endpoints**

**Tópicos:**
- Todos os 20+ endpoints documentados
- Request/Response examples
- Padrões de código (async/await, try/catch)
- Validação e segurança
- Performance (evitar N+1 queries)

#### [`src/scripts/CONTEXT.md`](src/scripts/CONTEXT.md)
**Scripts Utilitários**

**Tópicos:**
- Importação em massa de empresas
- Coleta manual de dados
- Rate limiting (10s entre empresas)
- Relatórios JSON
- Progress bars

---

### Frontend (public/)

#### [`public/CONTEXT.md`](public/CONTEXT.md)
**Interface Web**

**Tópicos:**
- Design system (dark theme)
- Componentes CSS
- 7 páginas documentadas
- Integração com API (fetch)
- Chart.js para gráficos
- Toggle menu e responsividade

---

### Database (prisma/)

#### [`prisma/CONTEXT.md`](prisma/CONTEXT.md)
**Schema do Banco de Dados**

**Tópicos:**
- 4 modelos (Empresa, DadosTrimestral, DadosDiario, LogColeta)
- Relacionamentos e constraints
- Comandos Prisma (generate, push, studio)
- Queries comuns
- Migrations e backups

---

## 🚀 Quick Start para IAs

### 1. Contexto Geral
Leia: [`IA-CONTEXT.md`](IA-CONTEXT.md)

### 2. Entenda a Arquitetura
Leia: [`README.md`](README.md) (seção "Estrutura do Projeto")

### 3. Antes de Modificar uma Pasta
Leia o `CONTEXT.md` específico da pasta:
- Modificando database? → [`src/database/CONTEXT.md`](src/database/CONTEXT.md)
- Modificando scraper? → [`src/scrapers/CONTEXT.md`](src/scrapers/CONTEXT.md)
- Modificando API? → [`src/routes/CONTEXT.md`](src/routes/CONTEXT.md)
- Etc.

### 4. Siga as Regras Críticas
```
🔴 Encoding ISO-8859-1 no scraper
🔴 Rate limiting de 10s
🔴 Usar repositories, não prisma direto
🔴 Null safety em todos os campos nullable
🔴 Converter BigInt para Number antes de JSON
```

---

## 📋 Outros Documentos

### [`IMPORTACAO.md`](IMPORTACAO.md)
Guia detalhado sobre importação em massa de empresas.

### Arquivos de Status (históricos)
- `COMO-TESTAR.md` - Instruções de teste
- `INICIO-RAPIDO.md` - Guia rápido de início
- `RESUMO-FINAL.md` - Resumo de implementação
- `STATUS-SISTEMA.md` - Status geral do sistema

---

## 🎯 Fluxo de Trabalho Recomendado

Para adicionar uma nova funcionalidade:

```
1. ✅ Ler IA-CONTEXT.md
2. ✅ Ler README.md
3. ✅ Identificar pasta(s) afetada(s)
4. ✅ Ler CONTEXT.md da(s) pasta(s)
5. ✅ Entender código existente
6. ✅ Seguir padrões estabelecidos
7. ✅ Implementar com testes
8. ✅ Compilar (npm run build)
9. ✅ Testar localmente (npm run dev)
10. ✅ Atualizar documentação se necessário
```

---

## 🔍 Busca Rápida

**Precisa de:**

| O quê | Onde encontrar |
|-------|---------------|
| Regras gerais do projeto | `IA-CONTEXT.md` |
| Como instalar | `README.md` → Instalação |
| Como funciona o scraping | `src/scrapers/CONTEXT.md` |
| Como funciona coleta automática | `src/services/CONTEXT.md` |
| Lista de endpoints da API | `src/routes/CONTEXT.md` |
| Schema do banco de dados | `prisma/CONTEXT.md` |
| Componentes CSS | `public/CONTEXT.md` |
| Como importar empresas | `src/scripts/CONTEXT.md` |
| Queries do banco | `src/database/CONTEXT.md` |

---

## 📊 Estatísticas da Documentação

```
Total de arquivos CONTEXT.md: 8
Total de páginas documentadas: ~50 páginas
Cobertura: 100% do projeto
Última atualização: 09/05/2026
```

---

## 🆘 Suporte

Se a documentação não cobrir seu caso de uso:

1. Verifique o código existente para padrões similares
2. Consulte a documentação oficial das bibliotecas usadas
3. Mantenha consistência com o código existente
4. Documente suas decisões no código (comentários)
5. Atualize o CONTEXT.md relevante com novos padrões

---

## ✅ Qualidade da Documentação

Todos os arquivos CONTEXT.md incluem:

- ✅ Propósito claro da pasta/módulo
- ✅ Arquivos e suas funções
- ✅ Padrões de código
- ✅ Regras críticas destacadas
- ✅ Exemplos de uso
- ✅ Avisos e cuidados
- ✅ Problemas comuns e soluções
- ✅ Integração com outras partes
- ✅ Melhorias futuras

---

**Desenvolvido com ❤️ e muito ☕**

**Versão da Documentação:** 1.0.0

**Status:** ✅ Completo e atualizado
