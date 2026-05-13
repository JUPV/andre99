# 🔄 Sistema de Coleta Automática Otimizado

## 📋 Visão Geral

O sistema de coleta automática foi **otimizado** para evitar requisições desnecessárias e respeitar os intervalos adequados de atualização de dados.

## ⏰ Regras de Coleta

### 📊 Dados Diários (Cotação e Indicadores)

**Frequência:** 1 vez por dia

**Intervalo:** 24 horas entre coletas bem-sucedidas

**Horários Agendados:**
- 🌅 **09:00** - Logo após abertura da bolsa
- 🌆 **18:00** - Após fechamento do mercado

**Dados Coletados:**
- Cotação atual
- P/L (Preço/Lucro)
- EV/EBITDA
- Valor de Mercado
- Valor da Firma
- Dividend Yield
- ROE (Return on Equity)
- ROIC (Return on Invested Capital)

### 📈 Dados Trimestrais (Balanços)

**Frequência:** 1 vez por trimestre

**Intervalo:** 90 dias entre coletas bem-sucedidas

**Verificação:** A cada 3 horas

**Dados Coletados:**
- Receita Líquida (3m e 12m)
- EBIT (3m e 12m)
- Lucro Líquido (3m e 12m)
- Data do último balanço processado

## 🔄 Lógica de Retry (Falhas)

Quando uma coleta **falha** ou os dados estão **indisponíveis**:

- ⏱️ **Nova tentativa:** A cada 3 horas
- 🎯 **Apenas empresas com falha:** Não tenta empresas que já tiveram sucesso
- ♾️ **Tentativas ilimitadas:** Continua tentando até obter sucesso

## 🚀 Inicialização do Sistema

### Antes (❌ Problema)
```
- Servidor inicia
- Aguarda 5 segundos
- Coleta TODAS as 220+ empresas
- Demora ~15 minutos
- Sobrecarga desnecessária
```

### Agora (✅ Otimizado)
```
- Servidor inicia
- Registra agendamentos
- Aguarda próximo horário agendado
- Coleta apenas no horário correto
- Respeita intervalos de 24h/90d
```

## 📊 Fluxo de Decisão

```
┌─────────────────────────┐
│  Horário Agendado?      │
└───────────┬─────────────┘
            │
            ↓
┌─────────────────────────┐
│  Listar Empresas Ativas │
└───────────┬─────────────┘
            │
            ↓
┌─────────────────────────┐
│  Para cada empresa:     │
│  - Buscar último log    │
└───────────┬─────────────┘
            │
            ↓
    ┌───────┴───────┐
    │  Último log?  │
    └───────┬───────┘
            │
    ┌───────┴───────────────────────────┐
    │                                   │
    ↓ NUNCA TENTOU                      ↓ JÁ TENTOU
┌─────────┐                    ┌────────────────┐
│ COLETAR │                    │ Verificar:     │
└─────────┘                    │ - Status       │
                               │ - Tempo        │
                               └────────┬───────┘
                                        │
                        ┌───────────────┴────────────────┐
                        │                                │
                        ↓ SUCESSO                        ↓ FALHA
              ┌──────────────────┐            ┌──────────────────┐
              │ Passou intervalo?│            │ Passou 3 horas?  │
              │ - Diário: 24h    │            │ SIM → COLETAR    │
              │ - Trimestre: 90d │            │ NÃO → PULAR      │
              │ SIM → COLETAR    │            └──────────────────┘
              │ NÃO → PULAR      │
              └──────────────────┘
```

## 🎮 Coleta Manual

### Na Interface Web

Na página de **Detalhes da Empresa**, há 3 botões:

1. **📊 Atualizar Diário**
   - Força coleta de dados diários (cotação, indicadores)
   - Ignora intervalo de 24h
   - Útil para dados em tempo real

2. **📈 Atualizar Trimestral**
   - Força coleta de dados trimestrais (balanços)
   - Ignora intervalo de 90 dias
   - Útil quando um novo trimestre é divulgado

3. **🔄 Atualizar Tudo**
   - Força coleta de ambos os tipos
   - Atualização completa

**Acesso:** `http://localhost:3000/empresa-detalhes.html?codigo=PETR4`

### Via API

```bash
# Coletar dados de uma empresa específica
POST /api/coleta/executar
Content-Type: application/json

{
  "tipo": "ambos",       # "diario", "trimestral" ou "ambos"
  "codigo": "PETR4"       # Código da empresa
}
```

**Exemplos:**

```bash
# PowerShell - Coletar dados diários de PETR4
Invoke-RestMethod -Uri "http://localhost:3000/api/coleta/executar" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"tipo":"diario","codigo":"PETR4"}'

# PowerShell - Coletar ambos de VALE3
Invoke-RestMethod -Uri "http://localhost:3000/api/coleta/executar" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"tipo":"ambos","codigo":"VALE3"}'
```

## 📊 Monitoramento

### Ver Logs de Coleta

**Endpoint:** `GET /api/coleta/logs`

