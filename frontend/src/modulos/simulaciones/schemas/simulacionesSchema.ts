import { toTypedSchema } from '@vee-validate/zod';
import zod from 'zod';

export const paso1Schema = toTypedSchema(
    zod.object({
        nombre_proyecto: zod.string({ message: 'El nombre del proyecto es requerido' }).min(3, { message: 'Mínimo 3 caracteres' }),
        descripcion: zod.string().optional()
    })
);

export const paso3Schema = toTypedSchema(
    zod.object({
        consumo_mensual_kwh: zod.coerce.number({ message: 'Requerido' }).positive({ message: 'Debe ser mayor a 0' }),
        costo_mensual_mxn: zod.coerce.number({ message: 'Requerido' }).positive({ message: 'Debe ser mayor a 0' }),
        tipo_tarifa: zod.string({ message: 'Requerido' }).min(1, { message: 'Selecciona una tarifa' }),
        periodo_facturacion: zod.string({ message: 'Requerido' }).min(1, { message: 'Selecciona un periodo' }),
        numero_recibo: zod.string().optional()
    })
);