import { PublicStoreView } from "@/modules/public-store/components/PublicStoreView";

export default async function PublicStorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <PublicStoreView slug={slug} />;
}
