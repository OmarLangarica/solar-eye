export interface Cliente {
    id: number;
    usuario_id: number;
    nombre: string;
    apellido: string;
    email: string | null;
    telefono: string | null;
    direccion: string | null;
    ciudad: string | null;
    estado: string | null;
    codigo_postal: string | null;
    notas: string | null;
}

export type ClienteNuevo = Omit<Cliente, 'id'>;