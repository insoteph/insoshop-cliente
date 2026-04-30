"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useStoreCart } from "@/modules/store-catalog/providers/StoreCartProvider";
import { usePublicStoreLightMode } from "@/modules/store-catalog/lib/use-public-store-light-mode";
import {
  readStoreFavorites,
  writeStoreFavorites,
  type StoreFavoriteProduct,
} from "@/modules/store-catalog/lib/store-favorites-storage";
import { fetchPublicStoreCategories, fetchPublicStoreProducts } from "@/modules/store-catalog/services/store-catalog-service";
import type {
  PublicStoreCategory,
  PublicStoreProduct,
  PublicStoreSummary,
} from "@/modules/store-catalog/types/store-catalog-types";
import { toFavoriteProduct } from "@/modules/store-catalog/lib/store-catalog-favorites.utils";

type UseStoreCatalogViewProps = {
  slug: string;
};

export function useStoreCatalogView({ slug }: UseStoreCatalogViewProps) {
  const { totalItems } = useStoreCart();

  const [store, setStore] = useState<PublicStoreSummary | null>(null);
  const [products, setProducts] = useState<PublicStoreProduct[]>([]);
  const [categories, setCategories] = useState<PublicStoreCategory[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteItems, setFavoriteItems] = useState<StoreFavoriteProduct[]>(
    [],
  );
  const [favoritesLoadedSlug, setFavoritesLoadedSlug] = useState<string | null>(
    null,
  );
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);

  usePublicStoreLightMode();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 320);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    setFavoriteItems(readStoreFavorites(slug));
    setFavoritesLoadedSlug(slug);
  }, [slug]);

  useEffect(() => {
    if (favoritesLoadedSlug !== slug) {
      return;
    }

    writeStoreFavorites(slug, favoriteItems);
  }, [favoriteItems, favoritesLoadedSlug, slug]);

  const loadCatalog = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [productsResult, categoriesResult] = await Promise.all([
        fetchPublicStoreProducts({
          slug,
          page,
          pageSize,
          search: debouncedSearch,
          categorias: selectedCategoryId,
        }),
        fetchPublicStoreCategories(slug),
      ]);

      setStore(productsResult.tienda);
      setProducts(productsResult.productos.items);
      setTotalPages(productsResult.productos.totalPages);
      setTotalRecords(productsResult.productos.totalRecords);
      setCategories(categoriesResult);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudo cargar el catalogo de esta tienda.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, page, pageSize, selectedCategoryId, slug]);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const favoriteIds = useMemo(
    () => new Set(favoriteItems.map((item) => item.id)),
    [favoriteItems],
  );

  const pageLabel = useMemo(
    () => `Pagina ${page} de ${Math.max(totalPages, 1)}`,
    [page, totalPages],
  );

  const categoryCounts = useMemo(() => {
    return products.reduce<Record<number, number>>((accumulator, product) => {
      const matchedCategory = categories.find(
        (category) => category.nombre === product.categoria,
      );

      if (matchedCategory) {
        accumulator[matchedCategory.id] = (accumulator[matchedCategory.id] ?? 0) + 1;
      }

      return accumulator;
    }, {});
  }, [categories, products]);

  const handleToggleFavorite = useCallback((product: PublicStoreProduct) => {
    const favorite = toFavoriteProduct(product);

    setFavoriteItems((currentItems) => {
      const exists = currentItems.some((item) => item.id === favorite.id);
      if (exists) {
        return currentItems.filter((item) => item.id !== favorite.id);
      }

      return [favorite, ...currentItems];
    });
  }, []);

  const handleRemoveFavorite = useCallback((productId: number) => {
    setFavoriteItems((currentItems) =>
      currentItems.filter((item) => item.id !== productId),
    );
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setPage(1);
    setSearch(value);
  }, []);

  const handleCategoryChange = useCallback((value: number | null) => {
    setPage(1);
    setSelectedCategoryId(value);
  }, []);

  const handleClearFilters = useCallback(() => {
    setPage(1);
    setSearch("");
    setSelectedCategoryId(null);
  }, []);

  const handlePageChange = useCallback((nextPage: number) => {
    setPage(nextPage);
  }, []);

  const toggleFavoritesPanel = useCallback(() => {
    setIsFavoritesOpen((current) => !current);
  }, []);

  return {
    slug,
    store,
    products,
    categories,
    search,
    selectedCategoryId,
    page,
    totalPages,
    totalRecords,
    isLoading,
    error,
    favoriteItems,
    favoriteIds,
    isFavoritesOpen,
    totalItems,
    pageLabel,
    categoryCounts,
    handleToggleFavorite,
    handleRemoveFavorite,
    handleSearchChange,
    handleCategoryChange,
    handleClearFilters,
    handlePageChange,
    toggleFavoritesPanel,
  };
}
