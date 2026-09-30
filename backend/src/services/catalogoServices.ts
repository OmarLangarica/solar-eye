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

// ─── Componentes por empresa ─────────────────────────────────

export const obtieneComponentesEmpresa = async (empresa_id: number, tipo?: string) => {
    try {
        const query = tipo
            ? `SELECT * FROM componentes_empresa WHERE empresa_id = ? AND tipo = ? AND activo = TRUE ORDER BY modelo ASC`
            : `SELECT * FROM componentes_empresa WHERE empresa_id = ? AND activo = TRUE ORDER BY tipo ASC, modelo ASC`;
        const params = tipo ? [empresa_id, tipo] : [empresa_id];
        const [results] = await conexion.query(query, params);
        return results;
    } catch (err) {
        return { error: 'No se pudieron obtener los componentes' };
    }
};

export const agregaComponenteEmpresa = async (datos: any) => {
    try {
        const [results] = await conexion.query(
            `INSERT INTO componentes_empresa 
            (empresa_id, tipo, fabricante, modelo,
             potencia_wp, eficiencia, voc, isc, vmp, imp,
             coef_temp_potencia, coef_temp_voc, area_m2, tecnologia,
             potencia_nominal_kw, eficiencia_maxima,
             voltaje_mppt_min, voltaje_mppt_max, voltaje_max_entrada,
             corriente_max_entrada, numero_mppt, numero_entradas_por_mppt, fases)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
                datos.empresa_id, datos.tipo, datos.fabricante ?? null, datos.modelo,
                datos.potencia_wp ?? null, datos.eficiencia ?? null,
                datos.voc ?? null, datos.isc ?? null, datos.vmp ?? null, datos.imp ?? null,
                datos.coef_temp_potencia ?? null, datos.coef_temp_voc ?? null,
                datos.area_m2 ?? null, datos.tecnologia ?? null,
                datos.potencia_nominal_kw ?? null, datos.eficiencia_maxima ?? null,
                datos.voltaje_mppt_min ?? null, datos.voltaje_mppt_max ?? null,
                datos.voltaje_max_entrada ?? null, datos.corriente_max_entrada ?? null,
                datos.numero_mppt ?? null, datos.numero_entradas_por_mppt ?? null,
                datos.fases ?? null
            ]
        );
        return results;
    } catch (err) {
        console.error('Error agregando componente:', err);
        return { error: 'No se pudo agregar el componente' };
    }
};

export const actualizaComponenteEmpresa = async (datos: any) => {
    try {
        const [results] = await conexion.query(
            `UPDATE componentes_empresa SET
             fabricante = ?, modelo = ?, potencia_wp = ?, eficiencia = ?,
             voc = ?, isc = ?, vmp = ?, imp = ?,
             coef_temp_potencia = ?, coef_temp_voc = ?, area_m2 = ?, tecnologia = ?,
             potencia_nominal_kw = ?, eficiencia_maxima = ?,
             voltaje_mppt_min = ?, voltaje_mppt_max = ?, voltaje_max_entrada = ?,
             corriente_max_entrada = ?, numero_mppt = ?, numero_entradas_por_mppt = ?, fases = ?
             WHERE id = ? AND empresa_id = ?`,
            [
                datos.fabricante ?? null, datos.modelo,
                datos.potencia_wp ?? null, datos.eficiencia ?? null,
                datos.voc ?? null, datos.isc ?? null, datos.vmp ?? null, datos.imp ?? null,
                datos.coef_temp_potencia ?? null, datos.coef_temp_voc ?? null,
                datos.area_m2 ?? null, datos.tecnologia ?? null,
                datos.potencia_nominal_kw ?? null, datos.eficiencia_maxima ?? null,
                datos.voltaje_mppt_min ?? null, datos.voltaje_mppt_max ?? null,
                datos.voltaje_max_entrada ?? null, datos.corriente_max_entrada ?? null,
                datos.numero_mppt ?? null, datos.numero_entradas_por_mppt ?? null,
                datos.fases ?? null,
                datos.id, datos.empresa_id
            ]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo actualizar el componente' };
    }
};

export const eliminaComponenteEmpresa = async (id: number, empresa_id: number) => {
    try {
        const [results] = await conexion.query(
            `UPDATE componentes_empresa SET activo = FALSE WHERE id = ? AND empresa_id = ?`,
            [id, empresa_id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo eliminar el componente' };
    }
};