**Parâmetros:**
- `limite` (opcional): Número de registros (padrão: 100)

**Exemplo:**
```
GET http://localhost:3000/api/coleta/logs?limite=50
```

### Ver Logs de Empresa Específica

**Endpoint:** `GET /api/coleta/logs/:codigo`

**Parâmetros:**
- `tipo` (opcional): "diario" ou "trimestral"
- `limite` (opcional): Número de registros (padrão: 20)

**Exemplo:**
```
GET http://localhost:3000/api/coleta/logs/PETR4?tipo=diario&limite=10
```

## 📈 Estatísticas do Sistema

### Status de Coleta

Os logs registram:
- ✅ **sucesso** - Dados coletados e salvos
- ❌ **erro** - Falha na coleta (rede, parsing, etc)
- ⚠️ **dados_indisponiveis** - Site sem dados no momento

### Campos do Log

```typescript
{
  id: number
  empresaId: number
  tipoColeta: 'diario' | 'trimestral'
  status: 'sucesso' | 'erro' | 'dados_indisponiveis'
  mensagem: string | null
  dataReferencia: string | null  // Data dos dados coletados
  tentativaEm: Date              // Timestamp da tentativa
}
```

## ⚙️ Configuração

### Arquivo: `src/services/coleta-automatica.ts`

**Agendamentos (cron):**

```typescript
// Dados diários às 9h
cron.schedule('0 9 * * *', coletarDadosDiarios);

// Dados diários às 18h  
cron.schedule('0 18 * * *', coletarDadosDiarios);

// Verificação trimestral a cada 3h
cron.schedule('0 */3 * * *', verificarEColetarTrimestrais);
```

**Intervalos:**

```typescript
// Em src/database/repositories.ts

// Dados diários: 24 horas
if (tipoColeta === 'diario') {
  return horasDesdeUltimaTentativa >= 24;
}

// Dados trimestrais: 90 dias
if (tipoColeta === 'trimestral') {
  return horasDesdeUltimaTentativa >= (90 * 24);
}

// Retry de falhas: 3 horas
return horasDesdeUltimaTentativa >= 3;
```

## 🔧 Modificando Intervalos

Para ajustar os intervalos, edite o arquivo:
`src/database/repositories.ts`

**Exemplo - Mudar dados diários para 12 horas:**

```typescript
if (tipoColeta === 'diario') {
  return horasDesdeUltimaTentativa >= 12; // Era 24
}
```

**Exemplo - Mudar retry para 1 hora:**

```typescript
// Retry de falhas
return horasDesdeUltimaTentativa >= 1; // Era 3
```

## 💡 Boas Práticas

### ✅ FAÇA

- Use coleta manual para dados urgentes
- Monitore logs para identificar empresas com problemas
- Verifique status "dados_indisponiveis" - pode ser fim de semana
- Aguarde pelo menos 5 segundos após forçar coleta

### ❌ NÃO FAÇA

- Não force coleta em massa de muitas empresas
- Não modifique o código para coletar mais frequentemente
- Não desative os intervalos de segurança
- Não execute coletas em loop manualmente

## 🐛 Troubleshooting

### Problema: Empresa não atualiza

**Possíveis causas:**
1. Dados ainda não disponíveis no site (verificar Fundamentus)
2. Aguardando intervalo de 24h/90d
3. Último status foi "dados_indisponiveis"

**Solução:**
- Use o botão "🔄 Atualizar Tudo" no perfil da empresa
- Verifique os logs: `/api/coleta/logs/CODIGO`

### Problema: Muitas falhas

**Possíveis causas:**
1. Site Fundamentus fora do ar
2. Estrutura HTML do site mudou
3. Timeout de rede

**Solução:**
- Aguarde retry automático (a cada 3h)
- Verifique se o site está acessível: https://fundamentus.com.br
- Verifique logs do servidor

### Problema: Coleta não executou no horário

**Possíveis causas:**
1. Servidor foi reiniciado próximo ao horário agendado
2. Coleta anterior ainda em execução

**Solução:**
- Aguarde próximo horário agendado
- Use coleta manual via API se urgente

## 📚 Arquivos Relacionados

- `src/services/coleta-automatica.ts` - Agendamento e lógica principal
- `src/database/repositories.ts` - Lógica de intervalos
- `src/scrapers/fundamentus-scraper.ts` - Scraper do site
- `public/empresa-detalhes.html` - Interface com botões
- `public/empresa-detalhes.js` - Lógica dos botões

## 🎯 Resumo

| Tipo | Frequência | Intervalo Sucesso | Intervalo Falha | Horários |
|------|-----------|-------------------|-----------------|----------|
| **Diário** | 2x/dia | 24 horas | 3 horas | 09:00, 18:00 |
| **Trimestral** | A cada 3h | 90 dias | 3 horas | */3 horas |

**Coleta Manual:** Sempre disponível, ignora intervalos

---

✅ **Sistema otimizado e funcionando corretamente!**
