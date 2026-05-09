# 📦 Importação em Massa de Empresas

Este script permite importar múltiplas empresas do arquivo `empresa.json` para o banco de dados.

## 🚀 Como Usar

### Opção 1: Apenas Cadastrar (Rápido - Recomendado)
Cadastra todas as empresas no banco sem coletar dados imediatamente:

```bash
npm run importar
```

**Vantagens:**
- ⚡ Extremamente rápido (segundos)
- ✅ Sem risco de bloqueio do site
- 🔄 Coleta automática agendada (9h e 18h)

### Opção 2: Cadastrar e Coletar (Lento)
Cadastra e coleta dados imediatamente com delay de 10s entre requisições:

```bash
npm run importar -- --coletar
```

**Atenção:**
- ⏱️ Demora ~33 minutos para 200 empresas
- 🐌 10 segundos de delay entre cada coleta
- ⚠️ Necessário para evitar bloqueio do site

## 📋 Formato do arquivo empresa.json

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
    "nome": "VALE S.A.",
    "setor": "Materiais Básicos",
    "subsetor": "Mineração"
  }
]
```

## 📊 Saída do Script

O script mostra:
- 📈 Barra de progresso em tempo real
- ✅ Status de cada empresa (cadastrada/já existe/coletada/erro)
- 📄 Relatório final salvo em `logs/importacao-TIMESTAMP.json`

### Exemplo de Saída:

```
🚀 Iniciando importação de empresas...

📋 200 empresas encontradas no arquivo

ℹ️  Modo: APENAS CADASTRO (rápido)

[██████████████████████████████] 100.0% | 200/200 | PETR4 - ✅ Cadastrada

╔════════════════════════════════════════╗
║     RESUMO DA IMPORTAÇÃO               ║
╠════════════════════════════════════════╣
║ Total de empresas:         200       ║
║ ✅ Cadastradas:             195       ║
║ 📊 Dados coletados:           0       ║
║ ⏭️  Já existiam:               5       ║
║ ❌ Erros:                     0       ║
╚════════════════════════════════════════╝

📄 Relatório salvo em: logs/importacao-2026-05-09.json
```

## 🔄 Coleta Automática

Após cadastrar as empresas, os dados serão coletados automaticamente:

- **Diariamente**: 9h e 18h (dados diários)
- **Trimestral**: Verifica a cada 3 horas quando não disponível

## 💡 Recomendação

1. **Primeiro**: Execute `npm run importar` (rápido)
2. **Depois**: Aguarde a coleta automática OU force coleta individual pela interface web
3. **Alternativa**: Use `npm run importar -- --coletar` se precisar dos dados imediatamente

## 📝 Logs

Todos os relatórios são salvos em `logs/importacao-TIMESTAMP.json` com:
- Lista de todas empresas processadas
- Status individual de cada uma
- Mensagens de erro (se houver)
- Estatísticas completas

## ⚠️ Importante

- ⏱️ Delay de 10 segundos entre coletas é obrigatório para evitar bloqueio
- 🔄 Empresas já cadastradas são ignoradas
- ✅ Empresas podem ser cadastradas com sucesso mesmo se a coleta falhar
- 📊 Coleta automática garantirá que todos os dados sejam obtidos eventualmente
