import { z } from 'zod';

export const reporteSchema = z.object({
    simulacion_id: z.number().int().positive(),
    usuario_id: z.number().int().positive(),
    nombre_archivo: z.string().max(255).nullable().optional(),
    ruta_archivo: z.string().max(500).nullable().optional()
});