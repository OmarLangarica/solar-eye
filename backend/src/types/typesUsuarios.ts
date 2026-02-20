export interface Usuario {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    password_hash: string;
    telefono: string | null;
    rol: 'admin' | 'trabajador';
    activo: boolean;
}

export type UsuarioNuevo = Omit<Usuario, 'id'>;
export type UsuarioActualizar = Omit<Usuario, 'password_hash'>;