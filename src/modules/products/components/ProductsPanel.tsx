"use client";

import { useEffect, useState, type FormEvent } from "react";

import {
  fetchCategories,
  type Category,
} from "@/modules/categories/services/category-service";
import { ProductImageUploader } from "@/modules/products/components/ProductImageUploader";
import {
  createProduct,
  fetchProducts,
  type Product,
  type ProductImagePayload,
} from "@/modules/products/services/product-service";
import { useStoreContext } from "@/modules/stores/context/StoreContext";

export function ProductsPanel() {
  const { activeStoreId, activeStore } = useStoreContext();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [images, setImages] = useState<ProductImagePayload[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    categoriaId: "",
    precio: "",
    cantidad: "",
  });

  useEffect(() => {
    if (!activeStoreId) {
      return;
    }

    Promise.all([fetchCategories(activeStoreId), fetchProducts(activeStoreId)])
      .then(([fetchedCategories, fetchedProducts]) => {
        setCategories(fetchedCategories);
        setProducts(fetchedProducts);
      })
      .catch((error) => {
        setFeedback(
          error instanceof Error
            ? error.message
            : "No se pudo cargar la información del módulo de productos."
        );
      });
  }, [activeStoreId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeStoreId) {
      return;
    }

    try {
      await createProduct(activeStoreId, {
        nombre: form.nombre,
        descripcion: form.descripcion,
        categoriaId: Number(form.categoriaId),
        precio: Number(form.precio),
        cantidad: Number(form.cantidad),
        estado: true,
        imagenes: images.map((image, index) => ({
          ...image,
          orden: index,
          esPrincipal: index === 0 ? true : image.esPrincipal,
        })),
      });

      setFeedback("Producto creado correctamente.");
      setForm({
        nombre: "",
        descripcion: "",
        categoriaId: "",
        precio: "",
        cantidad: "",
      });
      setImages([]);
      setProducts(await fetchProducts(activeStoreId));
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "No se pudo crear el producto."
      );
    }
  }

  return (
    <section className="section-grid xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] xl:grid">
      <form className="panel-card space-y-4" onSubmit={handleSubmit}>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Nuevo producto
        </p>
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">
          Catálogo de {activeStore?.nombre ?? "la tienda activa"}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <input
            className="field-shell rounded-2xl px-4 py-3 text-sm outline-none"
            placeholder="Nombre del producto"
            value={form.nombre}
            onChange={(event) =>
              setForm((current) => ({ ...current, nombre: event.target.value }))
            }
            required
          />
          <select
            className="field-shell rounded-2xl px-4 py-3 text-sm outline-none"
            value={form.categoriaId}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                categoriaId: event.target.value,
              }))
            }
            required
          >
            <option value="">Selecciona categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nombre}
              </option>
            ))}
          </select>
          <input
            className="field-shell rounded-2xl px-4 py-3 text-sm outline-none md:col-span-2"
            placeholder="Descripción"
            value={form.descripcion}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                descripcion: event.target.value,
              }))
            }
          />
          <input
            className="field-shell rounded-2xl px-4 py-3 text-sm outline-none"
            placeholder="Precio"
            type="number"
            min="0.01"
            step="0.01"
            value={form.precio}
            onChange={(event) =>
              setForm((current) => ({ ...current, precio: event.target.value }))
            }
            required
          />
          <input
            className="field-shell rounded-2xl px-4 py-3 text-sm outline-none"
            placeholder="Cantidad"
            type="number"
            min="0"
            value={form.cantidad}
            onChange={(event) =>
              setForm((current) => ({ ...current, cantidad: event.target.value }))
            }
            required
          />
        </div>

        <ProductImageUploader value={images} onChange={setImages} />

        <button
          type="submit"
          className="rounded-2xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
        >
          Guardar producto
        </button>
        {feedback ? <p className="text-sm text-[var(--muted)]">{feedback}</p> : null}
      </form>

      <div className="panel-card">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Productos recientes
        </p>
        <div className="mt-4 space-y-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-[var(--foreground)]">
                    {product.nombre}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {product.categoriaNombre}
                  </p>
                </div>
                <strong className="text-[var(--foreground)]">
                  {product.precio.toFixed(2)}
                </strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
