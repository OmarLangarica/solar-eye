import { z } from 'zod';

export const clienteSchema = z.object({
    empresa_id: z.number().int().positive(),
    usuario_id: z.number().int().positive(),
    nombre: z.string().min(2).max(100),
    apellido: z.string().min(2).max(100),
    email: z.union([
        z.string().email(),
        z.literal(''),
        z.null()
    ]).optional(),
    telefono: z.union([
        z.string().max(20),
        z.literal(''),
        z.null()
    ]).optional(),
    direccion: z.union([
        z.string().max(255),
        z.literal(''),
        z.null()
    ]).optional(),
    ciudad: z.union([
        z.string().max(100),
        z.literal(''),
        z.null()
    ]).optional(),
    estado: z.union([
        z.string().max(100),
        z.literal(''),
        z.null()
    ]).optional(),
    codigo_postal: z.union([
        z.string().max(10),
        z.literal(''),
        z.null()
    ]).optional(),
    notas: z.union([
        z.string(),
        z.literal(''),
        z.null()
    ]).optional()
});

export const clienteActualizarSchema = clienteSchema.extend({
    id: z.number().int().positive()
});