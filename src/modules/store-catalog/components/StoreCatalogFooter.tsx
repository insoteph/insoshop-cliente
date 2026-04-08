"use client";

type StoreCatalogFooterProps = {
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
};

export function StoreCatalogFooter({
  facebookUrl,
  instagramUrl,
  tiktokUrl,
}: StoreCatalogFooterProps) {
  return (
    <footer className="app-card mt-10 rounded-3xl px-5 py-4">
      <div className="flex flex-col gap-3 text-sm text-[var(--muted)] md:flex-row md:items-center md:justify-between">
        <p>
          Sitio web desarrollado por{" "}
          <a
            href="https://insoteph.com"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-[var(--accent)] hover:underline"
          >
            Insoteph
          </a>
        </p>

        <div className="flex items-center gap-2">
          <a
            href={facebookUrl ?? "#"}
            target={facebookUrl ? "_blank" : undefined}
            rel={facebookUrl ? "noreferrer" : undefined}
            className="app-button-secondary rounded-full px-3 py-2 text-xs font-semibold"
          >
            Facebook
          </a>
          <a
            href={instagramUrl ?? "#"}
            target={instagramUrl ? "_blank" : undefined}
            rel={instagramUrl ? "noreferrer" : undefined}
            className="app-button-secondary rounded-full px-3 py-2 text-xs font-semibold"
          >
            Instagram
          </a>
          <a
            href={tiktokUrl ?? "#"}
            target={tiktokUrl ? "_blank" : undefined}
            rel={tiktokUrl ? "noreferrer" : undefined}
            className="app-button-secondary rounded-full px-3 py-2 text-xs font-semibold"
          >
            TikTok
          </a>
        </div>
      </div>
    </footer>
  );
}
