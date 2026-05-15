import useSWR from 'swr';
import { Producto, ApiResponse } from '../types';

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Error en la petición de datos');
  return res.json();
});

const API_URL = 'http://localhost:3000/api';

export const useRandomProduct = () => {
  const { data, error, isLoading, mutate } = useSWR<Producto>(`${API_URL}/productos/random`, fetcher);
  
  return {
    producto: data,
    error,
    isLoading,
    recargar: () => mutate()
  };
};

export const useProductList = (limite: number = 10) => {
  const { data, error, isLoading } = useSWR<ApiResponse<Producto>>(`${API_URL}/productos?hasta=${limite}`, fetcher);
  
  return {
    productos: data?.productos ?? [],
    error,
    isLoading
  };
};
