import { z } from 'zod';
export const usuarioSchema = z.object({
    nombre: z.string().min(2).max(100),
    apellido: z.string().min(2).max(100),
    email: z.string().email(),
    password_hash: z.string().min(6),
    telefono: z.string().max(20).nullable().optional(),
    rol: z.enum(['admin', 'trabajador']).default('trabajador'),
    activo: z.boolean().default(true)
});
export const usuarioActualizarSchema = z.object({
    id: z.number().int().positive(),
    nombre: z.string().min(2).max(100),
    apellido: z.string().min(2).max(100),
    email: z.string().email(),
    telefono: z.string().max(20).nullable().optional(),
    rol: z.enum(['admin', 'trabajador']),
    activo: z.boolean()
});
