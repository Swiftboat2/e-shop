import { GestionPedidos } from "@/features/panel/GestionPedidos";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PedidosPage({ params }: Props) {
  const { slug } = await params;
  return <GestionPedidos slug={slug} />;
}
