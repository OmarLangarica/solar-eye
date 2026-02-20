export interface Reporte {
    id: number;
    simulacion_id: number;
    usuario_id: number;
    nombre_archivo: string | null;
    ruta_archivo: string | null;
    generado_at?: string;
}

export type ReporteNuevo = Omit<Reporte, 'id' | 'generado_at'>;