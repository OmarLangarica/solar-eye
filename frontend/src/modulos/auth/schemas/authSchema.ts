import { toTypedSchema } from '@vee-validate/zod';
import zod from 'zod';

export const loginSchema = toTypedSchema(
    zod.object({
        email: zod.string({ message: 'Email requerido' }).email({ message: 'Email inválido' }),
        password: zod.string({ message: 'Contraseña requerida' }).min(6, { message: 'Mínimo 6 caracteres' })
    })
);

export const registroSchema = toTypedSchema(
    zod.object({
        nombre: zod.string({ message: 'Nombre requerido' }).min(2, { message: 'Mínimo 2 caracteres' }),
        apellido: zod.string({ message: 'Apellido requerido' }).min(2, { message: 'Mínimo 2 caracteres' }),
        email: zod.string({ message: 'Email requerido' }).email({ message: 'Email inválido' }),
        telefono: zod.string().length(10, { message: 'El teléfono debe tener exactamente 10 dígitos' }).regex(/^\d+$/, { message: 'Solo se permiten números' }).optional(),
        password: zod.string({ message: 'Contraseña requerida' }).min(6, { message: 'Mínimo 6 caracteres' })
    })
);