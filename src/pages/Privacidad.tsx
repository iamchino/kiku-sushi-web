import { useEffect } from "react";
import { Link } from "react-router-dom";
import NavbarV2 from "@/components/kiku-v2/NavbarV2";
import FooterV2 from "@/components/kiku-v2/FooterV2";
import { useLenisScroll } from "@/hooks/useLenisScroll";

const EMAIL = "kikusushirosario@gmail.com";
const ACTUALIZADA = "1 de noviembre de 2026";

/**
 * Política de privacidad — Ley 25.326 (Argentina) e ISO 27701.
 * Texto base redactado para Kiku Sushi; revisar con el contador / asesor legal
 * antes de cambiar plazos o finalidades. Los plazos de retención coinciden
 * con los del dashboard (función aplicar_retencion).
 */
const Privacidad = () => {
  useLenisScroll();

  useEffect(() => {
    document.body.classList.add("v2-root");
    return () => { document.body.classList.remove("v2-root"); };
  }, []);

  const Seccion = ({ titulo, children }: { titulo: string; children: React.ReactNode }) => (
    <section className="space-y-3">
      <h2 className="font-display text-2xl md:text-3xl font-light">{titulo}</h2>
      <div className="space-y-3 text-[15px] leading-[1.8] v2-text-muted">{children}</div>
    </section>
  );

  return (
    <div className="v2-root min-h-screen overflow-x-hidden v2-bg-base flex flex-col">
      <NavbarV2 />
      <main className="flex-1 pt-32 pb-24 px-6 md:px-14">
        <div className="max-w-3xl mx-auto space-y-12">
          <header className="space-y-4">
            <span className="font-jp text-xs tracking-[0.45em] text-v2-champagne block">— プライバシー —</span>
            <h1 className="font-display font-light leading-[0.95] tracking-[-0.02em]" style={{ fontSize: "clamp(36px, 5vw, 64px)" }}>
              Política de <span className="font-normal text-v2-champagne">privacidad</span>
            </h1>
            <p className="text-sm v2-text-dim">Última actualización: {ACTUALIZADA}</p>
          </header>

          <Seccion titulo="Quién trata tus datos">
            <p>
              Kiku Sushi (Rosario, Santa Fe, Argentina) es responsable del tratamiento de los datos personales
              que cargás en este sitio para reservar una mesa, anotarte en la lista de espera o hacer un pedido.
              Podés escribirnos a <a className="text-v2-champagne hover:underline" href={`mailto:${EMAIL}`}>{EMAIL}</a>.
            </p>
          </Seccion>

          <Seccion titulo="Qué datos pedimos y para qué">
            <p>
              <strong className="v2-text">Reservas y lista de espera:</strong> nombre, teléfono y, si querés, email,
              fecha de cumpleaños, restricciones alimentarias, necesidades de accesibilidad y notas. Los usamos
              únicamente para gestionar tu reserva, avisarte si hay cambios y preparar tu visita. Las restricciones
              y la accesibilidad son opcionales: cargalas solo si querés que las tengamos en cuenta.
            </p>
            <p>
              <strong className="v2-text">Pedidos online:</strong> nombre, teléfono, dirección (si es delivery) y notas,
              para preparar y entregar el pedido y contactarte si hace falta.
            </p>
            <p>
              <strong className="v2-text">Promos y novedades:</strong> solo si marcás la casilla al reservar. Podés darte
              de baja cuando quieras escribiéndonos.
            </p>
            <p>
              <strong className="v2-text">Facturación:</strong> si pedís factura, los datos fiscales (CUIT o DNI, razón social)
              se usan para emitir el comprobante ante ARCA y se conservan el plazo que exige la ley fiscal.
            </p>
          </Seccion>

          <Seccion titulo="Base legal">
            <p>
              Tratamos tus datos con tu consentimiento, que prestás al enviar cada formulario (art. 5, Ley 25.326),
              y para cumplir la relación que iniciás con nosotros (tu reserva o tu pedido). Los datos marcados con
              asterisco son necesarios: sin ellos no podemos tomar la reserva o el pedido.
            </p>
          </Seccion>

          <Seccion titulo="Con quién compartimos los datos">
            <p>
              No vendemos ni cedemos tus datos. Los guardamos en proveedores de infraestructura que actúan por
              cuenta nuestra: Supabase (base de datos y autenticación) y Vercel (alojamiento del sitio), ambos con
              servidores fuera de Argentina y certificaciones de seguridad reconocidas (SOC 2 / ISO 27001). Para
              facturar nos comunicamos con ARCA. Si nos escribís por WhatsApp, aplican además las políticas de Meta.
            </p>
            <p>
              Este sitio usa el píxel de Meta para medir el resultado de nuestros anuncios. El píxel registra la
              visita y, si confirmás una reserva, ese evento, sin tu nombre ni tus datos de contacto. Podés
              bloquearlo con la configuración de tu navegador o con un bloqueador de rastreadores.
            </p>
          </Seccion>

          <Seccion titulo="Cuánto tiempo los guardamos">
            <p>
              Lista de espera: 90 días después de la fecha pedida. Reservas: dos años; después se anonimizan
              (queda la estadística, no tu nombre ni tu contacto). Pedidos: el tiempo que exige la normativa
              fiscal y comercial. Datos de clientes frecuentes: mientras sigas visitándonos o hasta que pidas la
              baja.
            </p>
          </Seccion>

          <Seccion titulo="Tus derechos">
            <p>
              Podés pedir acceso, rectificación, actualización o supresión de tus datos, y retirar el
              consentimiento para promos, escribiendo a{" "}
              <a className="text-v2-champagne hover:underline" href={`mailto:${EMAIL}`}>{EMAIL}</a> desde el
              email o teléfono que usaste. Respondemos dentro de los 10 días hábiles.
            </p>
            <p>
              La Agencia de Acceso a la Información Pública, órgano de control de la Ley 25.326, tiene la
              atribución de atender las denuncias y reclamos que se interpongan con relación al incumplimiento
              de las normas sobre protección de datos personales.
            </p>
          </Seccion>

          <Seccion titulo="Seguridad">
            <p>
              Los datos viajan cifrados (HTTPS), se guardan con acceso restringido por rol y registramos quién
              accede al sistema interno. Si ocurriera un incidente que afecte tus datos, te avisaremos por el
              contacto que nos diste.
            </p>
          </Seccion>

          <p className="text-sm v2-text-dim">
            <Link to="/" className="text-v2-champagne hover:underline">Volver al inicio</Link>
          </p>
        </div>
      </main>
      <FooterV2 />
    </div>
  );
};

export default Privacidad;
