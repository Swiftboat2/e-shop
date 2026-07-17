import { LINK_WHATSAPP_CONTACTO, NOMBRE_PLATAFORMA, urlDemo } from "./marca";

// Tipografía display de la landing: Archivo variable estirada al máximo del
// eje "wdth" (125%), para el trazo firme y expandido del hero y los títulos.
const DISPLAY = "font-[family-name:var(--font-archivo)] [font-stretch:125%]";

const PASOS = [
  {
    titulo: "Mostrás",
    texto:
      "Tu catálogo con tu marca y tus precios, en su propia dirección web. Lo compartís donde ya hablás con tus clientes.",
  },
  {
    titulo: "Eligen",
    texto: "Entran, miran y arman el carrito solos. Sin cuentas, sin registro, sin fricción.",
  },
  {
    titulo: "Te llega al chat",
    texto:
      "El pedido cae armado en tu WhatsApp, listo para confirmar. Y queda registrado en tu panel.",
  },
];

// Réplica del texto plano que genera generarLinkWhatsApp, como prueba visual
// del paso 3: así se ve un pedido real al llegar al chat del comercio.
const MENSAJE_PEDIDO = `PEDIDO NUEVO

2x Yerba Mate Orgánica 1kg - $17.000
0,5kg Almendras Nonpareil - $14.000

Total: $31.000

Nombre: Carla
Metodo de pago: Efectivo`;

// Productos y tema del tenant demo (Almacén Aurora), para que lo que se ve
// detrás del vidrio sea el catálogo real y no un mockup genérico.
const PRODUCTOS_VIDRIERA = [
  { nombre: "Yerba Mate Orgánica 1kg", precio: "8.500" },
  { nombre: "Almendras Nonpareil", precio: "28.000", unidad: "kg" },
  { nombre: "Miel Pura de Monte 500g", precio: "6.800" },
  { nombre: "Kombucha de Jengibre 500ml", precio: "5.500" },
];

const DIFERENCIALES = [
  {
    titulo: "Sin comisión por venta",
    texto: "Lo que vendés es tuyo. No cobramos porcentaje de tus pedidos.",
  },
  {
    titulo: "Tus clientes no necesitan cuenta",
    texto: "Entran, eligen y piden. Cero registro, cero fricción.",
  },
  {
    titulo: "Seguís cerrando por WhatsApp",
    texto: "La venta termina donde siempre: en tu chat, con tu cliente.",
  },
  {
    titulo: "Panel propio",
    texto: "Pedidos, estadísticas, presupuestos en PDF y catálogo, todo en un solo lugar.",
  },
  {
    titulo: "Personalización sin código",
    texto: "Tu marca, tus colores, tus horarios y tus formas de venta.",
  },
  {
    titulo: "Para cualquier rubro",
    texto:
      "Kioscos, hamburgueserías, ferreterías, indumentaria, venta a granel. El catálogo se adapta a vos.",
  },
];

const IconoCheck = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    className="size-5 shrink-0 text-[#2D5F4C]"
  >
    <path d="m4 12.5 5 5L20 6.5" />
  </svg>
);

