export interface Categoria {
    id: number;
    empresa_id: number;
    nombre: string;
    descripcion?: string;
    icono?: string;
}

export interface CategoriaNueva {
    empresa_id: number;
    nombre: string;
    descripcion?: string;
    icono?: string;
}

export interface Producto {
    id: number;
    empresa_id: number;
    categoria_id?: number;
    nombre: string;
    descripcion?: string;
    marca?: string;
    modelo?: string;
    unidad: string;
    precio_compra: number;
    precio_venta: number;
    stock_actual: number;
    stock_minimo: number;
    stock_maximo: number;
    activo: boolean;
}

export interface ProductoNuevo {
    empresa_id: number;
    categoria_id?: number | null;
    nombre: string;
    descripcion?: string | null;
    marca?: string | null;
    modelo?: string | null;
    unidad: string;
    precio_compra: number;
    precio_venta: number;
    stock_actual: number;
    stock_minimo: number;
    stock_maximo: number;
    activo: boolean;
}

export interface MovimientoInventario {
    id: number;
    empresa_id: number;
    producto_id: number;
    usuario_id: number;
    simulacion_id?: number | null;
    cliente_id?: number | null;
    tipo: 'entrada' | 'salida' | 'ajuste' | 'reserva' | 'venta' | 'devolucion';
    cantidad: number;
    precio_unitario: number;
    total: number;
    motivo?: string;
    notas?: string;
    created_at?: string;
}

export interface MovimientoNuevo {
    empresa_id: number;
    producto_id: number;
    usuario_id: number;
    simulacion_id?: number | null;
    cliente_id?: number | null;
    tipo: 'entrada' | 'salida' | 'ajuste' | 'reserva' | 'venta' | 'devolucion';
    cantidad: number;
    precio_unitario: number;
    total: number;
    motivo?: string;
    notas?: string;
}