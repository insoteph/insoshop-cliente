const RESERVED_SUBDOMAINS = new Set([
  "admin",
  "api",
  "auth",
  "dashboard",
  "store",
  "stores",
  "tiendas",
  "www",
]);

function normalizeSubdomain(value: string) {
  return value.trim().toLowerCase();
}

function getRootDomain() {
  return (
    process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim().toLowerCase() || "localhost"
  );
}

function getWindowLocation() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.location;
}

export function getCurrentHostStoreSubdomain() {
  const location = getWindowLocation();
  if (!location) {
    return null;
  }

  const hostname = location.hostname.toLowerCase();
  const rootDomain = getRootDomain();

  if (hostname === rootDomain) {
    return null;
  }

  if (!hostname.endsWith(`.${rootDomain}`)) {
    return null;
  }

  const candidate = hostname.slice(0, -(rootDomain.length + 1));
  const storeSubdomain = candidate.split(".").pop()?.trim().toLowerCase();

  if (
    !storeSubdomain ||
    RESERVED_SUBDOMAINS.has(storeSubdomain) ||
    storeSubdomain === "localhost"
  ) {
    return null;
  }

  return storeSubdomain;
}

export function buildStoreAdminUrl(subdomain: string, pathname = "/admin") {
  const normalizedSubdomain = normalizeSubdomain(subdomain);

  if (!normalizedSubdomain) {
    return pathname;
  }

  const location = getWindowLocation();
  if (!location) {
    return pathname;
  }

  const rootDomain = getRootDomain();
  const { protocol, port } = location;
  const portSuffix = port ? `:${port}` : "";

  return `${protocol}//${normalizedSubdomain}.${rootDomain}${portSuffix}${pathname}`;
}
