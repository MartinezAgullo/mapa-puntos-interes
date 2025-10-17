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
                geom
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, ST_SetSRID(ST_MakePoint($16, $17), 4326))
            RETURNING
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
                ST_X(geom) as longitud,
                ST_Y(geom) as latitud,
                created_at,
                updated_at;
        `;
        const values = [
            data.nombre,
            data.descripcion,
            data.categoria,
            data.direccion,
            data.ciudad,
            data.provincia,
            data.codigo_postal,
            data.telefono,
            data.email,
            data.website,
            data.elemento_identificado,
            data.activo !== undefined ? data.activo : true,
            data.tipo_elemento,
            data.prioridad || 0,
            data.observaciones,
            data.longitud,
            data.latitud
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    // Actualizar punto de interés
    static async update(id, data) {
        const query = `
            UPDATE puntos_interes
            SET
                nombre = COALESCE($1, nombre),
                descripcion = COALESCE($2, descripcion),
                categoria = COALESCE($3, categoria),
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
                geom = CASE
                    WHEN $16 IS NOT NULL AND $17 IS NOT NULL
                    THEN ST_SetSRID(ST_MakePoint($16, $17), 4326)
                    ELSE geom
                END,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $18
            RETURNING
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
                ST_X(geom) as longitud,
                ST_Y(geom) as latitud,
                created_at,
                updated_at;
        `;
        const values = [
            data.nombre,
            data.descripcion,
            data.categoria,
            data.direccion,
            data.ciudad,
            data.provincia,
            data.codigo_postal,
            data.telefono,
            data.email,
            data.website,
            data.elemento_identificado,
            data.activo,
            data.tipo_elemento,
            data.prioridad,
            data.observaciones,
            data.longitud,
            data.latitud,
            id
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
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
