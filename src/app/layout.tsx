import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AppProviders } from "@/modules/core/providers/AppProviders";

export const metadata: Metadata = {
  title: "InsoShop",
  description: "Panel y tienda publica de InsoShop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                const storageKey = "insoshop.theme";
                const storedTheme = window.localStorage.getItem(storageKey);
                const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                const resolvedTheme =
                  storedTheme === "dark" || storedTheme === "light"
                    ? storedTheme
                    : systemPrefersDark
                      ? "dark"
                      : "light";

                document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
              })();
            `,
          }}
        />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
