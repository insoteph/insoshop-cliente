"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TiendasPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return (
    <section className="panel-card">
      <p className="text-sm text-[var(--muted)]">
        Redirigiendo a la administracion...
      </p>
    </section>
  );
}
