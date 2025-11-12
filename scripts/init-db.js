// scripts/init-db.js
const pool = require('../config/database');

const initDatabase = async () => {
  try {
    console.log('🔄 Initializing database from scratch…');

    // 0) Enable PostGIS
    await pool.query(`CREATE EXTENSION IF NOT EXISTS postgis;`);
    console.log('✅ PostGIS enabled');

    // 1) Clean old objects (table + enum) if you are okay starting fresh
    await pool.query(`DROP TABLE IF EXISTS puntos_interes CASCADE;`);
    try {
      await pool.query(`DROP TYPE IF EXISTS categoria_militar;`);
    } catch (_) {}
    try {
      await pool.query(`DROP TYPE IF EXISTS alliance_enum;`);
    } catch (_) {}

    // 2) Create enums
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

    // 3) Create table
    await pool.query(`
      CREATE TABLE puntos_interes (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        categoria categoria_militar NOT NULL,
        country VARCHAR(100),
        alliance alliance_enum NOT NULL DEFAULT 'unknown',
        direccion VARCHAR(255),
        ciudad VARCHAR(100),
        provincia VARCHAR(100),
        codigo_postal VARCHAR(10),
        telefono VARCHAR(20),
        email VARCHAR(100),
        website VARCHAR(255),
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

    // 5) Seed examples (using your new categories)
    await pool.query(`
      INSERT INTO puntos_interes
        (nombre, descripcion, categoria, country, alliance, ciudad, provincia, elemento_identificado, activo, tipo_elemento, prioridad, observaciones, altitud, geom)
      VALUES
        ('F-16 Patrol', 'CAP patrol', 'fighter', 'Spain', 'friendly', 'Granada', 'Granada', 'AIR-F16-001', true, 'Caza', 8, 'On CAP', 1000, ST_SetSRID(ST_MakePoint(-3.5986, 37.1773), 4326)),
        ('Recon UAV-12', 'Recon pattern', 'uav', 'Spain', 'friendly', 'Toledo', 'Toledo', 'UAV-012', true, 'Recon', 6, 'Loitering', 300, ST_SetSRID(ST_MakePoint(-4.0273, 39.8628), 4326)),
        ('MBT T-90', 'Heavy armor', 'tank', 'Unknown', 'hostile', 'Málaga', 'Málaga', 'TANK-002', true, 'MBT', 9, 'Defensive posture', NULL, ST_SetSRID(ST_MakePoint(-4.4214, 36.7213), 4326)),
        ('FA Battery', 'Field artillery battery', 'artillery', 'Spain', 'friendly', 'Badajoz', 'Badajoz', 'ARTY-01', true, '155mm', 7, NULL, NULL, ST_SetSRID(ST_MakePoint(-6.9706, 38.8794), 4326)),
        ('DDG-75', 'Aegis destroyer', 'destroyer', 'Spain', 'friendly', 'Rota', 'Cádiz', 'DDG-75', true, 'Surface combatant', 10, NULL, NULL, ST_SetSRID(ST_MakePoint(-6.3496, 36.6237), 4326)),
        ('Sub Kilo', 'Diesel-electric submarine', 'submarine', 'Unknown', 'hostile', 'Cartagena', 'Murcia', 'SUB-001', true, 'SSK', 10, 'Suspected patrol', NULL, ST_SetSRID(ST_MakePoint(-0.9817, 37.6257), 4326)),
        ('Inf Plt A3', 'Infantry platoon', 'infantry', 'Spain', 'friendly', 'Sevilla', 'Sevilla', 'INF-A3', true, 'Platoon', 5, '30 pax', NULL, ST_SetSRID(ST_MakePoint(-5.9845, 37.3891), 4326)),
        ('Fuel Depot', 'Critical infrastructure', 'infrastructure', 'Spain', 'neutral', 'Valencia', 'Valencia', 'INFRA-01', true, 'Fuel', 6, NULL, NULL, ST_SetSRID(ST_MakePoint(-0.3763, 39.4699), 4326)),
        ('Main Air Base', 'Air base', 'base', 'Spain', 'friendly', 'Zaragoza', 'Zaragoza', 'BASE-ZAZ', true, 'AB', 9, '24/7 ops', NULL, ST_SetSRID(ST_MakePoint(-0.8891, 41.6488), 4326)),
        ('Unidentified', 'Unknown contact', 'default', 'Unknown', 'unknown', 'Madrid', 'Madrid', 'UNK-000', false, 'Unknown', 0, NULL, NULL, ST_SetSRID(ST_MakePoint(-3.7038, 40.4168), 4326));
    `);

    console.log('🎉 Database initialized with new schema + sample data');
    process.exit(0);
  } catch (error) {
    console.error('❌ DB init error:', error);
    process.exit(1);
  }
};

initDatabase();
