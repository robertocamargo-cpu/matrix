/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Neon PostgreSQL Serverless Integration & Persistence Engine
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

let pool: Pool | null = null;

export function getDbPool(): Pool | null {
  const connectionString = 
    process.env.mtx_POSTGRES_URL || 
    process.env.mtx_DATABASE_URL || 
    process.env.mtx_POSTGRES_PRISMA_URL || 
    process.env.mtx_DATABASE_URL_UNPOOLED || 
    process.env.POSTGRES_URL || 
    process.env.DATABASE_URL || 
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING;

  if (!connectionString || connectionString.trim() === '') {
    return null;
  }

  if (!pool) {
    try {
      pool = new Pool({ connectionString: connectionString.trim() });
    } catch (e) {
      console.error("[Neon DB] Erro ao inicializar pool de conexão:", e);
      pool = null;
    }
  }

  return pool;
}

/**
 * Execute a SQL query safely against Neon PostgreSQL
 */
export async function query(text: string, params: any[] = []) {
  const activePool = getDbPool();
  if (!activePool) {
    throw new Error("Neon Database não configurado. Adicione a variável POSTGRES_URL nas configurações da Vercel ou no .env.");
  }
  const res = await activePool.query(text, params);
  return res;
}

/**
 * Auto-initialize database schema and tables if they do not exist
 */
export async function initializeDatabaseSchema() {
  const activePool = getDbPool();
  if (!activePool) {
    console.log("[Neon DB] Nenhuma conexão PostgreSQL encontrada. Executando em modo local.");
    return false;
  }

  try {
    console.log("[Neon DB] Verificando e criando tabelas no Neon PostgreSQL...");

    // 1. Leads table
    await activePool.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id VARCHAR(100) PRIMARY KEY,
        razao_social VARCHAR(255),
        nome_fantasia VARCHAR(255),
        cnpj VARCHAR(30),
        site VARCHAR(255),
        segmento VARCHAR(150),
        setor_atuacao VARCHAR(150),
        cnae_principal VARCHAR(50),
        situacao_cadastral VARCHAR(50),
        capital_social VARCHAR(50),
        endereco_oficial TEXT,
        cidade VARCHAR(100),
        estado VARCHAR(20),
        telefone VARCHAR(50),
        email VARCHAR(255),
        icp_score INT DEFAULT 0,
        luxury_score INT DEFAULT 0,
        is_luxury_profile BOOLEAN DEFAULT false,
        justificativa_ia TEXT,
        risco_ia TEXT,
        raw_data JSONB,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Decision Makers table
    await activePool.query(`
      CREATE TABLE IF NOT EXISTS decision_makers (
        id VARCHAR(100) PRIMARY KEY,
        lead_id VARCHAR(100) REFERENCES leads(id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL,
        role VARCHAR(200),
        department VARCHAR(150),
        ranking INT DEFAULT 1,
        confidence INT DEFAULT 90,
        is_nevine_target_role BOOLEAN DEFAULT false,
        nevine_category VARCHAR(150),
        nevine_key_metric TEXT,
        linkedin_url VARCHAR(500),
        linkedin_verified BOOLEAN DEFAULT false,
        contacts JSONB,
        sources JSONB,
        status VARCHAR(50) DEFAULT 'Encontrado',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Discoveries table
    await activePool.query(`
      CREATE TABLE IF NOT EXISTS lead_discoveries (
        id VARCHAR(100) PRIMARY KEY,
        lead_id VARCHAR(100) REFERENCES leads(id) ON DELETE CASCADE,
        field_name VARCHAR(100),
        field_label VARCHAR(150),
        raw_value TEXT,
        clean_value TEXT,
        source_name VARCHAR(150),
        source_url VARCHAR(500),
        confidence INT DEFAULT 90,
        status VARCHAR(50) DEFAULT 'Encontrado',
        author_ia VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Enrichment Runs table
    await activePool.query(`
      CREATE TABLE IF NOT EXISTS enrichment_runs (
        id VARCHAR(100) PRIMARY KEY,
        lead_id VARCHAR(100) REFERENCES leads(id) ON DELETE CASCADE,
        button_id VARCHAR(50),
        button_name VARCHAR(150),
        duration_ms INT DEFAULT 0,
        cost_estimated NUMERIC(10, 4) DEFAULT 0.00,
        api_calls_count INT DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("[Neon DB] Tabelas criadas/verificadas com sucesso no Neon PostgreSQL!");
    return true;
  } catch (err) {
    console.error("[Neon DB] Erro durante a inicialização do schema:", err);
    return false;
  }
}
