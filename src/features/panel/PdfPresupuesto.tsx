import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { formatearPrecio } from "@/core/dominio/precio";
import { formatearNumeroPresupuesto } from "./formato";
import type { Contacto, Presupuesto } from "@/core/types";

export interface DatosComercioPdf {
  nombre: string;
  whatsappNumero: string;
  contacto: Contacto;
}

const estilos = StyleSheet.create({
  pagina: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#1c1917" },
  encabezado: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  comercio: { fontSize: 16, fontFamily: "Helvetica-Bold" },
  titulo: { fontSize: 14, fontFamily: "Helvetica-Bold", textAlign: "right" },
  gris: { color: "#78716c" },
  seccion: { marginBottom: 16 },
  filaTabla: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e7e5e4",
    paddingVertical: 6,
  },
  cabeceraTabla: { fontFamily: "Helvetica-Bold", color: "#78716c" },
  colDescripcion: { flex: 5 },
  colCantidad: { flex: 2, textAlign: "right" },
  colPrecio: { flex: 2, textAlign: "right" },
  colSubtotal: { flex: 2, textAlign: "right" },
  totales: { marginTop: 12, alignItems: "flex-end", gap: 3 },
  filaTotal: { flexDirection: "row", gap: 24 },
  totalFinal: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  pie: { position: "absolute", bottom: 32, left: 40, right: 40, color: "#78716c", fontSize: 8 },
});

export function PdfPresupuesto({
  presupuesto,
  comercio,
}: {
  presupuesto: Presupuesto;
  comercio: DatosComercioPdf;
}) {
  const cantidadConUnidad = (cantidad: number, unidad?: string) =>
    `${formatearPrecio(cantidad)}${unidad ? ` ${unidad}` : ""}`;

  return (
    <Document>
      <Page size="A4" style={estilos.pagina}>
        <View style={estilos.encabezado}>
          <View>
            <Text style={estilos.comercio}>{comercio.nombre}</Text>
            {comercio.contacto.direccion ? (
              <Text style={estilos.gris}>{comercio.contacto.direccion}</Text>
            ) : null}
            {comercio.contacto.telefono ? (
              <Text style={estilos.gris}>{comercio.contacto.telefono}</Text>
            ) : null}
          </View>
          <View>
            <Text style={estilos.titulo}>
              PRESUPUESTO {formatearNumeroPresupuesto(presupuesto.numero)}
            </Text>
            <Text style={[estilos.gris, { textAlign: "right" }]}>
              Fecha: {presupuesto.createdAt.toLocaleDateString("es-AR")}
            </Text>
            {presupuesto.validezDias ? (
              <Text style={[estilos.gris, { textAlign: "right" }]}>
                Válido por {presupuesto.validezDias} días
              </Text>
            ) : null}
          </View>
        </View>

        <View style={estilos.seccion}>
          <Text style={estilos.cabeceraTabla}>Cliente</Text>
          <Text>{presupuesto.datosCliente.nombre}</Text>
          {presupuesto.datosCliente.telefono ? (
            <Text style={estilos.gris}>{presupuesto.datosCliente.telefono}</Text>
          ) : null}
          {presupuesto.datosCliente.notas ? (
            <Text style={estilos.gris}>{presupuesto.datosCliente.notas}</Text>
          ) : null}
        </View>

        <View style={[estilos.filaTabla, estilos.cabeceraTabla]}>
          <Text style={estilos.colDescripcion}>Descripción</Text>
          <Text style={estilos.colCantidad}>Cantidad</Text>
          <Text style={estilos.colPrecio}>Precio unit.</Text>
          <Text style={estilos.colSubtotal}>Subtotal</Text>
        </View>
        {presupuesto.items.map((item, indice) => (
          <View key={indice} style={estilos.filaTabla}>
            <Text style={estilos.colDescripcion}>{item.descripcion}</Text>
            <Text style={estilos.colCantidad}>
              {cantidadConUnidad(item.cantidad, item.unidad)}
            </Text>
            <Text style={estilos.colPrecio}>${formatearPrecio(item.precioUnitario)}</Text>
            <Text style={estilos.colSubtotal}>${formatearPrecio(item.subtotal)}</Text>
          </View>
        ))}

        <View style={estilos.totales}>
          <View style={estilos.filaTotal}>
            <Text style={estilos.gris}>Subtotal</Text>
            <Text>${formatearPrecio(presupuesto.subtotal)}</Text>
          </View>
          {presupuesto.descuentoPorcentaje ? (
            <View style={estilos.filaTotal}>
              <Text style={estilos.gris}>Descuento ({presupuesto.descuentoPorcentaje}%)</Text>
              <Text>
                -${formatearPrecio(presupuesto.subtotal - presupuesto.total)}
              </Text>
            </View>
          ) : null}
          <View style={estilos.filaTotal}>
            <Text style={estilos.totalFinal}>Total</Text>
            <Text style={estilos.totalFinal}>${formatearPrecio(presupuesto.total)}</Text>
          </View>
        </View>

        <Text style={estilos.pie}>
          Este presupuesto es una cotización no vinculante y no constituye un comprobante
          fiscal. Consultas por WhatsApp: +{comercio.whatsappNumero}
        </Text>
      </Page>
    </Document>
  );
}
