"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useStoreCart } from "@/modules/store-catalog/providers/StoreCartProvider";
import {
  fetchPublicStoreProductById,
  fetchPublicStoreProducts,
} from "@/modules/store-catalog/services/store-catalog-service";
import type {
  PublicStoreProduct,
  PublicStoreProductDetail,
  PublicStoreProductVariant,
  PublicStoreSummary,
} from "@/modules/store-catalog/types/store-catalog-types";
import { usePublicStoreLightMode } from "@/modules/store-catalog/lib/use-public-store-light-mode";
import {
  readStoreFavorites,
  writeStoreFavorites,
  type StoreFavoriteProduct,
} from "@/modules/store-catalog/lib/store-favorites-storage";
import {
  buildAttributeSelectionInfo,
  buildImageSet,
  buildSelectionFromVariantPreview,
  buildVariantSummary,
  findVariantByImageUrl,
  toFavoriteProduct,
  variantMatchesSelection,
} from "@/modules/store-catalog/lib/product-detail.utils";

type UseProductDetailViewProps = {
  slug: string;
  productId: number;
};

export type ProductDetailViewModel = {
  slug: string;
  product: PublicStoreProductDetail;
  store: PublicStoreSummary | null;
  currency: string;
  totalItems: number;
  favoriteIds: Set<number>;
  isFavorite: boolean;
  variants: PublicStoreProductVariant[];
  previewVariant: PublicStoreProductVariant | null;
  activeVariant: PublicStoreProductVariant | null;
  selectedVariant: PublicStoreProductVariant | null;
  imageUrls: string[];
  attributeInfoByIndex: ReturnType<typeof buildAttributeSelectionInfo>;
  summaryProduct: PublicStoreProduct;
  quantity: number;
  maxQuantity: number;
  isOutOfStock: boolean;
  handleGalleryImageSelect: (imageUrl: string) => void;
  handleToggleFavorite: (targetProduct: PublicStoreProduct) => void;
  handleAttributeSelect: (attributeId: number, valueId: number) => void;
  handleDecreaseQuantity: () => void;
  handleIncreaseQuantity: () => void;
  handleAddToCart: () => void;
  handleBuyNow: () => void;
};

function hasCompleteSelection(
  product: PublicStoreProductDetail | null,
  selectedValues: Record<number, number>,
) {
  if (!product || product.atributos.length === 0) {
    return false;
  }

  return product.atributos.every((attribute) =>
    Boolean(selectedValues[attribute.atributoCatalogoId]),
  );
}

