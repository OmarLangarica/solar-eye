import conexion from '../db/conexion.js';

// ─── Paneles ────────────────────────────────────────────────────

export const obtienePaneles = async () => {
    try {
        const [results] = await conexion.query(
            `SELECT p.*, f.nombre AS fabricante_nombre
             FROM paneles p
             JOIN fabricantes f ON p.fabricante_id = f.id
             WHERE p.activo = TRUE
             ORDER BY f.nombre ASC, p.potencia_wp DESC`
        );
        return results;
    } catch (err) {
        return { error: 'No se pudieron obtener los paneles' };
    }
};

export const encuentraPanel = async (id: number) => {
    try {
        const [results] = await conexion.query(
            `SELECT p.*, f.nombre AS fabricante_nombre
             FROM paneles p
             JOIN fabricantes f ON p.fabricante_id = f.id
             WHERE p.id = ? AND p.activo = TRUE LIMIT 1`,
            [id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo encontrar el panel' };
    }
};

// ─── Inversores ─────────────────────────────────────────────────

export const obtieneInversores = async () => {
    try {
        const [results] = await conexion.query(
            `SELECT i.*, f.nombre AS fabricante_nombre
             FROM inversores i
             JOIN fabricantes f ON i.fabricante_id = f.id
             WHERE i.activo = TRUE
             ORDER BY f.nombre ASC, i.potencia_nominal_kw ASC`
        );
        return results;
    } catch (err) {
        return { error: 'No se pudieron obtener los inversores' };
    }
};

export const encuentraInversor = async (id: number) => {
    try {
        const [results] = await conexion.query(
            `SELECT i.*, f.nombre AS fabricante_nombre
             FROM inversores i
             JOIN fabricantes f ON i.fabricante_id = f.id
             WHERE i.id = ? AND i.activo = TRUE LIMIT 1`,
            [id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo encontrar el inversor' };
    }
};

// ─── Sugeridor automático ────────────────────────────────────────
// Sugiere inversores compatibles según la potencia del arreglo DC

export const sugiereInversores = async (potenciaKwp: number) => {
    try {
        // Ratio DC/AC típico: 0.8 a 1.35
        const minKw = potenciaKwp * 0.75;
        const maxKw = potenciaKwp * 1.35;

        const [results] = await conexion.query(
            `SELECT i.*, f.nombre AS fabricante_nombre,
             ABS(i.potencia_nominal_kw - ?) AS diferencia
             FROM inversores i
             JOIN fabricantes f ON i.fabricante_id = f.id
             WHERE i.activo = TRUE
             AND i.potencia_nominal_kw BETWEEN ? AND ?
             ORDER BY diferencia ASC
             LIMIT 5`,
            [potenciaKwp, minKw, maxKw]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo sugerir un inversor' };
    }
};