-- CreateTable
CREATE TABLE "empresas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "setor" TEXT,
    "subsetor" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "dados_trimestrais" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "empresa_id" INTEGER NOT NULL,
    "data_balanco" TEXT NOT NULL,
    "ano" INTEGER,
    "trimestre" INTEGER,
    "receita_liquida_3m" REAL,
    "ebit_3m" REAL,
    "lucro_liquido_3m" REAL,
    "despesas" REAL,
    "margem_bruta" REAL,
    "margem_ebitda" REAL,
    "margem_ebit" REAL,
    "margem_liquida" REAL,
    "receita_liquida_12m" REAL,
    "ebit_12m" REAL,
    "lucro_liquido_12m" REAL,
    "coletado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "dados_trimestrais_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "dados_diarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "empresa_id" INTEGER NOT NULL,
    "data" TEXT NOT NULL,
    "cotacao" REAL,
    "pl" REAL,
    "ev_ebitda" REAL,
    "valor_mercado" REAL,
    "valor_firma" REAL,
    "div_yield" REAL,
    "roe" REAL,
    "roic" REAL,
    "coletado_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "dados_diarios_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "logs_coleta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "empresa_id" INTEGER NOT NULL,
    "tipo_coleta" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "mensagem" TEXT,
    "data_referencia" TEXT,
    "tentativa_em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "logs_coleta_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "empresas_codigo_key" ON "empresas"("codigo");

-- CreateIndex
CREATE INDEX "dados_trimestrais_empresa_id_data_balanco_idx" ON "dados_trimestrais"("empresa_id", "data_balanco");

-- CreateIndex
CREATE UNIQUE INDEX "dados_trimestrais_empresa_id_data_balanco_key" ON "dados_trimestrais"("empresa_id", "data_balanco");

-- CreateIndex
CREATE INDEX "dados_diarios_empresa_id_data_idx" ON "dados_diarios"("empresa_id", "data");

-- CreateIndex
CREATE UNIQUE INDEX "dados_diarios_empresa_id_data_key" ON "dados_diarios"("empresa_id", "data");

-- CreateIndex
CREATE INDEX "logs_coleta_empresa_id_tipo_coleta_tentativa_em_idx" ON "logs_coleta"("empresa_id", "tipo_coleta", "tentativa_em");
