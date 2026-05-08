import { z } from 'zod';

export const citaSchema = z.object({
    empresa_id: z.number().int().positive().nullable().optional(),
    cliente_id: z.number().int().positive(),
    simulacion_id: z.number().int().positive().nullable().optional(),
    usuario_id: z.number().int().positive().nullable().optional(),
    tipo: z.enum(['llamada', 'videollamada', 'visita_tecnica']).default('visita_tecnica'),
    fecha_inicio: z.string(),
    fecha_fin: z.string().nullable().optional(),
    estado: z.enum(['pendiente', 'confirmada', 'reprogramada', 'cancelada', 'realizada']).default('pendiente'),
    notas: z.string().nullable().optional()
});

export const citaActualizarSchema = citaSchema.extend({
    id: z.number().int().positive()
});
