export function buildProductCreatePath() {
  return "/admin/productos/nuevo";
}

export function buildProductEditPath(productId: number) {
  return `/admin/productos/${productId}/editar`;
}

export function buildProductsListPath() {
  return "/admin";
}
