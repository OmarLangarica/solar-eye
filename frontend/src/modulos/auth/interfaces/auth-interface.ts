export interface LoginCredenciales {
    email: string;
    password: string;
}

export interface UsuarioAuth {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    rol: 'admin' | 'trabajador';
    activo: boolean;
}