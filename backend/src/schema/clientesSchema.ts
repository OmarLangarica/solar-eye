import { z } from 'zod';

export const clienteSchema = z.object({
    usuario_id: z.number().int().positive(),
    nombre: z.string().min(2).max(100),
    apellido: z.string().min(2).max(100),
    email: z.string().email().nullable().optional(),
    telefono: z.string().max(20).nullable().optional(),
    direccion: z.string().max(255).nullable().optional(),
    ciudad: z.string().max(100).nullable().optional(),
    estado: z.string().max(100).nullable().optional(),
    codigo_postal: z.string().max(10).nullable().optional(),
    notas: z.string().nullable().optional()
});

export const clienteActualizarSchema = clienteSchema.extend({
    id: z.number().int().positive()
});