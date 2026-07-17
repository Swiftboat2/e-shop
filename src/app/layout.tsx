import type { Metadata } from "next";
import {
  Archivo,
  Bricolage_Grotesque,
  Chivo,
  Geist,
  Geist_Mono,
  Inter,
  Karla,
  Outfit,
  Source_Sans_3,
  Space_Grotesk,
  Work_Sans,
} from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display de la landing de la plataforma; no es elegible por los comercios.
// El eje "wdth" habilita el trazo expandido (font-stretch) del hero.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

// Set cerrado de combos tipográficos elegibles por los comercios (ver
// features/comercio/opciones.ts). Cada tenant usa un solo combo, así que no
// se precargan: precargar las ocho fuentes penalizaría todas las rutas.
// Inter no lleva preload:false porque además es la sans del cuerpo de la landing.
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  preload: false,
});
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  preload: false,
});
const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  preload: false,
});
const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"], preload: false });
const karla = Karla({ variable: "--font-karla", subsets: ["latin"], preload: false });
const chivo = Chivo({ variable: "--font-chivo", subsets: ["latin"], preload: false });
const workSans = Work_Sans({ variable: "--font-work-sans", subsets: ["latin"], preload: false });

export const metadata: Metadata = {
  title: "Catálogos online con pedidos por WhatsApp",
  description:
    "Cada comercio con su propia tienda online: catálogo, carrito y pedidos que se cierran por WhatsApp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fuentes = [
    geistSans,
    geistMono,
    archivo,
    inter,
    spaceGrotesk,
    bricolage,
    sourceSans,
    outfit,
    karla,
    chivo,
    workSans,
  ]
    .map((fuente) => fuente.variable)
    .join(" ");

  return (
    <html lang="en" className={`${fuentes} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
