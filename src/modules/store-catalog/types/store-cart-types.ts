export type StoreCartItem = {
  productId: number;
  productoVarianteId: number;
  nombre: string;
  precio: number;
  cantidad: number;
  cantidadDisponible: number;
  categoria: string;
  imagenUrl: string | null;
  varianteResumen: string;
};
