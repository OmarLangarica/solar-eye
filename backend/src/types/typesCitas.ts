export interface Cita {
    id?: number;
    empresa_id?: number | null;
    cliente_id: number;
    simulacion_id?: number | null;
    usuario_id?: number | null;
    tipo?: 'llamada' | 'videollamada' | 'visita_tecnica';
    fecha_inicio: string; // ISO datetime
    fecha_fin?: string | null;
    estado?: 'pendiente' | 'confirmada' | 'reprogramada' | 'cancelada' | 'realizada';
    notas?: string | null;
    created_at?: string;
    updated_at?: string;
}

export type CitaNueva = Omit<Cita, 'id' | 'created_at' | 'updated_at'>;