/** Vista estática del catálogo demo dentro de un marco de navegador. */
const CatalogoDemo = () => (
  <div className="bg-[#fafaf9] text-[#1c1917]">
    <div className="flex items-center gap-3 border-b border-black/10 px-5 py-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#15803d] text-sm font-bold text-white">
        A
      </span>
      <p className="truncate font-bold">Almacén Aurora</p>
      <span className="ml-auto shrink-0 rounded-full bg-[#15803d] px-3 py-1 text-xs font-semibold text-white">
        Carrito · 2
      </span>
    </div>
    <div className="flex flex-col items-center gap-2 px-6 pt-6 pb-4 text-center">
      <span className="rounded-full bg-[#b45309]/15 px-3 py-0.5 text-[11px] font-semibold text-[#b45309]">
        10% off en efectivo desde 10 unidades
      </span>
      <p className="text-xl font-bold sm:text-2xl">
        Todo lo natural, <span className="text-[#15803d]">a un mensaje de distancia</span>
      </p>
    </div>
    <div className="grid grid-cols-2 gap-3 px-6 pb-8 sm:grid-cols-4">
      {PRODUCTOS_VIDRIERA.map((producto) => (
        <div
          key={producto.nombre}
          className="overflow-hidden rounded-xl border border-black/10 bg-white/60 shadow-sm"
        >
          <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-[#15803d]/15 to-[#b45309]/15 text-3xl font-bold text-[#15803d]">
            {producto.nombre.charAt(0)}
          </div>
          <div className="flex flex-col gap-1 p-2.5">
            <p className="text-xs font-semibold leading-tight">{producto.nombre}</p>
            <div className="flex items-center justify-between pt-1">
              <p className="text-sm font-bold">
                ${producto.precio}
                {producto.unidad && (
                  <span className="text-[10px] font-normal opacity-60"> /{producto.unidad}</span>
                )}
              </p>
              <span className="rounded-full bg-[#15803d] px-2 py-0.5 text-[10px] font-semibold text-white">
                Agregar
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export function Landing() {
  const demo = urlDemo();

  return (
    <div className="min-h-screen bg-[#F5F3EF] font-[family-name:var(--font-inter)] text-[#1C1B19]">
      <header className="sticky top-0 z-20 border-b border-[#1C1B19]/10 bg-[#F5F3EF]">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
          <p className={`${DISPLAY} text-lg font-extrabold tracking-tight`}>{NOMBRE_PLATAFORMA}</p>
          <nav className="ml-auto flex items-center gap-5 text-sm font-medium">
            <a href="#como-funciona" className="text-[#1C1B19]/70 hover:text-[#1C1B19]">
              Cómo funciona
            </a>
            <a
              href={demo}
              className="rounded-full bg-[#2D5F4C] px-4 py-1.5 font-semibold text-[#F5F3EF] hover:bg-[#24503F]"
            >
              Demo
            </a>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pt-16 pb-20 sm:pt-24">
        <h1
          className={`${DISPLAY} max-w-4xl text-5xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl`}
        >
          Tu vidriera,
          <br />
          <span className="text-[#2D5F4C]">siempre abierta.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-[#1C1B19]/70">
          Un catálogo online con tu marca, donde tus clientes miran, eligen y te mandan el pedido
          por WhatsApp. Sin apps, sin cuentas, sin vueltas.
        </p>

        {/* La vidriera: el catálogo demo detrás de un panel de vidrio que se
            empaña y aclara al cargar. Decorativo: el texto del hero ya lo cuenta. */}
        <div
          aria-hidden="true"
          className="relative mt-12 overflow-hidden rounded-2xl border border-[#1C1B19]/10 bg-white shadow-[0_32px_64px_-32px_rgba(28,27,25,0.45)]"
        >
          <div className="flex items-center gap-1.5 border-b border-[#1C1B19]/10 bg-[#E8E4DC] px-4 py-2.5">
            <span className="size-2.5 rounded-full bg-[#1C1B19]/15" />
            <span className="size-2.5 rounded-full bg-[#1C1B19]/15" />
            <span className="size-2.5 rounded-full bg-[#1C1B19]/15" />
            <span className="ml-3 w-full max-w-56 truncate rounded-full bg-white/70 px-3 py-1 text-xs text-[#1C1B19]/50">
              {demo.replace(/^https?:\/\//, "")}
            </span>
          </div>
          <div className="relative max-h-[30rem] overflow-hidden">
            <CatalogoDemo />
            <div className="vidrio-panel absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent" />
              <div className="vidrio-brillo absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent opacity-0" />
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href={demo}
            className="rounded-full bg-[#2D5F4C] px-7 py-3 font-bold text-[#F5F3EF] hover:bg-[#24503F]"
          >
            Ver demo
          </a>
          <a
            href={LINK_WHATSAPP_CONTACTO}
            className="rounded-full border border-[#1C1B19]/20 px-7 py-3 font-bold text-[#1C1B19] hover:border-[#1C1B19]/40"
          >
            Hablar por WhatsApp
          </a>
        </div>
      </section>

      <section id="como-funciona" className="scroll-mt-16 border-t border-[#1C1B19]/10 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className={`${DISPLAY} text-3xl font-extrabold tracking-tight sm:text-4xl`}>
            Cómo funciona
          </h2>

          {/* Secuencia conectada por una línea, como un mostrador: los pasos
              se apoyan sobre ella en lugar de numerarse. */}
          <div className="relative mt-14 grid gap-12 sm:grid-cols-3 sm:gap-8">
            <div className="absolute top-1 left-[5px] h-full w-px bg-[#2D5F4C]/25 sm:top-[5px] sm:left-0 sm:h-px sm:w-full" />
            {PASOS.map((paso) => (
              <div key={paso.titulo} className="relative pl-8 sm:pt-8 sm:pl-0">
                <span className="absolute top-1 left-0 size-3 rounded-full bg-[#2D5F4C] ring-4 ring-[#F5F3EF] sm:top-0" />
                <h3 className={`${DISPLAY} text-2xl font-extrabold tracking-tight`}>
                  {paso.titulo}
                </h3>
                <p className="mt-2 text-[#1C1B19]/70">{paso.texto}</p>
                {paso.titulo === "Te llega al chat" && (
                  <div className="mt-5 max-w-xs rounded-xl rounded-tl-sm bg-white p-3 shadow-sm ring-1 ring-black/5">
                    <pre className="font-[family-name:var(--font-inter)] text-[13px] leading-5 whitespace-pre-wrap">
                      {MENSAJE_PEDIDO}
                    </pre>
                    <p className="mt-1 text-right text-[11px] text-[#1C1B19]/40">10:24</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="diferenciales" className="scroll-mt-16 border-t border-[#1C1B19]/10 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className={`${DISPLAY} text-3xl font-extrabold tracking-tight sm:text-4xl`}>
            Pensado para el que atiende el mostrador
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DIFERENCIALES.map((diferencial) => (
              <div
                key={diferencial.titulo}
                className="flex flex-col gap-2 rounded-2xl border border-[#1C1B19]/10 bg-white p-5"
              >
                <div className="flex items-center gap-2">
                  <IconoCheck />
                  <h3 className="font-bold">{diferencial.titulo}</h3>
                </div>
                <p className="text-sm text-[#1C1B19]/70">{diferencial.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center gap-4 rounded-3xl bg-[#2D5F4C] px-6 py-12 text-center text-[#F5F3EF]">
            <h2 className={`${DISPLAY} text-3xl font-extrabold tracking-tight`}>
              Miralo andando, con datos reales
            </h2>
            <p className="max-w-xl text-[#F5F3EF]/80">
              Almacén Aurora es nuestra tienda de demostración: navegá el catálogo, armá un
              carrito y llegá hasta el pedido por WhatsApp.
            </p>
            <a
              href={demo}
              className="rounded-full bg-[#F5F3EF] px-7 py-3 font-bold text-[#2D5F4C] hover:bg-white"
            >
              Entrar a la demo
            </a>
          </div>
        </div>
      </section>

      <section id="precios" className="scroll-mt-16 py-20">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 text-center">
          <h2 className={`${DISPLAY} text-3xl font-extrabold tracking-tight`}>Precios</h2>
          <p className="text-[#1C1B19]/70">
            Cada comercio es distinto: no es lo mismo un kiosco que una ferretería con tres mil
            artículos. Contanos tu caso y armamos un plan a tu medida, sin sorpresas.
          </p>
          <a
            href={LINK_WHATSAPP_CONTACTO}
            className="rounded-full bg-[#1C1B19] px-7 py-3 font-bold text-[#F5F3EF] hover:bg-[#1C1B19]/85"
          >
            Contanos tu caso
          </a>
        </div>
      </section>

      <section id="contacto" className="scroll-mt-16 border-t border-[#1C1B19]/10 bg-[#E8E4DC]/50 py-20">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 text-center">
          <h2 className={`${DISPLAY} text-3xl font-extrabold tracking-tight`}>¿Arrancamos?</h2>
          <p className="text-[#1C1B19]/70">
            Escribinos por WhatsApp — como corresponde — y en la misma semana tu comercio puede
            estar recibiendo pedidos.
          </p>
          <a
            href={LINK_WHATSAPP_CONTACTO}
            className="rounded-full bg-[#2D5F4C] px-7 py-3 font-bold text-[#F5F3EF] hover:bg-[#24503F]"
          >
            Escribinos por WhatsApp
          </a>
        </div>
      </section>

      <footer className="border-t border-[#1C1B19]/10 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 text-sm text-[#1C1B19]/60">
          <p className={`${DISPLAY} font-extrabold text-[#1C1B19]`}>{NOMBRE_PLATAFORMA}</p>
          <p>Hecho para comercios que venden por WhatsApp.</p>
        </div>
      </footer>
    </div>
  );
}
