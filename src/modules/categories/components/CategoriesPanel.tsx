"use client";

import { useEffect, useState, type FormEvent } from "react";

import {
  createCategory,
  fetchCategories,
  type Category,
} from "@/modules/categories/services/category-service";
import { useStoreContext } from "@/modules/stores/context/StoreContext";

export function CategoriesPanel() {
  const { activeStoreId, activeStore } = useStoreContext();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!activeStoreId) {
      return;
    }

    fetchCategories(activeStoreId)
      .then(setCategories)
      .catch((error) => {
        setFeedback(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las categorías."
        );
      });
  }, [activeStoreId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeStoreId) {
      return;
    }

    try {
      await createCategory(activeStoreId, { nombre: name, estado: true });
      setName("");
      setFeedback("Categoría creada correctamente.");
      setCategories(await fetchCategories(activeStoreId));
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "No se pudo crear la categoría."
      );
    }
  }

  return (
    <section className="section-grid xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] xl:grid">
      <form className="panel-card space-y-4" onSubmit={handleSubmit}>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Nueva categoría
        </p>
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">
          Categorías de {activeStore?.nombre ?? "la tienda activa"}
        </h2>
        <input
          className="field-shell w-full rounded-2xl px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)]"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ej. Accesorios"
          required
        />
        <button
          type="submit"
          className="rounded-2xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
        >
          Guardar categoría
        </button>
        {feedback ? <p className="text-sm text-[var(--muted)]">{feedback}</p> : null}
      </form>

      <div className="panel-card">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Listado
        </p>
        <div className="mt-4 space-y-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="rounded-2xl border border-[var(--line)] bg-[var(--panel-muted)] px-4 py-3"
            >
              <p className="font-medium text-[var(--foreground)]">
                {category.nombre}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
