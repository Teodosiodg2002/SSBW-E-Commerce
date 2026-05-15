export interface Producto {
  id: number;
  título: string;
  descripción: string;
  precio: string;
  imagen: string;
}

export interface ApiResponse<T> {
  productos: T[];
  total: number;
  desde: number;
  hasta: number;
  ordenacion: string;
}
