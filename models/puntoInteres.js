const pool = require('../config/database');

class PuntoInteres {
    // Obtener todos los puntos de interés
    static async getAll() {
        const query = `
            SELECT
                id,
                nombre,
                descripcion,
                categoria,
                direccion,
                ciudad,
                provincia,
                codigo_postal,
                telefono,
                email,
                website,
                elemento_identificado,
                activo,
                tipo_elemento,
                prioridad,
                observaciones,
                altitud,
                ST_X(geom) as longitud,
                ST_Y(geom) as latitud,
                created_at,
                updated_at
            FROM puntos_interes
            ORDER BY nombre;
        `;
        const result = await pool.query(query);
        return result.rows;
    }

    // Obtener punto de interés por ID
    static async getById(id) {
        const query = `
            SELECT
                id,
                nombre,
                descripcion,
                categoria,
                direccion,
                ciudad,
                provincia,
                codigo_postal,
                telefono,
                email,
                website,
                elemento_identificado,
                activo,
                tipo_elemento,
                prioridad,
                observaciones,
                altitud,
                ST_X(geom) as longitud,
                ST_Y(geom) as latitud,
                created_at,
                updated_at
            FROM puntos_interes
            WHERE id = $1;
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    // Buscar puntos de interés por categoría
    static async getByCategoria(categoria) {
        const query = `
            SELECT
                id,
                nombre,
                descripcion,
                categoria,
                direccion,
                ciudad,
                provincia,
                codigo_postal,
                telefono,
                email,
                website,
                elemento_identificado,
                activo,
                tipo_elemento,
                prioridad,
                observaciones,
                altitud, /* <--- AÑADIDO: Campo altitud */
                ST_X(geom) as longitud,
                ST_Y(geom) as latitud,
                created_at,
                updated_at
            FROM puntos_interes
            WHERE categoria = $1
            ORDER BY nombre;
        `;
        const result = await pool.query(query, [categoria]);
        return result.rows;
    }

    // Buscar puntos de interés cercanos (radio en metros)
    static async getNearby(longitud, latitud, radio = 50000) {
        const query = `
            SELECT
                id,
                nombre,
                descripcion,
                categoria,
                direccion,
                ciudad,
                provincia,
                codigo_postal,
                telefono,
                email,
                website,
                altitud, /* <--- AÑADIDO: Campo altitud */
                ST_X(geom) as longitud,
                ST_Y(geom) as latitud,
                ST_Distance(
                    geom::geography,
                    ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
                ) as distancia
            FROM puntos_interes
            WHERE ST_DWithin(
                geom::geography,
                ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
                $3
            )
            ORDER BY distancia;
        `;
        const result = await pool.query(query, [longitud, latitud, radio]);
        return result.rows;
    }

    // Crear nuevo punto de interés
    static async create(data) {
        const query = `
            INSERT INTO puntos_interes (
                nombre,
                descripcion,
                categoria,
                direccion,
                ciudad,
                provincia,
                codigo_postal,
                telefono,
                email,
                website,
                elemento_identificado,
                activo,
                tipo_elemento,
                prioridad,
                observaciones,
                altitud,
                geom
            )
            VALUES (
                $1, $2, $3::categoria_militar, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 
                $16,
                ST_SetSRID(ST_MakePoint($17, $18), 4326)
            )
            RETURNING
                id, nombre, descripcion, categoria, direccion, ciudad, provincia,
                codigo_postal, telefono, email, website, elemento_identificado,
                activo, tipo_elemento, prioridad, observaciones, altitud, 
                ST_X(geom) as longitud, ST_Y(geom) as latitud, created_at, updated_at;
        `;
        
        const values = [
            data.nombre ?? null,                             // $1
            data.descripcion ?? null,                        // $2
            data.categoria ?? null,                          // $3
            data.direccion ?? null,                          // $4
            data.ciudad ?? null,                             // $5
            data.provincia ?? null,                          // $6
            data.codigo_postal ?? null,                      // $7
            data.telefono ?? null,                           // $8
            data.email ?? null,                              // $9
            data.website ?? null,                            // $10
            data.elemento_identificado ?? null,              // $11
            data.activo !== undefined ? data.activo : true,  // $12 ← BOOLEAN
            data.tipo_elemento ?? null,                      // $13
            data.prioridad ?? 0,                             // $14
            data.observaciones ?? null,                      // $15
            data.altitud ?? null,                            // $16
            data.longitud,                                   // $17
            data.latitud                                     // $18
        ];
        
        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('❌ Error al crear punto de interés:', error);
            console.error('   Data recibida:', data);
            console.error('   Values array:', values);
            console.error('   Error detail:', error.detail);
            console.error('   Error hint:', error.hint);
            throw error;
        }
    }

    // Actualizar punto de interés
    static async update(id, data) {
        const query = `
            UPDATE puntos_interes
            SET
                nombre = COALESCE($1, nombre),
                descripcion = COALESCE($2, descripcion),
                categoria = COALESCE($3::categoria_militar, categoria),
                direccion = COALESCE($4, direccion),
                ciudad = COALESCE($5, ciudad),
                provincia = COALESCE($6, provincia),
                codigo_postal = COALESCE($7, codigo_postal),
                telefono = COALESCE($8, telefono),
                email = COALESCE($9, email),
                website = COALESCE($10, website),
                elemento_identificado = COALESCE($11, elemento_identificado),
                activo = COALESCE($12, activo),
                tipo_elemento = COALESCE($13, tipo_elemento),
                prioridad = COALESCE($14, prioridad),
                observaciones = COALESCE($15, observaciones),
                altitud = COALESCE($16, altitud),
                geom = COALESCE(
                    ST_SetSRID(ST_MakePoint(CAST($17 AS DOUBLE PRECISION), CAST($18 AS DOUBLE PRECISION)), 4326),
                    geom
                ),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $19
            RETURNING
                id, nombre, descripcion, categoria, direccion, ciudad, provincia,
                codigo_postal, telefono, email, website, elemento_identificado,
                activo, tipo_elemento, prioridad, observaciones, altitud, 
                ST_X(geom) as longitud, ST_Y(geom) as latitud, created_at, updated_at; 
        `;
        const values = [
            data.nombre ?? null,              // $1  
            data.descripcion ?? null,         // $2
            data.categoria ?? null,           // $3
            data.direccion ?? null,           // $4  
            data.ciudad ?? null,              // $5
            data.provincia ?? null,           // $6
            data.codigo_postal ?? null,       // $7  
            data.telefono ?? null,            // $8  
            data.email ?? null,               // $9  
            data.website ?? null,             // $10 
            data.elemento_identificado ?? null, // $11
            data.activo ?? null,              // $12
            data.tipo_elemento ?? null,       // $13
            data.prioridad ?? null,           // $14
            data.observaciones ?? null,       // $15
            data.altitud ?? null,             // $16
            data.longitud ?? null,            // $17 
            data.latitud ?? null,             // $18
            id                                // $19
        ];
        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            // ✨ LOGGING DETALLADO
            console.error('❌ Error al actualizar punto de interés:', error);
            console.error('   Punto ID:', id);
            console.error('   Data recibida:', data);
            console.error('   Values array:', values);
            console.error('   Error code:', error.code);
            console.error('   Error detail:', error.detail);
            console.error('   Error hint:', error.hint);
            throw error;
        }
    }

    
    // Eliminar punto de interés
    static async delete(id) {
        const query = `DELETE FROM puntos_interes WHERE id = $1 RETURNING id;`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    // Obtener todas las categorías únicas
    static async getCategorias() {
        const query = `
            SELECT DISTINCT categoria
            FROM puntos_interes
            WHERE categoria IS NOT NULL
            ORDER BY categoria;
        `;
        const result = await pool.query(query);
        return result.rows.map(row => row.categoria);
    }
}

module.exports = PuntoInteres;
