export interface Producto {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  imagen: string;
}

export interface ApiResponse<T> {
  productos: T[];
  total: number;
  desde: number;
  hasta: number;
  ordenacion: string;
}
