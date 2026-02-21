import { toTypedSchema } from '@vee-validate/zod';
import zod from 'zod';

export const clienteSchema = toTypedSchema(
    zod.object({
        nombre: zod.string({ message: 'Nombre requerido' }).min(2, { message: 'Mínimo 2 caracteres' }),
        apellido: zod.string({ message: 'Apellido requerido' }).min(2, { message: 'Mínimo 2 caracteres' }),
        email: zod.string().email({ message: 'Email inválido' }).optional().or(zod.literal('')),
        telefono: zod.string()
            .length(10, { message: 'Debe tener exactamente 10 dígitos' })
            .regex(/^\d+$/, { message: 'Solo se permiten números' })
            .optional(),
        direccion: zod.string().max(255).optional(),
        ciudad: zod.string().max(100).optional(),
        estado: zod.string().max(100).optional(),
        codigo_postal: zod.string().max(10).optional(),
        notas: zod.string().optional()
    })
);