export function useProductDetailView({
  slug,
  productId,
}: UseProductDetailViewProps) {
  const router = useRouter();
  const { addItem, totalItems } = useStoreCart();
  const [product, setProduct] = useState<PublicStoreProductDetail | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState("HNL");
  const [store, setStore] = useState<PublicStoreSummary | null>(null);
  const [favoriteItems, setFavoriteItems] = useState<StoreFavoriteProduct[]>(
    [],
  );
  const [favoritesLoadedSlug, setFavoritesLoadedSlug] = useState<string | null>(
    null,
  );
  const [selectedValues, setSelectedValues] = useState<Record<number, number>>(
    {},
  );
  const [activeVariantId, setActiveVariantId] = useState<number | null>(null);

  usePublicStoreLightMode();

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

  const loadProduct = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [productResult, catalogResult] = await Promise.all([
        fetchPublicStoreProductById(slug, productId),
        fetchPublicStoreProducts({ slug, page: 1, pageSize: 1 }),
      ]);

      const firstVariant =
        productResult.variantes.find(
          (variant) => variant.estado && variant.cantidad > 0,
        ) ?? productResult.variantes[0];

      setProduct(productResult);
      setStore(catalogResult.tienda);
      setCurrency(catalogResult.tienda.moneda || "HNL");
      setActiveVariantId(firstVariant?.id ?? null);
      setSelectedValues(
        firstVariant
          ? firstVariant.valores.reduce<Record<number, number>>(
              (accumulator, value) => {
                accumulator[value.atributoCatalogoId] =
                  value.atributoCatalogoValorId;
                return accumulator;
              },
              {},
            )
          : {},
      );
      setQuantity(firstVariant?.cantidad && firstVariant.cantidad > 0 ? 1 : 0);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudo cargar este producto.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [productId, slug]);

  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);

  const favoriteIds = useMemo(
    () => new Set(favoriteItems.map((item) => item.id)),
    [favoriteItems],
  );
  const isFavorite = product ? favoriteIds.has(product.id) : false;

  const variants = useMemo(
    () => product?.variantes.filter((variant) => variant.estado) ?? [],
    [product],
  );

  const previewVariant = useMemo(() => {
    if (!product) {
      return null;
    }

    return (
      variants.find((variant) => variantMatchesSelection(variant, selectedValues)) ??
      variants[0] ??
      null
    );
  }, [product, selectedValues, variants]);

  const activeVariant = useMemo(() => {
    if (!product) {
      return null;
    }

    return (
      variants.find((variant) => variant.id === activeVariantId) ??
      previewVariant ??
      variants[0] ??
      null
    );
  }, [activeVariantId, previewVariant, product, variants]);

  const completeSelection = hasCompleteSelection(product, selectedValues);
  const selectedVariant = completeSelection ? previewVariant : activeVariant;

  useEffect(() => {
    if (!selectedVariant) {
      setQuantity(0);
      return;
    }

    setQuantity((current) => {
      if (selectedVariant.cantidad <= 0) {
        return 0;
      }

      if (current <= 0) {
        return 1;
      }

      return Math.min(current, selectedVariant.cantidad);
    });
  }, [selectedVariant]);

  const imageUrls = useMemo(
    () => buildImageSet(selectedVariant, variants),
    [selectedVariant, variants],
  );

  const handleGalleryImageSelect = useCallback(
    (imageUrl: string) => {
      const matchedVariant = findVariantByImageUrl(variants, imageUrl);
      if (!matchedVariant || !product) {
        return;
      }

      setActiveVariantId(matchedVariant.id);
      setSelectedValues(
        buildSelectionFromVariantPreview(product, variants, matchedVariant),
      );
    },
    [product, variants],
  );

  const attributeInfoByIndex = useMemo(
    () => buildAttributeSelectionInfo(product, selectedValues, variants),
    [product, selectedValues, variants],
  );

  const handleToggleFavorite = useCallback((targetProduct: PublicStoreProduct) => {
    const favorite = toFavoriteProduct(targetProduct);

    setFavoriteItems((currentItems) => {
      const exists = currentItems.some((item) => item.id === favorite.id);
      if (exists) {
        return currentItems.filter((item) => item.id !== favorite.id);
      }

      return [favorite, ...currentItems];
    });
  }, []);

  const handleAttributeSelect = useCallback(
    (attributeId: number, valueId: number) => {
      if (!product) {
        return;
      }

      const attributeIndex = product.atributos.findIndex(
        (attribute) => attribute.atributoCatalogoId === attributeId,
      );

      if (attributeIndex < 0) {
        return;
      }

      setActiveVariantId(null);
      setSelectedValues((current) => {
        const nextSelections: Record<number, number> = {};

        product.atributos.slice(0, attributeIndex).forEach((attribute) => {
          const selectedValueId = current[attribute.atributoCatalogoId];
          if (selectedValueId) {
            nextSelections[attribute.atributoCatalogoId] = selectedValueId;
          }
        });

        nextSelections[attributeId] = valueId;
        return nextSelections;
      });
    },
    [product],
  );

  const handleDecreaseQuantity = useCallback(() => {
    setQuantity((current) => Math.max(current - 1, 1));
  }, []);

  const handleIncreaseQuantity = useCallback(() => {
    const maxQuantity = selectedVariant?.cantidad ?? 0;
    setQuantity((current) => Math.min(current + 1, Math.max(maxQuantity, 1)));
  }, [selectedVariant]);

  const summaryProduct = useMemo<PublicStoreProduct>(() => {
    if (!product) {
      return {
        id: 0,
        nombre: "",
        descripcion: "",
        precio: 0,
        cantidadDisponible: 0,
        categoria: "",
        imagenes: [],
      };
    }

    return {
      id: product.id,
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: selectedVariant?.precio ?? 0,
      cantidadDisponible: selectedVariant?.cantidad ?? 0,
      categoria: product.categoria,
      imagenes: imageUrls,
    };
  }, [imageUrls, product, selectedVariant]);

  const maxQuantity = selectedVariant?.cantidad ?? 0;
  const isOutOfStock = !selectedVariant || maxQuantity <= 0;

  const handleAddToCart = useCallback(() => {
    if (!product || !selectedVariant) {
      return;
    }

    addItem({
      productId: product.id,
      productoVarianteId: selectedVariant.id,
      nombre: product.nombre,
      precio: selectedVariant.precio,
      cantidad: quantity,
      cantidadDisponible: selectedVariant.cantidad,
      categoria: product.categoria,
      imagenUrl: imageUrls[0]?.trim() || null,
      varianteResumen: buildVariantSummary(selectedVariant),
    });
  }, [addItem, imageUrls, product, quantity, selectedVariant]);

  const handleBuyNow = useCallback(() => {
    if (!product || !selectedVariant) {
      return;
    }

    addItem(
      {
        productId: product.id,
        productoVarianteId: selectedVariant.id,
        nombre: product.nombre,
        precio: selectedVariant.precio,
        cantidad: quantity,
        cantidadDisponible: selectedVariant.cantidad,
        categoria: product.categoria,
        imagenUrl: imageUrls[0]?.trim() || null,
        varianteResumen: buildVariantSummary(selectedVariant),
      },
      { notify: false },
    );
    router.push(`/${encodeURIComponent(slug)}/carrito`);
  }, [addItem, imageUrls, product, quantity, router, selectedVariant, slug]);

  return {
    slug,
    product,
    store,
    currency,
    totalItems,
    favoriteIds,
    isFavorite,
    variants,
    previewVariant,
    activeVariant,
    selectedVariant,
    imageUrls,
    attributeInfoByIndex,
    summaryProduct,
    quantity,
    maxQuantity,
    isOutOfStock,
    handleGalleryImageSelect,
    handleToggleFavorite,
    handleAttributeSelect,
    handleDecreaseQuantity,
    handleIncreaseQuantity,
    handleAddToCart,
    handleBuyNow,
    isLoading,
    error,
  };
}
