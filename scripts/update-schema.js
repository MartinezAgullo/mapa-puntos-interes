const pool = require('../config/database');

const updateSchema = async () => {
    try {
        console.log('🔄 Actualizando esquema de base de datos...');

        // Agregar nuevas columnas
        await pool.query(`
            ALTER TABLE puntos_interes
            ADD COLUMN IF NOT EXISTS elemento_identificado VARCHAR(100),
            ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true,
            ADD COLUMN IF NOT EXISTS tipo_elemento VARCHAR(100),
            ADD COLUMN IF NOT EXISTS prioridad INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS observaciones TEXT;
        `);
        console.log('✅ Nuevas columnas agregadas');

        // Crear índice para búsqueda por activo
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_puntos_interes_activo
            ON puntos_interes (activo);
        `);
        console.log('✅ Índice de activo creado');

        // Crear índice para búsqueda por elemento_identificado
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_puntos_interes_elemento
            ON puntos_interes (elemento_identificado);
        `);
        console.log('✅ Índice de elemento_identificado creado');

        console.log('\n🎉 Esquema actualizado correctamente');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al actualizar el esquema:', error);
        process.exit(1);
    }
};

updateSchema();
