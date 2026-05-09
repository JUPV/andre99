import db from './connection';

export function initDatabase() {
  console.log('Inicializando banco de dados...');

  // Tabela de empresas cadastradas
  db.exec(`
    CREATE TABLE IF NOT EXISTS empresas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT NOT NULL UNIQUE,
      nome TEXT NOT NULL,
      setor TEXT,
      subsetor TEXT,
      ativo INTEGER DEFAULT 1,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela de dados trimestrais
  db.exec(`
    CREATE TABLE IF NOT EXISTS dados_trimestrais (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      empresa_id INTEGER NOT NULL,
      data_balanco DATE NOT NULL,
      
      -- Últimos 3 meses
      receita_liquida_3m REAL,
      ebit_3m REAL,
      lucro_liquido_3m REAL,
      
      -- Últimos 12 meses
      receita_liquida_12m REAL,
      ebit_12m REAL,
      lucro_liquido_12m REAL,
      
      coletado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
      UNIQUE(empresa_id, data_balanco)
    )
  `);

  // Tabela de dados diários
  db.exec(`
    CREATE TABLE IF NOT EXISTS dados_diarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      empresa_id INTEGER NOT NULL,
      data DATE NOT NULL,
      
      cotacao REAL,
      pl REAL,
      ev_ebitda REAL,
      
      -- Dados complementares
      valor_mercado REAL,
      valor_firma REAL,
      div_yield REAL,
      roe REAL,
      roic REAL,
      
      coletado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
      UNIQUE(empresa_id, data)
    )
  `);

  // Índices para melhor performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_dados_trimestrais_empresa 
    ON dados_trimestrais(empresa_id, data_balanco DESC);
    
    CREATE INDEX IF NOT EXISTS idx_dados_diarios_empresa 
    ON dados_diarios(empresa_id, data DESC);
  `);

  console.log('Banco de dados inicializado com sucesso!');
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  initDatabase();
  process.exit(0);
}
