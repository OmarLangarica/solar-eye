import conexion from '../db/conexion.js';
import type { CategoriaNueva, ProductoNuevo, MovimientoNuevo } from '../types/typesInventario.js';

// ─── Categorías ───────────────────────────────────────────────

export const obtieneCategorias = async (empresa_id: number) => {
    try {
        const [results] = await conexion.query(
            'SELECT * FROM categorias_inventario WHERE empresa_id = ? ORDER BY nombre ASC',
            [empresa_id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudieron obtener las categorías' };
    }
};

export const agregaCategoria = async (nueva: CategoriaNueva) => {
    try {
        const [results] = await conexion.query(
            'INSERT INTO categorias_inventario (empresa_id, nombre, descripcion, icono) VALUES (?,?,?,?)',
            [nueva.empresa_id, nueva.nombre, nueva.descripcion ?? null, nueva.icono ?? 'box']
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo agregar la categoría' };
    }
};

export const modificaCategoria = async (modificada: any) => {
    try {
        const [results] = await conexion.query(
            'UPDATE categorias_inventario SET nombre = ?, descripcion = ?, icono = ? WHERE id = ? AND empresa_id = ?',
            [modificada.nombre, modificada.descripcion ?? null, modificada.icono ?? 'box', modificada.id, modificada.empresa_id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo modificar la categoría' };
    }
};

export const borraCategoria = async (id: number, empresa_id: number) => {
    try {
        const [results] = await conexion.query(
            'DELETE FROM categorias_inventario WHERE id = ? AND empresa_id = ?',
            [id, empresa_id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo borrar la categoría' };
    }
};

// ─── Productos ────────────────────────────────────────────────

export const obtieneProductos = async (empresa_id: number) => {
    try {
        const [results] = await conexion.query(
            `SELECT p.*, c.nombre as categoria_nombre, c.icono as categoria_icono
             FROM productos p
             LEFT JOIN categorias_inventario c ON p.categoria_id = c.id
             WHERE p.empresa_id = ?
             ORDER BY p.nombre ASC`,
            [empresa_id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudieron obtener los productos' };
    }
};

export const obtieneProducto = async (id: number, empresa_id: number) => {
    try {
        const [results] = await conexion.query(
            `SELECT p.*, c.nombre as categoria_nombre
             FROM productos p
             LEFT JOIN categorias_inventario c ON p.categoria_id = c.id
             WHERE p.id = ? AND p.empresa_id = ? LIMIT 1`,
            [id, empresa_id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo obtener el producto' };
    }
};

export const agregaProducto = async (nuevo: ProductoNuevo) => {
    try {
        const [results] = await conexion.query(
            `INSERT INTO productos 
            (empresa_id, categoria_id, nombre, descripcion, marca, modelo, unidad,
             precio_compra, precio_venta, stock_actual, stock_minimo, stock_maximo, activo)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [nuevo.empresa_id, nuevo.categoria_id ?? null, nuevo.nombre,
             nuevo.descripcion ?? null, nuevo.marca ?? null, nuevo.modelo ?? null,
             nuevo.unidad, nuevo.precio_compra, nuevo.precio_venta,
             nuevo.stock_actual, nuevo.stock_minimo, nuevo.stock_maximo, nuevo.activo]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo agregar el producto' };
    }
};

export const modificaProducto = async (modificado: any) => {
    try {
        const [results] = await conexion.query(
            `UPDATE productos SET
             categoria_id = ?, nombre = ?, descripcion = ?, marca = ?, modelo = ?,
             unidad = ?, precio_compra = ?, precio_venta = ?,
             stock_minimo = ?, stock_maximo = ?, activo = ?
             WHERE id = ? AND empresa_id = ?`,
            [modificado.categoria_id ?? null, modificado.nombre, modificado.descripcion ?? null,
             modificado.marca ?? null, modificado.modelo ?? null, modificado.unidad,
             modificado.precio_compra, modificado.precio_venta,
             modificado.stock_minimo, modificado.stock_maximo, modificado.activo,
             modificado.id, modificado.empresa_id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo modificar el producto' };
    }
};

export const borraProducto = async (id: number, empresa_id: number) => {
    try {
        const [results] = await conexion.query(
            'UPDATE productos SET activo = FALSE WHERE id = ? AND empresa_id = ?',
            [id, empresa_id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudo borrar el producto' };
    }
};

export const obtieneProductosBajoStock = async (empresa_id: number) => {
    try {
        const [results] = await conexion.query(
            `SELECT p.*, c.nombre as categoria_nombre
             FROM productos p
             LEFT JOIN categorias_inventario c ON p.categoria_id = c.id
             WHERE p.empresa_id = ? AND p.stock_actual <= p.stock_minimo AND p.activo = TRUE
             ORDER BY p.stock_actual ASC`,
            [empresa_id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudieron obtener los productos con bajo stock' };
    }
};

// ─── Movimientos ──────────────────────────────────────────────

export const obtieneMovimientos = async (empresa_id: number, limite: number = 50) => {
    try {
        const [results] = await conexion.query(
            `SELECT m.*, p.nombre as producto_nombre, p.unidad,
             u.nombre as usuario_nombre, u.apellido as usuario_apellido,
             c.nombre as cliente_nombre, c.apellido as cliente_apellido,
             s.nombre_proyecto as simulacion_nombre
             FROM movimientos_inventario m
             INNER JOIN productos p ON m.producto_id = p.id
             INNER JOIN usuarios u ON m.usuario_id = u.id
             LEFT JOIN clientes c ON m.cliente_id = c.id
             LEFT JOIN simulaciones s ON m.simulacion_id = s.id
             WHERE m.empresa_id = ?
             ORDER BY m.created_at DESC
             LIMIT ?`,
            [empresa_id, limite]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudieron obtener los movimientos' };
    }
};

export const obtieneMovimientosPorProducto = async (producto_id: number, empresa_id: number) => {
    try {
        const [results] = await conexion.query(
            `SELECT m.*, u.nombre as usuario_nombre, u.apellido as usuario_apellido,
             c.nombre as cliente_nombre, c.apellido as cliente_apellido
             FROM movimientos_inventario m
             INNER JOIN usuarios u ON m.usuario_id = u.id
             LEFT JOIN clientes c ON m.cliente_id = c.id
             WHERE m.producto_id = ? AND m.empresa_id = ?
             ORDER BY m.created_at DESC`,
            [producto_id, empresa_id]
        );
        return results;
    } catch (err) {
        return { error: 'No se pudieron obtener los movimientos del producto' };
    }
};

export const registraMovimiento = async (nuevo: MovimientoNuevo) => {
    const connection = await (conexion as any).getConnection();
    try {
        await connection.beginTransaction();

        // Registra el movimiento
        const [movResult] = await connection.query(
            `INSERT INTO movimientos_inventario
            (empresa_id, producto_id, usuario_id, simulacion_id, cliente_id,
             tipo, cantidad, precio_unitario, total, motivo, notas)
            VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
            [nuevo.empresa_id, nuevo.producto_id, nuevo.usuario_id,
             nuevo.simulacion_id ?? null, nuevo.cliente_id ?? null,
             nuevo.tipo, nuevo.cantidad, nuevo.precio_unitario,
             nuevo.total, nuevo.motivo ?? null, nuevo.notas ?? null]
        );

        // Actualiza el stock según el tipo de movimiento
        let queryStock = '';
        if (['entrada', 'devolucion'].includes(nuevo.tipo)) {
            queryStock = 'UPDATE productos SET stock_actual = stock_actual + ? WHERE id = ? AND empresa_id = ?';
        } else if (['salida', 'venta', 'reserva'].includes(nuevo.tipo)) {
            queryStock = 'UPDATE productos SET stock_actual = stock_actual - ? WHERE id = ? AND empresa_id = ?';
        } else if (nuevo.tipo === 'ajuste') {
            queryStock = 'UPDATE productos SET stock_actual = ? WHERE id = ? AND empresa_id = ?';
        }

        if (queryStock) {
            await connection.query(queryStock, [nuevo.cantidad, nuevo.producto_id, nuevo.empresa_id]);
        }

        await connection.commit();
        return movResult;
    } catch (err) {
        await connection.rollback();
        return { error: 'No se pudo registrar el movimiento' };
    } finally {
        connection.release();
    }
};

// ─── Estadísticas ─────────────────────────────────────────────

export const obtieneEstadisticasInventario = async (empresa_id: number) => {
    try {
        const [totalProductos] = await conexion.query(
            'SELECT COUNT(*) as total FROM productos WHERE empresa_id = ? AND activo = TRUE',
            [empresa_id]
        );
        const [productosBajoStock] = await conexion.query(
            'SELECT COUNT(*) as total FROM productos WHERE empresa_id = ? AND stock_actual <= stock_minimo AND activo = TRUE',
            [empresa_id]
        );
        const [valorInventario] = await conexion.query(
            'SELECT SUM(stock_actual * precio_compra) as total FROM productos WHERE empresa_id = ? AND activo = TRUE',
            [empresa_id]
        );
        const [movimientosHoy] = await conexion.query(
            `SELECT COUNT(*) as total FROM movimientos_inventario
             WHERE empresa_id = ? AND DATE(created_at) = CURDATE()`,
            [empresa_id]
        );
        const [entradasMes] = await conexion.query(
            `SELECT COALESCE(SUM(cantidad), 0) as total FROM movimientos_inventario
             WHERE empresa_id = ? AND tipo = 'entrada'
             AND MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())`,
            [empresa_id]
        );
        const [salidasMes] = await conexion.query(
            `SELECT COALESCE(SUM(cantidad), 0) as total FROM movimientos_inventario
             WHERE empresa_id = ? AND tipo IN ('salida','venta')
             AND MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW())`,
            [empresa_id]
        );

        return {
            totalProductos: (totalProductos as any[])[0].total,
            productosBajoStock: (productosBajoStock as any[])[0].total,
            valorInventario: (valorInventario as any[])[0].total ?? 0,
            movimientosHoy: (movimientosHoy as any[])[0].total,
            entradasMes: (entradasMes as any[])[0].total,
            salidasMes: (salidasMes as any[])[0].total,
        };
    } catch (err) {
        console.error('Error estadísticas inventario:', err);
        return { error: 'No se pudieron obtener las estadísticas' };
    }
};

// ─── Reserva automática desde simulación ─────────────────────

export const reservaMaterialesSimulacion = async (
    simulacion_id: number,
    cliente_id: number,
    empresa_id: number,
    usuario_id: number,
    materiales: { producto_id: number; cantidad: number; precio_unitario: number }[]
) => {
    const connection = await (conexion as any).getConnection();
    try {
        await connection.beginTransaction();

        for (const material of materiales) {
            const total = material.cantidad * material.precio_unitario;

            await connection.query(
                `INSERT INTO movimientos_inventario
                (empresa_id, producto_id, usuario_id, simulacion_id, cliente_id,
                 tipo, cantidad, precio_unitario, total, motivo)
                VALUES (?,?,?,?,?,'reserva',?,?,?,?)`,
                [empresa_id, material.producto_id, usuario_id, simulacion_id,
                 cliente_id, material.cantidad, material.precio_unitario,
                 total, `Reserva automática para simulación #${simulacion_id}`]
            );

            await connection.query(
                'UPDATE productos SET stock_actual = stock_actual - ? WHERE id = ? AND empresa_id = ?',
                [material.cantidad, material.producto_id, empresa_id]
            );
        }

        await connection.commit();
        return { success: true };
    } catch (err) {
        await connection.rollback();
        return { error: 'No se pudieron reservar los materiales' };
    } finally {
        connection.release();
    }
};