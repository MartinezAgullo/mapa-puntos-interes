// models/puntoInteres.js
const pool = require('../config/database');

class PuntoInteres {
  static baseSelect() {
    return `
      SELECT
        id,
        nombre,
        descripcion,
        categoria,
        country,
        alliance,
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
    `;
  }

  static async getAll() {
    const result = await pool.query(`${this.baseSelect()} ORDER BY nombre;`);
    return result.rows;
  }

  static async getById(id) {
    const result = await pool.query(`${this.baseSelect()} WHERE id = $1;`, [id]);
    return result.rows[0];
  }

  static async getByCategoria(categoria) {
    const result = await pool.query(
      `${this.baseSelect()} WHERE categoria = $1 ORDER BY nombre;`,
      [categoria]
    );
    return result.rows;
  }

  static async getNearby(longitud, latitud, radio = 50000) {
    const result = await pool.query(
      `
      SELECT
        id,
        nombre,
        descripcion,
        categoria,
        country,
        alliance,
        altitud,
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
      `,
      [longitud, latitud, radio]
    );
    return result.rows;
  }

  static async create(data) {
    const query = `
      INSERT INTO puntos_interes (
        nombre, descripcion, categoria, country, alliance,
        elemento_identificado, activo, tipo_elemento, prioridad, observaciones, altitud, geom
      )
      VALUES (
        $1, $2, $3::categoria_militar, $4, $5::alliance_enum,
        $6, $7, $8, $9, $10, $11,
        ST_SetSRID(ST_MakePoint($12, $13), 4326)
      )
      RETURNING
        id, nombre, descripcion, categoria, country, alliance,
        elemento_identificado, activo, tipo_elemento, prioridad, observaciones, altitud,
        ST_X(geom) as longitud, ST_Y(geom) as latitud, created_at, updated_at;
    `;

    const values = [
      data.nombre ?? null,                 // 1
      data.descripcion ?? null,            // 2
      data.categoria ?? 'default',         // 3
      data.country ?? null,                // 4
      data.alliance ?? 'unknown',          // 5
      data.elemento_identificado ?? null,  // 6
      data.activo !== undefined ? data.activo : true, // 7
      data.tipo_elemento ?? null,          // 8
      data.prioridad ?? 0,                 // 9
      data.observaciones ?? null,          //10
      data.altitud ?? null,                //11
      data.longitud,                       //12
      data.latitud                         //13
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async update(id, data) {
    const query = `
      UPDATE puntos_interes
      SET
        nombre = COALESCE($1, nombre),
        descripcion = COALESCE($2, descripcion),
        categoria = COALESCE($3::categoria_militar, categoria),
        country = COALESCE($4, country),
        alliance = COALESCE($5::alliance_enum, alliance),
        elemento_identificado = COALESCE($6, elemento_identificado),
        activo = COALESCE($7, activo),
        tipo_elemento = COALESCE($8, tipo_elemento),
        prioridad = COALESCE($9, prioridad),
        observaciones = COALESCE($10, observaciones),
        altitud = COALESCE($11, altitud),
        geom = COALESCE(
          ST_SetSRID(ST_MakePoint(CAST($12 AS DOUBLE PRECISION), CAST($13 AS DOUBLE PRECISION)), 4326),
          geom
        ),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $14
      RETURNING
        id, nombre, descripcion, categoria, country, alliance,
        elemento_identificado, activo, tipo_elemento, prioridad, observaciones, altitud,
        ST_X(geom) as longitud, ST_Y(geom) as latitud, created_at, updated_at;
    `;

    const values = [
      data.nombre ?? null,                 // 1
      data.descripcion ?? null,            // 2
      data.categoria ?? null,              // 3
      data.country ?? null,                // 4
      data.alliance ?? null,               // 5
      data.elemento_identificado ?? null,  // 6
      data.activo ?? null,                 // 7
      data.tipo_elemento ?? null,          // 8
      data.prioridad ?? null,              // 9
      data.observaciones ?? null,          //10
      data.altitud ?? null,                //11
      data.longitud ?? null,               //12
      data.latitud ?? null,                //13
      id                                   //14
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query(`DELETE FROM puntos_interes WHERE id = $1 RETURNING id;`, [id]);
    return result.rows[0];
  }

  static async getCategorias() {
    const result = await pool.query(`SELECT unnest(enum_range(NULL::categoria_militar)) AS categoria;`);
    return result.rows.map(r => r.categoria);
  }
}

module.exports = PuntoInteres;
