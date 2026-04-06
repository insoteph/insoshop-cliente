export function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-HN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-HN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function normalizeCurrencyCode(currency: string) {
  const normalized = currency.trim().toUpperCase();

  if (normalized === "L" || normalized === "HNL") {
    return "HNL";
  }

  if (normalized === "$") {
    return "USD";
  }

  return normalized;
}

export function formatCurrency(value: number, currency = "HNL") {
  const normalizedCurrency = normalizeCurrencyCode(currency);

  try {
    return new Intl.NumberFormat("es-HN", {
      style: "currency",
      currency: normalizedCurrency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `L ${new Intl.NumberFormat("es-HN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)}`;
  }
}
