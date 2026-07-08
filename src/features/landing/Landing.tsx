import { LINK_WHATSAPP_CONTACTO, NOMBRE_PLATAFORMA, urlDemo } from "./marca";

const PASOS = [
  {
    titulo: "Te creamos tu tienda",
    texto: "Con el nombre de tu comercio y tu número de WhatsApp alcanza para arrancar.",
  },
  {
    titulo: "La personalizás vos",
    texto:
      "Colores, logo, horarios y catálogo desde tu panel, sin escribir una línea de código.",
  },
  {
    titulo: "La publicás",
    texto: "Tu tienda queda online en su propia dirección web, lista para compartir.",
  },
  {
    titulo: "Recibís pedidos por WhatsApp",
    texto:
      "El cliente arma el carrito y el pedido te llega armado, listo para confirmar. Todo queda registrado en tu panel.",
  },
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
    className="size-5 shrink-0 text-emerald-600"
  >
    <path d="m4 12.5 5 5L20 6.5" />
  </svg>
);

export function Landing() {
  const demo = urlDemo();

  return (
    <div className="min-h-screen bg-white text-stone-900">
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-6 px-4">
          <p className="text-lg font-black tracking-tight text-emerald-700">
            {NOMBRE_PLATAFORMA}
          </p>
          <nav className="hidden gap-5 text-sm font-medium text-stone-600 sm:flex">
            <a href="#como-funciona" className="hover:text-stone-900">
              Cómo funciona
            </a>
            <a href="#diferenciales" className="hover:text-stone-900">
              Diferenciales
            </a>
            <a href="#precios" className="hover:text-stone-900">
              Precios
            </a>
          </nav>
          <a
            href={demo}
            className="ml-auto rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Ver la demo
          </a>
        </div>
      </header>

      <section className="mx-auto flex max-w-5xl flex-col items-center gap-5 px-4 pt-20 pb-16 text-center">
        <span className="rounded-full bg-emerald-50 px-4 py-1 text-sm font-semibold text-emerald-700">
          Sin comisiones por venta
        </span>
        <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">
          Tu comercio ya vende por WhatsApp. Nosotros le ponemos el catálogo.
        </h1>
        <p className="max-w-2xl text-lg text-stone-600">
          Una tienda online con tu marca y tu propia dirección web, donde tus clientes arman el
          pedido y te lo mandan por WhatsApp. Sin apps, sin cuentas, sin vueltas.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href={demo}
            className="rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white hover:bg-emerald-700"
          >
            Ver la demo en vivo
          </a>
          <a
            href={LINK_WHATSAPP_CONTACTO}
            className="rounded-xl border border-stone-300 px-6 py-3 font-bold text-stone-700 hover:border-stone-400"
          >
            Hablemos
          </a>
        </div>
      </section>

      <section id="como-funciona" className="scroll-mt-16 border-t border-stone-100 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-3xl font-bold">Cómo funciona</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PASOS.map((paso, indice) => (
              <div key={paso.titulo} className="flex flex-col gap-2">
                <span className="text-4xl font-black text-emerald-600">{indice + 1}</span>
                <h3 className="font-bold">{paso.titulo}</h3>
                <p className="text-sm text-stone-600">{paso.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="diferenciales" className="scroll-mt-16 bg-stone-50 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center text-3xl font-bold">Pensado para el que atiende el mostrador</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DIFERENCIALES.map((diferencial) => (
              <div
                key={diferencial.titulo}
                className="flex flex-col gap-2 rounded-2xl border border-stone-200 bg-white p-5"
              >
                <div className="flex items-center gap-2">
                  <IconoCheck />
                  <h3 className="font-bold">{diferencial.titulo}</h3>
                </div>
                <p className="text-sm text-stone-600">{diferencial.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex flex-col items-center gap-4 rounded-3xl bg-emerald-700 px-6 py-12 text-center text-white">
            <h2 className="text-3xl font-bold">Miralo andando, con datos reales</h2>
            <p className="max-w-xl text-emerald-50">
              Almacén Aurora es nuestra tienda de demostración: navegá el catálogo, armá un
              carrito y llegá hasta el pedido por WhatsApp.
            </p>
            <a
              href={demo}
              className="rounded-xl bg-white px-6 py-3 font-bold text-emerald-700 hover:bg-emerald-50"
            >
              Entrar a la demo
            </a>
          </div>
        </div>
      </section>

      <section id="precios" className="scroll-mt-16 border-t border-stone-100 py-16">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 text-center">
          <h2 className="text-3xl font-bold">Precios</h2>
          <p className="text-stone-600">
            Cada comercio es distinto: no es lo mismo un kiosco que una ferretería con tres mil
            artículos. Contanos tu caso y armamos un plan a tu medida, sin sorpresas.
          </p>
          <a
            href={LINK_WHATSAPP_CONTACTO}
            className="rounded-xl bg-stone-900 px-6 py-3 font-bold text-white hover:bg-stone-700"
          >
            Contanos tu caso
          </a>
        </div>
      </section>

      <section id="contacto" className="scroll-mt-16 bg-stone-50 py-16">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 text-center">
          <h2 className="text-3xl font-bold">¿Arrancamos?</h2>
          <p className="text-stone-600">
            Escribinos por WhatsApp — como corresponde — y en la misma semana tu comercio puede
            estar recibiendo pedidos.
          </p>
          <a
            href={LINK_WHATSAPP_CONTACTO}
            className="rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white hover:bg-emerald-700"
          >
            Escribinos por WhatsApp
          </a>
        </div>
      </section>

      <footer className="border-t border-stone-200 py-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 text-sm text-stone-500">
          <p className="font-bold text-stone-700">{NOMBRE_PLATAFORMA}</p>
          <p>Hecho para comercios que venden por WhatsApp.</p>
        </div>
      </footer>
    </div>
  );
}
