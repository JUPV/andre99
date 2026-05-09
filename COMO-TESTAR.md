# 🤖 Sistema de Coleta Automática

## ✅ Implementado com Sucesso!

### 📋 O que foi feito:

1. **✅ Corrigido erro TypeScript** - Alterado `moduleResolution` para `bundler`
2. **✅ Nova tabela LogColeta** - Histórico completo de tentativas
3. **✅ Sistema inteligente de coleta**:
   - Verifica se dados já estão atualizados
   - Retenta após 3 horas se dados indisponíveis
   - Detecta automaticamente novos trimestres
4. **✅ Agendamento automático**:
   - Dados diários: 09:00 e 18:00
   - Dados trimestrais: a cada 3 horas
5. **✅ API de controle e monitoramento**

---

## 🚀 Como Testar

### 1. Servidor está rodando em:
```
http://localhost:3000
```

### 2. Adicionar mais empresas:
```bash
# Via interface web
Acesse: http://localhost:3000
Clique em "➕ Nova Empresa"

# Ou via API
curl -X POST http://localhost:3000/api/empresas \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "VALE3",
    "nome": "VALE S.A.",
    "setor": "Mineração"
  }'
```

### 3. Executar coleta manual:
```bash
# Coletar dados específicos
npm run scrape VALE3 ITUB4 BBDC4

# Ou via API
curl -X POST http://localhost:3000/api/coleta/executar \
  -H "Content-Type: application/json" \
  -d '{"tipo": "ambos"}'
```

### 4. Ver logs de coleta:
```bash
# Todos os logs
curl http://localhost:3000/api/coleta/logs

# Logs da PETR4
curl http://localhost:3000/api/coleta/logs/PETR4

# Ou via Prisma Studio
npm run db:studio
# Acesse a tabela: logs_coleta
```

---

## 📊 Como o Sistema Funciona

### Dados Diários:
1. **09:00** - Primeira coleta (após abertura do mercado)
2. **18:00** - Segunda coleta (após fechamento)
3. Verifica se já coletou no dia antes de coletar novamente
4. Se cotação não disponível, registra e tenta na próxima execução

### Dados Trimestrais:
1. **A cada 3 horas** - Verifica se há novos dados
2. Compara data do balanço com último registro
3. Se dados não disponíveis, aguarda 3 horas para retentar
4. Mantém histórico completo de todos os trimestres

### Status dos Logs:
- `sucesso` - Dados coletados com sucesso
- `dados_indisponiveis` - Dados não publicados ainda (retenta em 3h)
- `erro` - Erro na coleta (retenta em 3h)

---

## 🔍 Verificar Status Atual

```bash
# Ver dados coletados da PETR4
curl http://localhost:3000/api/empresas/PETR4/resumo

# Ver histórico de tentativas
curl http://localhost:3000/api/coleta/logs/PETR4

# Ver todas as empresas
curl http://localhost:3000/api/empresas
```

---

## 📈 Próximos Passos Sugeridos

### 1. Adicionar empresas:
```bash
npm run scrape VALE3 ITUB4 BBDC4 ABEV3 MGLU3 BBAS3 PETR3
```

### 2. Acompanhar logs no terminal:
O servidor mostra em tempo real:
- ✓ Dados coletados com sucesso
- ⚠️ Dados não disponíveis
- ✗ Erros na coleta

### 3. Acessar interface web:
```
http://localhost:3000
```
- Visualizar gráficos
- Comparar empresas
- Ver histórico trimestral

---

## 🐛 Observações Importantes

### Por que cotação está em 0?
O site pode retornar dados incompletos dependendo do horário:
- Fora do horário de negociação (9h-18h)
- Finais de semana e feriados
- Site em manutenção

**Solução**: O sistema retentará automaticamente nos horários programados.

### Por que data_balanco está vazia?
Dados trimestrais são publicados após o fechamento do trimestre:
- Geralmente 30-45 dias após o período
- Q1 (jan-mar): publicado em abril/maio
- Q2 (abr-jun): publicado em julho/agosto
- Q3 (jul-set): publicado em outubro/novembro
- Q4 (out-dez): publicado em janeiro/fevereiro

**Solução**: O sistema verifica a cada 3 horas até os dados serem publicados.

---

## 📱 Endpoints da API

### Empresas:
- `GET /api/empresas` - Listar todas
- `POST /api/empresas` - Criar nova
- `GET /api/empresas/:codigo` - Buscar por código
- `GET /api/empresas/:codigo/resumo` - Dados completos

### Coleta Automática:
- `POST /api/coleta/executar` - Executar manualmente
- `GET /api/coleta/logs` - Ver histórico
- `GET /api/coleta/logs/:codigo` - Logs de empresa específica

---

## 🎯 Exemplo Prático

```bash
# 1. Adicionar empresa
curl -X POST http://localhost:3000/api/empresas \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "VALE3",
    "nome": "VALE S.A.",
    "setor": "Mineração",
    "subsetor": "Minerais Metálicos"
  }'

# 2. Coletar dados imediatamente
curl -X POST http://localhost:3000/api/coleta/executar \
  -H "Content-Type: application/json" \
  -d '{"tipo": "ambos"}'

# 3. Aguardar alguns segundos...

# 4. Ver resultado
curl http://localhost:3000/api/empresas/VALE3/resumo

# 5. Ver logs
curl http://localhost:3000/api/coleta/logs/VALE3
```

---

## ✨ Resultado Esperado

Após algumas horas/dias de funcionamento, você terá:

1. **Histórico completo** de cotações diárias
2. **Todos os trimestres** salvos automaticamente
3. **Logs detalhados** de cada tentativa de coleta
4. **Dados sempre atualizados** sem intervenção manual
5. **Base para análises** e comparações de performance

---

## 🛠️ Manutenção

### Ver banco de dados:
```bash
npm run db:studio
```

### Limpar logs antigos (se necessário):
```sql
-- No Prisma Studio, executar:
DELETE FROM logs_coleta WHERE tentativa_em < datetime('now', '-30 days');
```

### Backup do banco:
```bash
# Windows
copy fundamentus.db fundamentus_backup.db

# O banco está em: c:\www\Andre\fundamentus.db
```

---

**Sistema funcionando! 🎉**

Deixe rodando e acompanhe os logs. O sistema coletará dados automaticamente nos horários programados.
