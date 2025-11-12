// scripts/init-db.js
const pool = require('../config/database');

const initDatabase = async () => {
  try {
    console.log('🔄 Initializing database from scratch…');

    // 0) Enable PostGIS
    await pool.query(`CREATE EXTENSION IF NOT EXISTS postgis;`);
    console.log('✅ PostGIS enabled');

    // 1) Clean old objects
    await pool.query(`DROP TABLE IF EXISTS puntos_interes CASCADE;`);
    try { await pool.query(`DROP TYPE IF EXISTS categoria_militar;`); } catch (_) {}
    try { await pool.query(`DROP TYPE IF EXISTS alliance_enum;`); } catch (_) {}

    // 2) Enums
    await pool.query(`
      CREATE TYPE categoria_militar AS ENUM (
        'missile','fighter','bomber','aircraft','helicopter','uav',
        'tank','artillery','ship','destroyer','submarine','ground_vehicle',
        'apc','infantry','person','base','building','infrastructure','default'
      );
    `);

    await pool.query(`
      CREATE TYPE alliance_enum AS ENUM ('friendly','hostile','neutral','unknown');
    `);

    // 3) Table (trimmed fields)
    await pool.query(`
      CREATE TABLE puntos_interes (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        categoria categoria_militar NOT NULL,
        country VARCHAR(100),
        alliance alliance_enum NOT NULL DEFAULT 'unknown',
        elemento_identificado VARCHAR(100),
        activo BOOLEAN DEFAULT true,
        tipo_elemento VARCHAR(100),
        prioridad INTEGER DEFAULT 0,
        observaciones TEXT,
        altitud NUMERIC(10, 2),
        geom GEOMETRY(Point, 4326) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Table puntos_interes created');

    // 4) Indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_puntos_interes_geom ON puntos_interes USING GIST (geom);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_puntos_interes_activo ON puntos_interes (activo);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_puntos_interes_elemento ON puntos_interes (elemento_identificado);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_puntos_interes_categoria ON puntos_interes (categoria);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_puntos_interes_alliance ON puntos_interes (alliance);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_puntos_interes_country ON puntos_interes (country);`);
    console.log('✅ Indexes created');

    // 5) Seed (no address/telecom/web fields)
    await pool.query(`
    INSERT INTO puntos_interes
      (nombre, descripcion, categoria, country, alliance, elemento_identificado, activo, tipo_elemento, prioridad, observaciones, altitud, geom)
    VALUES
      -- =========================
      -- FRIENDLY INFANTRY (SPAIN) - 3x en Valencia ciudad
      -- =========================
      ('ESP INF-A', 'Infantry squad (urban)', 'infantry', 'Spain', 'friendly', 'ESP-INF-A', true, 'Infantry', 5, 'Urban patrol', NULL, ST_SetSRID(ST_MakePoint(-0.3768, 39.4745), 4326)),
      ('ESP INF-B', 'Infantry squad (urban)', 'infantry', 'Spain', 'friendly', 'ESP-INF-B', true, 'Infantry', 5, 'Holding intersection', NULL, ST_SetSRID(ST_MakePoint(-0.3850, 39.4632), 4326)),
      ('ESP INF-C', 'Infantry squad (urban)', 'infantry', 'Spain', 'friendly', 'ESP-INF-C', true, 'Infantry', 5, 'Near park area', NULL, ST_SetSRID(ST_MakePoint(-0.3650, 39.4841), 4326)),
  
      -- =========================
      -- FRIENDLY INFANTRY (FRANCE) - 2x en Valencia ciudad
      -- =========================
      ('FRA INF-1', 'Infantry squad (urban)', 'infantry', 'France', 'friendly', 'FRA-INF-1', true, 'Infantry', 5, 'Supporting ESP', NULL, ST_SetSRID(ST_MakePoint(-0.3530, 39.4525), 4326)),
      ('FRA INF-2', 'Infantry squad (urban)', 'infantry', 'France', 'friendly', 'FRA-INF-2', true, 'Infantry', 5, 'Roadblock', NULL, ST_SetSRID(ST_MakePoint(-0.3405, 39.4598), 4326)),
  
      -- =========================
      -- FRIENDLY INFANTRY (GERMANY) - 1x en Valencia ciudad
      -- =========================
      ('DEU INF-1', 'Infantry squad (urban)', 'infantry', 'Germany', 'friendly', 'DEU-INF-1', true, 'Infantry', 5, 'QR force', NULL, ST_SetSRID(ST_MakePoint(-0.4002, 39.4820), 4326)),
  
      -- =========================
      -- FRIENDLY INFANTRY (PORTUGAL) - 1x en Valencia ciudad
      -- =========================
      ('PRT INF-1', 'Infantry squad (urban)', 'infantry', 'Portugal', 'friendly', 'PRT-INF-1', true, 'Infantry', 5, 'Rear security', NULL, ST_SetSRID(ST_MakePoint(-0.3925, 39.4682), 4326)),
  
      -- =========================
      -- HOSTILE INFANTRY (UNKNOWN) - 7x en Valencia ciudad
      -- =========================
      ('H-INF-1', 'Hostile infantry', 'infantry', 'Unknown', 'hostile', 'H-INF-1', true, 'Infantry', 6, 'Skirmishing', NULL, ST_SetSRID(ST_MakePoint(-0.3609, 39.4705), 4326)),
      ('H-INF-2', 'Hostile infantry', 'infantry', 'Unknown', 'hostile', 'H-INF-2', true, 'Infantry', 6, 'Advancing', NULL, ST_SetSRID(ST_MakePoint(-0.3452, 39.4769), 4326)),
      ('H-INF-3', 'Hostile infantry', 'infantry', 'Unknown', 'hostile', 'H-INF-3', true, 'Infantry', 6, 'Occupying block', NULL, ST_SetSRID(ST_MakePoint(-0.3513, 39.4881), 4326)),
      ('H-INF-4', 'Hostile infantry', 'infantry', 'Unknown', 'hostile', 'H-INF-4', true, 'Infantry', 6, 'Ambush expected', NULL, ST_SetSRID(ST_MakePoint(-0.3687, 39.4611), 4326)),
      ('H-INF-5', 'Hostile infantry', 'infantry', 'Unknown', 'hostile', 'H-INF-5', true, 'Infantry', 6, 'Sniper activity', NULL, ST_SetSRID(ST_MakePoint(-0.3811, 39.4552), 4326)),
      ('H-INF-6', 'Hostile infantry', 'infantry', 'Unknown', 'hostile', 'H-INF-6', true, 'Infantry', 6, 'Harassing fire', NULL, ST_SetSRID(ST_MakePoint(-0.3440, 39.4479), 4326)),
      ('H-INF-7', 'Hostile infantry', 'infantry', 'Unknown', 'hostile', 'H-INF-7', true, 'Infantry', 6, 'Fragmented contact', NULL, ST_SetSRID(ST_MakePoint(-0.3895, 39.4786), 4326)),
  
      -- =========================
      -- HOSTILE TANKS (UNKNOWN) - 3x en Valencia ciudad (periferia)
      -- =========================
      ('H-TANK-1', 'Hostile MBT', 'tank', 'Unknown', 'hostile', 'H-TNK-1', true, 'MBT', 9, 'Covered position', NULL, ST_SetSRID(ST_MakePoint(-0.3700, 39.4930), 4326)),
      ('H-TANK-2', 'Hostile MBT', 'tank', 'Unknown', 'hostile', 'H-TNK-2', true, 'MBT', 9, 'Hull-down', NULL, ST_SetSRID(ST_MakePoint(-0.4040, 39.4665), 4326)),
      ('H-TANK-3', 'Hostile MBT', 'tank', 'Unknown', 'hostile', 'H-TNK-3', true, 'MBT', 9, 'Overwatch', NULL, ST_SetSRID(ST_MakePoint(-0.3960, 39.4505), 4326)),
  
      -- =========================
      -- NAVAL (COSTA DE VALENCIA)
      -- =========================
      ('ESP SHIP-1', 'Spanish surface combatant', 'ship', 'Spain', 'friendly', 'ESP-SHIP-1', true, 'Frigate', 8, 'Patrolling Valencia coast', NULL, ST_SetSRID(ST_MakePoint(-0.2700, 39.4500), 4326)),
      ('ESP SUB-1', 'Spanish SSK', 'submarine', 'Spain', 'friendly', 'ESP-SUB-1', true, 'SSK', 10, 'Submerged patrol', NULL, ST_SetSRID(ST_MakePoint(-0.2200, 39.4000), 4326)),
      ('H-SHIP-1', 'Unknown surface contact', 'ship', 'Unknown', 'hostile', 'H-SHIP-1', true, 'Corvette', 9, 'Shadowing traffic', NULL, ST_SetSRID(ST_MakePoint(-0.2200, 39.5500), 4326)),
  
      -- =========================
      -- EXTRAS (OPCIONALES PERO ÚTILES PARA EL ESCENARIO)
      -- =========================
      -- Base aérea (Manises)
      ('Manises AB', 'Air base (ESP)', 'base', 'Spain', 'friendly', 'ESP-BASE-ZAZ', true, 'Air Base', 9, 'Logistics hub', NULL, ST_SetSRID(ST_MakePoint(-0.4760, 39.4910), 4326)),
  
      -- Superioridad aérea y reconocimiento
      ('ESP CAP-1', 'Fighter CAP on station', 'fighter', 'Spain', 'friendly', 'ESP-CAP-1', true, 'CAP', 8, 'Angels 26', 8000, ST_SetSRID(ST_MakePoint(-0.3000, 39.5200), 4326)),
      ('FRA UAV-ISR', 'High-altitude ISR UAV', 'uav', 'France', 'friendly', 'FRA-UAV-1', true, 'ISR', 6, 'Wide-area scan', 1200, ST_SetSRID(ST_MakePoint(-0.3300, 39.4700), 4326)),
  
      -- Hostile fuego de apoyo (al norte, eje Sagunto)
      ('H-ARTY-1', 'Hostile artillery battery', 'artillery', 'Unknown', 'hostile', 'H-ARTY-1', true, '155mm', 8, 'Counter-battery risk', NULL, ST_SetSRID(ST_MakePoint(-0.2700, 39.6800), 4326)),
  
      -- Helicóptero aliado en retaguardia
      ('DEU HEL-1', 'Utility helicopter', 'helicopter', 'Germany', 'friendly', 'DEU-HEL-1', true, 'Utility', 5, 'MEDEVAC on call', 500, ST_SetSRID(ST_MakePoint(-0.3600, 39.4900), 4326))
    ;
  `);
  

    console.log('🎉 Database initialized with trimmed schema + sample data');
    process.exit(0);
  } catch (error) {
    console.error('❌ DB init error:', error);
    process.exit(1);
  }
};

initDatabase();
