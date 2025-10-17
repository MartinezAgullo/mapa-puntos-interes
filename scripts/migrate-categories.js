const pool = require('../config/database');

const migrateCategories = async () => {
    try {
        console.log('🔄 Migrando categorías a sistema militar...');

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

        // Modificar la tabla para usar el ENUM (primero crear columna temporal)
        await pool.query(`
            ALTER TABLE puntos_interes
            ADD COLUMN IF NOT EXISTS categoria_temp categoria_militar;
        `);

        // Actualizar datos existentes con mapeo de categorías antiguas a nuevas
        await pool.query(`
            UPDATE puntos_interes
            SET categoria_temp = 'Otro'
            WHERE categoria_temp IS NULL;
        `);

        // Eliminar columna antigua y renombrar la nueva
        await pool.query(`
            ALTER TABLE puntos_interes
            DROP COLUMN IF EXISTS categoria CASCADE;
        `);

        await pool.query(`
            ALTER TABLE puntos_interes
            RENAME COLUMN categoria_temp TO categoria;
        `);

        console.log('✅ Columna categoria migrada a tipo ENUM');

        // Limpiar datos de ejemplo turísticos
        await pool.query(`DELETE FROM puntos_interes;`);
        console.log('✅ Datos turísticos eliminados');

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

        console.log('\n🎉 Migración completada correctamente');
        console.log('\nCategorías disponibles:');
        console.log('  - Avion');
        console.log('  - Tanque');
        console.log('  - Drone');
        console.log('  - BSM');
        console.log('  - Centro de Mando');
        console.log('  - Unidad');
        console.log('  - Sub-Grupo Tactico');
        console.log('  - Peloton');
        console.log('  - Vehiculo');
        console.log('  - Artilleria');
        console.log('  - Infanteria');
        console.log('  - Otro');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error al migrar categorías:', error);
        process.exit(1);
    }
};

migrateCategories();
