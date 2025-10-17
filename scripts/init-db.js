const pool = require('../config/database');

const initDatabase = async () => {
    try {
        console.log('🔄 Inicializando base de datos...');

        // Habilitar extensión PostGIS
        await pool.query(`CREATE EXTENSION IF NOT EXISTS postgis;`);
        console.log('✅ Extensión PostGIS habilitada');

        // Crear tipo ENUM para categorías militares
        await pool.query(`
            DO $$ BEGIN
                CREATE TYPE categoria_militar AS ENUM (
                    'Avion',
                    'Tanque',
                    'Drone',
                    'BSM',
                    'Centro de Mando',
                    'Unidad',
                    'Sub-Grupo Tactico',
                    'Peloton',
                    'Vehiculo',
                    'Artilleria',
                    'Infanteria',
                    'Otro'
                );
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);
        console.log('✅ Tipo ENUM categoria_militar creado');

        // Crear tabla de puntos de interés
        await pool.query(`
            CREATE TABLE IF NOT EXISTS puntos_interes (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL,
                descripcion TEXT,
                categoria categoria_militar NOT NULL,
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
                geom GEOMETRY(Point, 4326) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Tabla puntos_interes creada');

        // Crear índice espacial
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_puntos_interes_geom
            ON puntos_interes USING GIST (geom);
        `);
        console.log('✅ Índice espacial creado');

        // Crear índices adicionales
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_puntos_interes_activo
            ON puntos_interes (activo);
        `);
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_puntos_interes_elemento
            ON puntos_interes (elemento_identificado);
        `);
        console.log('✅ Índices adicionales creados');

        // Insertar datos de ejemplo militares
        await pool.query(`
            INSERT INTO puntos_interes (
                nombre,
                descripcion,
                categoria,
                ciudad,
                provincia,
                elemento_identificado,
                activo,
                tipo_elemento,
                prioridad,
                observaciones,
                geom
            )
            VALUES
                (
                    'Tanque T-72 Alpha',
                    'Tanque enemigo identificado en zona norte',
                    'Tanque',
                    'Madrid',
                    'Madrid',
                    'TANK-001',
                    true,
                    'Blindado Pesado',
                    9,
                    'Movimiento detectado hacia el este',
                    ST_SetSRID(ST_MakePoint(-3.7038, 40.4168), 4326)
                ),
                (
                    'Drone Recon-05',
                    'UAV de reconocimiento en patrulla',
                    'Drone',
                    'Barcelona',
                    'Barcelona',
                    'DRONE-005',
                    true,
                    'UAV Reconocimiento',
                    7,
                    'Volando a 500m de altitud',
                    ST_SetSRID(ST_MakePoint(2.1686, 41.3874), 4326)
                ),
                (
                    'Centro de Mando Delta',
                    'Centro de operaciones principal',
                    'Centro de Mando',
                    'Valencia',
                    'Valencia',
                    'CMD-001',
                    true,
                    'Comando y Control',
                    10,
                    'Operativo 24/7',
                    ST_SetSRID(ST_MakePoint(-0.3763, 39.4699), 4326)
                ),
                (
                    'Peloton Alfa-3',
                    'Peloton de infantería en posición',
                    'Peloton',
                    'Sevilla',
                    'Sevilla',
                    'PLT-A3',
                    true,
                    'Infantería',
                    6,
                    '30 efectivos',
                    ST_SetSRID(ST_MakePoint(-5.9845, 37.3891), 4326)
                ),
                (
                    'Unidad Bravo-1',
                    'Unidad táctica desplegada',
                    'Unidad',
                    'Zaragoza',
                    'Zaragoza',
                    'UNIT-B1',
                    true,
                    'Unidad Táctica',
                    7,
                    'Desplegada en zona urbana',
                    ST_SetSRID(ST_MakePoint(-0.8891, 41.6488), 4326)
                ),
                (
                    'Sub-Grupo Tactico Charlie',
                    'Sub-grupo en maniobras',
                    'Sub-Grupo Tactico',
                    'Bilbao',
                    'Vizcaya',
                    'SGT-C1',
                    true,
                    'Grupo Táctico',
                    8,
                    'En coordinación con Unidad Bravo-1',
                    ST_SetSRID(ST_MakePoint(-2.9253, 43.2627), 4326)
                ),
                (
                    'BSM-Norte-01',
                    'Base de Soporte Móvil operativa',
                    'BSM',
                    'A Coruña',
                    'A Coruña',
                    'BSM-N01',
                    true,
                    'Logística',
                    8,
                    'Capacidad 200 efectivos',
                    ST_SetSRID(ST_MakePoint(-8.4115, 43.3623), 4326)
                ),
                (
                    'Avion Caza F-16',
                    'Aeronave de combate en patrulla aérea',
                    'Avion',
                    'Granada',
                    'Granada',
                    'AIR-F16-001',
                    true,
                    'Caza Multifunción',
                    9,
                    'Patrulla CAP activa',
                    ST_SetSRID(ST_MakePoint(-3.5986, 37.1773), 4326)
                ),
                (
                    'Tanque T-90 Bravo',
                    'Tanque pesado en zona sur',
                    'Tanque',
                    'Málaga',
                    'Málaga',
                    'TANK-002',
                    true,
                    'Blindado Pesado',
                    8,
                    'En posición defensiva',
                    ST_SetSRID(ST_MakePoint(-4.4214, 36.7213), 4326)
                ),
                (
                    'Drone Scout-12',
                    'Drone de exploración',
                    'Drone',
                    'Toledo',
                    'Toledo',
                    'DRONE-012',
                    true,
                    'UAV Exploración',
                    5,
                    'Área de reconocimiento ampliada',
                    ST_SetSRID(ST_MakePoint(-4.0273, 39.8628), 4326)
                ),
                (
                    'Elemento Inactivo Test',
                    'Elemento desactivado para pruebas',
                    'Otro',
                    'Madrid',
                    'Madrid',
                    'TEST-999',
                    false,
                    'Prueba',
                    0,
                    'Elemento de prueba - desactivado',
                    ST_SetSRID(ST_MakePoint(-3.7100, 40.4200), 4326)
                )
            ON CONFLICT DO NOTHING;
        `);
        console.log('✅ Datos de ejemplo militares insertados');

        console.log('\n🎉 Base de datos inicializada correctamente');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al inicializar la base de datos:', error);
        process.exit(1);
    }
};

initDatabase();
