import { useState, useRef } from "react";
import {
  Calendar, Clock, Users, User, Loader2, Phone, Mail,
  Salad, Accessibility, MessageSquare, ArrowLeft, ArrowRight, CheckCircle2,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

// ─── Iconos para el mensaje de WhatsApp ────────────────────────────────────
// Construidos con codepoints para evitar corrupción de encoding al bundlear
// y garantizar que lleguen correctamente al cliente de WhatsApp.
const ICON = {
  sushi:    String.fromCodePoint(0x1F363),   // 🍣
  date:     String.fromCodePoint(0x1F4C5),   // 📅
  clock:    String.fromCodePoint(0x1F550),   // 🕐
  people:   String.fromCodePoint(0x1F465),   // 👥
  sparkles: String.fromCodePoint(0x2728),    // ✨
  person:   String.fromCodePoint(0x1F464),   // 👤
  phone:    String.fromCodePoint(0x1F4DE),   // 📞
  email:    String.fromCodePoint(0x1F4E7),   // 📧
  salad:    String.fromCodePoint(0x1F957),   // 🥗
  wheel:    String.fromCodePoint(0x267F),    // ♿
  memo:     String.fromCodePoint(0x1F4DD),   // 📝
  ticket:   String.fromCodePoint(0x1F3AB),   // 🎫
  check:    String.fromCodePoint(0x2713),    // ✓
};

/**
 * Form de reserva V2.
 *
 * Modos:
 *  - Wizard (default, 3 pasos): para embedded en la home.
 *      Paso 1: tipo de experiencia
 *      Paso 2: fecha + hora + personas
 *      Paso 3: datos del cliente
 *  - Single page (singlePage=true): 3 bloques verticales en una sola vista.
 *
 * Backend: Supabase RPC `crear_reserva` con tipo_experiencia, restricciones,
 * accesibilidad y datos del cliente. Origen 'web' → dispara notificación
 * realtime en el dashboard. Post-confirmación: abre WhatsApp.
 */
interface Props {
  singlePage?: boolean;
}

// ─── Experiencias disponibles ─────────────────────────────────────────────
interface Experiencia {
  id: "carta_abierta" | "omakase" | "umami_del_sur" | "pacifico_y_patagonia" | "kiku_libre";
  label: string;
  overline: string;     // kanji o tagline en japonés
  description: string;  // micro descripción
  badge?: string;       // opcional: nota al pie tipo precio
}

const EXPERIENCIAS: Experiencia[] = [
  {
    id: "carta_abierta",
    label: "Carta abierta",
    overline: "Sin menú fijo",
    description: "Reservás la mesa y elegís de la carta al llegar al salón.",
  },
  {
    id: "omakase",
    label: "Omakase",
    overline: "おまかせ",
    description: "Diez pasos de cocina en vivo en la barra del itamae.",
  },
  {
    id: "kiku_libre",
    label: "Kiku Libre",
    overline: "食べ放題",
    description: "Sushi ilimitado. Repetí todas las rondas que quieras.",
    badge: "$53.500 p/p",
  },
  {
    id: "umami_del_sur",
    label: "Umami del Sur",
    overline: "南の旨味",
    description: "Cortes argentinos con técnica japonesa.",
  },
  {
    id: "pacifico_y_patagonia",
    label: "Pacífico y Patagonia",
    overline: "太平洋",
    description: "Sashimis y nigiris de pescado fresco.",
  },
];

const ReservationFormV2 = ({ singlePage = false }: Props) => {
  const today = new Date().toISOString().split("T")[0];

  // Experiencia
  const [tipo, setTipo] = useState<Experiencia["id"] | "">("");

  // Fecha / hora / personas
  const [date, setDate] = useState(today);
  const [time, setTime] = useState("20:30");
  const [people, setPeople] = useState("2");

  // Datos cliente
  const [name, setName] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [restricciones, setRestricciones] = useState("");
  const [accesibilidad, setAccesibilidad] = useState("");
  const [notas, setNotas] = useState("");

  // UI
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);

  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const goToStep2 = () => {
    if (!tipo) {
      toast.error("Elegí una experiencia para continuar");
      return;
    }
    setStep(2);
  };

  const goToStep3 = () => {
    if (!date || !time || !people) {
      toast.error("Completá fecha, hora y personas");
      return;
    }
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!tipo) {
      toast.error("Elegí una experiencia");
      if (!singlePage) setStep(1);
      return;
    }

    if (!date || !time || !people) {
      toast.error("Completá fecha, hora y personas");
      return;
    }

    const cleanName = name.trim();
    const cleanTel = telefono.trim();
    if (!cleanName) {
      toast.error("Falta tu nombre");
      return;
    }
    if (!cleanTel) {
      toast.error("Falta tu teléfono", {
        description: "Lo necesitamos por si hay que confirmar la reserva.",
      });
      return;
    }

    setSubmitting(true);

    const expLabel = EXPERIENCIAS.find((x) => x.id === tipo)?.label || tipo;
    const formattedDate = new Date(date + "T00:00:00").toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    const peopleInt = parseInt(people, 10) || 2;
    let reservaId: string | null = null;
    let dbError: string | null = null;

    try {
      const { data, error } = await supabase.rpc("crear_reserva", {
        p_fecha:            date,
        p_hora:             time + ":00",
        p_personas:         peopleInt,
        p_cliente_nombre:   cleanName,
        p_cliente_telefono: cleanTel,
        p_cliente_email:    email.trim() || null,
        p_notas:            (notas.trim() || (people === "10+" ? "Grupo de 10 o más personas" : null)) || null,
        p_origen:           "web",
        p_duracion_min:     90,
        p_auto_confirmar:   true,
        p_restricciones:    restricciones.trim() || null,
        p_accesibilidad:    accesibilidad.trim() || null,
        p_tipo_experiencia: tipo,
      });
      if (error) dbError = error.message;
      else reservaId = data as string;
    } catch (err) {
      dbError = err instanceof Error ? err.message : "Error desconocido";
    }

    // ─── Mensaje WhatsApp ─────────────────────────────────────────────
    // Formato ordenado en 3 secciones: Reserva / Cliente / Notas.
    // Solo incluye las líneas opcionales si tienen contenido (para que el
    // mensaje quede compacto cuando no hay extras).
    const shortId = reservaId ? reservaId.slice(0, 8).toUpperCase() : null;

    const bloqueReserva = [
      `${ICON.date} Fecha · ${formattedDate}`,
      `${ICON.clock} Hora · ${time}`,
      `${ICON.people} Personas · ${people}`,
      `${ICON.sparkles} Experiencia · ${expLabel}`,
    ].join("\n");

    const bloqueCliente = [
      `${ICON.person} ${cleanName}`,
      `${ICON.phone} ${cleanTel}`,
      email.trim() ? `${ICON.email} ${email.trim()}` : null,
    ].filter(Boolean).join("\n");

    const bloqueNotasLines = [
      restricciones.trim() ? `${ICON.salad} Restricciones · ${restricciones.trim()}` : null,
      accesibilidad.trim() ? `${ICON.wheel} Accesibilidad · ${accesibilidad.trim()}` : null,
      notas.trim()         ? `${ICON.memo} ${notas.trim()}` : null,
    ].filter(Boolean);

    const message = [
      `Hola Kiku Sushi ${ICON.sushi}`,
      `Quiero confirmar mi reserva:`,
      ``,
      bloqueReserva,
      ``,
      `— Datos del cliente —`,
      bloqueCliente,
      ...(bloqueNotasLines.length
        ? [``, `— Notas y preferencias —`, bloqueNotasLines.join("\n")]
        : []),
      ``,
      shortId
        ? `${ICON.ticket} Código de reserva · #${shortId}`
        : null,
      shortId
        ? `${ICON.check} Ya quedó registrada en el sistema. Este mensaje es solo para confirmar.`
        : `Quedo a la espera de su confirmación. ¡Gracias!`,
    ]
      .filter((line) => line !== null && line !== undefined)
      .join("\n");

    const phoneNumber = "5493412764562";
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");

    if (reservaId) {
      toast.success("¡Reserva registrada!", {
        description: "Te abrimos WhatsApp para que confirmes con el local.",
      });
      setTipo("");
      setName("");
      setTelefono("");
      setEmail("");
      setRestricciones("");
      setAccesibilidad("");
      setNotas("");
      if (!singlePage) setStep(1);
    } else {
      toast.warning("Te abrimos WhatsApp para confirmar", {
        description: dbError
          ? `No pudimos pre-registrar (${dbError}), confirmá por WhatsApp.`
          : "Por favor envía el mensaje para confirmar tu reserva.",
      });
    }

    setSubmitting(false);
  };

  // ─── Bloques reusables ────────────────────────────────────────────────
  const renderExperienciaCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {EXPERIENCIAS.map((exp) => {
        const selected = tipo === exp.id;
        return (
          <button
            key={exp.id}
            type="button"
            onClick={() => setTipo(exp.id)}
            className={`group relative text-left p-4 md:p-5 border transition-all duration-300 overflow-hidden ${
              selected
                ? "bg-v2-champagne/10 border-v2-champagne"
                : "bg-v2-bg/40 border-v2-champagne/15 hover:border-v2-champagne/50 hover:bg-v2-bg/60"
            }`}
          >
            {/* Glow al seleccionar */}
            {selected && (
              <div
                className="absolute -top-12 -right-12 w-40 h-40 blur-3xl pointer-events-none"
                style={{ background: "radial-gradient(circle, hsla(270, 50%, 50%, 0.40), transparent 70%)" }}
              />
            )}

            <div className="relative flex items-start gap-3">
              {/* Indicator (radio) */}
              <span
                className={`mt-1 w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                  selected ? "border-v2-champagne" : "border-v2-champagne/30"
                }`}
              >
                {selected && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 rounded-full bg-v2-champagne"
                  />
                )}
              </span>

              <div className="flex-1 min-w-0">
                <p className="font-jp text-[10px] tracking-[0.3em] text-v2-champagne/80 mb-1">
                  {exp.overline}
                </p>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h4 className="font-display text-lg md:text-xl text-v2-text leading-tight">
                    {exp.label}
                  </h4>
                  {exp.badge && (
                    <span className="text-[9px] tracking-[0.18em] uppercase px-1.5 py-0.5 bg-v2-champagne/15 text-v2-champagne border border-v2-champagne/30">
                      {exp.badge}
                    </span>
                  )}
                </div>
                <p className="text-[12px] v2-text-muted leading-relaxed">
                  {exp.description}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );

  const renderDateFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <Field icon={<Calendar className="w-4 h-4" />} label="Fecha">
        <input
          type="date"
          value={date}
          min={today}
          onChange={(e) => setDate(e.target.value)}
          style={{ colorScheme: "dark" }}
          className="w-full bg-transparent outline-none text-sm font-normal v2-text"
        />
      </Field>

      <Field icon={<Clock className="w-4 h-4" />} label="Hora">
        <select
          value={time}
          onChange={(e) => setTime(e.target.value)}
          style={{ colorScheme: "dark" }}
          className="w-full bg-transparent outline-none text-sm font-normal v2-text appearance-none cursor-pointer"
        >
          {["13:00","13:30","14:00","14:30","15:00","20:00","20:30","21:00","21:30","22:00","22:30"].map((t) => (
            <option key={t} value={t} className="bg-v2-card">{t}</option>
          ))}
        </select>
      </Field>

      <Field icon={<Users className="w-4 h-4" />} label="Personas">
        <select
          value={people}
          onChange={(e) => setPeople(e.target.value)}
          style={{ colorScheme: "dark" }}
          className="w-full bg-transparent outline-none text-sm font-normal v2-text appearance-none cursor-pointer"
        >
          {["1","2","3","4","5","6","7","8","9","10+"].map((n) => (
            <option key={n} value={n} className="bg-v2-card">
              {n} {n === "1" ? "persona" : "personas"}
            </option>
          ))}
        </select>
      </Field>
    </div>
  );

  const renderClientFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Field icon={<User className="w-4 h-4" />} label="Nombre completo *">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
          required
          className="w-full bg-transparent outline-none text-sm font-normal v2-text placeholder:text-v2-text-dim"
        />
      </Field>

      <Field icon={<Phone className="w-4 h-4" />} label="Teléfono *">
        <input
          type="tel"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="(+54) 341 1234567"
          required
          className="w-full bg-transparent outline-none text-sm font-normal v2-text placeholder:text-v2-text-dim"
        />
      </Field>

      <Field icon={<Mail className="w-4 h-4" />} label="Email (opcional)" full>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@ejemplo.com"
          className="w-full bg-transparent outline-none text-sm font-normal v2-text placeholder:text-v2-text-dim"
        />
      </Field>

      <Field icon={<Salad className="w-4 h-4" />} label="Restricciones alimentarias (opcional)" full hint="Ayudanos a preparar una mejor experiencia">
        <input
          type="text"
          value={restricciones}
          onChange={(e) => setRestricciones(e.target.value)}
          placeholder="ej. vegetariano, celíaco, alergia al maní"
          className="w-full bg-transparent outline-none text-sm font-normal v2-text placeholder:text-v2-text-dim"
        />
      </Field>

      <Field icon={<Accessibility className="w-4 h-4" />} label="Accesibilidad (opcional)" full hint="Ayudanos a prepararnos para tu visita">
        <input
          type="text"
          value={accesibilidad}
          onChange={(e) => setAccesibilidad(e.target.value)}
          placeholder="ej. silla de ruedas, planta baja"
          className="w-full bg-transparent outline-none text-sm font-normal v2-text placeholder:text-v2-text-dim"
        />
      </Field>

      <Field icon={<MessageSquare className="w-4 h-4" />} label="Pedidos especiales / Notas (opcional)" full>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Ocasión especial, cumpleaños, etc."
          rows={3}
          className="w-full bg-transparent outline-none text-sm font-normal v2-text placeholder:text-v2-text-dim resize-none"
        />
      </Field>
    </div>
  );

  const submitButton = (
    <button
      type="submit"
      disabled={submitting}
      className="bg-v2-champagne text-v2-bg font-semibold tracking-[0.28em] uppercase text-[11px] px-7 py-3.5 hover:bg-v2-text hover:-translate-y-px transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {submitting ? (
        <><Loader2 className="w-4 h-4 animate-spin" /> Registrando</>
      ) : (
        <>Confirmar Reserva <CheckCircle2 className="w-4 h-4" /></>
      )}
    </button>
  );

  const tipoLabel = EXPERIENCIAS.find((x) => x.id === tipo)?.label || "";

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <section
      ref={ref}
      id="reservar"
      className={`${singlePage ? "py-12 md:py-16" : "py-32 md:py-44"} px-6 md:px-14 ${singlePage ? "" : "border-t border-v2-champagne/10"} relative overflow-hidden ${singlePage ? "text-left" : "text-center"}`}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, hsla(270, 50%, 50%, 0.10), transparent 65%)" }}
      />

      <div className="max-w-3xl mx-auto relative">
        {/* Header solo en modo wizard (la página /reservar provee el suyo) */}
        {!singlePage && (
          <>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="font-jp text-5xl text-v2-champagne block mb-6 opacity-90 text-center"
            >
              菊
            </motion.span>

            <motion.span
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-jp text-xs tracking-[0.4em] text-v2-champagne mb-6 block text-center"
            >
              — ご予約 —
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="font-display font-light tracking-[-0.02em] mb-10 leading-none text-center"
              style={{ fontSize: "clamp(48px, 6vw, 80px)" }}
            >
              Reservá tu <em className="italic font-normal text-v2-champagne">mesa</em>
            </motion.h2>

            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="flex items-center justify-center gap-3 mb-8 text-[10px] tracking-[0.3em] uppercase"
            >
              <StepDot active={step >= 1} done={step > 1} label="Experiencia" />
              <span className="w-6 h-px bg-v2-champagne/20" />
              <StepDot active={step >= 2} done={step > 2} label="Fecha" />
              <span className="w-6 h-px bg-v2-champagne/20" />
              <StepDot active={step >= 3} done={false} label="Datos" />
            </motion.div>
          </>
        )}

        <motion.div
          initial={singlePage ? false : { opacity: 0, y: 30 }}
          animate={singlePage ? false : (inView ? { opacity: 1, y: 0 } : {})}
          transition={{ duration: 1, delay: 0.55 }}
          className="bg-v2-card/60 border border-v2-champagne/24 p-7 md:p-9 backdrop-blur-xl text-left"
        >
          {/* ─── MODO SINGLE PAGE: todo junto ───────────────────────── */}
          {singlePage ? (
            <form onSubmit={handleSubmit}>
              {/* Bloque experiencia */}
              <div className="flex items-center gap-2.5 mb-4 text-[10px] tracking-[0.3em] uppercase v2-text-muted">
                <Sparkles className="w-3 h-3 text-v2-champagne" />
                ¿Qué experiencia querés?
              </div>
              {renderExperienciaCards()}

              {/* Separador */}
              <div className="my-8 border-t border-v2-champagne/10" />

              {/* Bloque fecha */}
              <div className="flex items-center gap-2.5 mb-4 text-[10px] tracking-[0.3em] uppercase v2-text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-v2-accent animate-pulse-glow" />
                ¿Cuándo querés venir?
              </div>
              {renderDateFields()}

              {/* Separador */}
              <div className="my-8 border-t border-v2-champagne/10" />

              {/* Bloque datos */}
              <div className="flex items-center gap-2.5 mb-4 text-[10px] tracking-[0.3em] uppercase v2-text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-v2-accent animate-pulse-glow" />
                Completá tus datos
              </div>
              {renderClientFields()}

              {/* Submit */}
              <div className="flex items-center justify-end mt-7">
                {submitButton}
              </div>

              <p className="text-[11px] v2-text-muted mt-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-v2-accent animate-pulse-glow" />
                Confirmación inmediata por WhatsApp · La reserva queda registrada automáticamente en el sistema
              </p>
            </form>
          ) : (
            /* ─── MODO WIZARD: 3 pasos animados ──────────────────── */
            <AnimatePresence mode="wait" initial={false}>
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="flex items-center gap-2.5 mb-6 text-[10px] tracking-[0.3em] uppercase v2-text-muted">
                    <Sparkles className="w-3 h-3 text-v2-champagne" />
                    ¿Qué experiencia querés vivir?
                  </div>

                  {renderExperienciaCards()}

                  <button
                    type="button"
                    onClick={goToStep2}
                    className="mt-6 w-full bg-v2-champagne text-v2-bg font-semibold tracking-[0.28em] uppercase text-[11px] px-6 py-3.5 hover:bg-v2-text hover:-translate-y-px transition-all flex items-center justify-center gap-2"
                  >
                    Continuar <ArrowRight className="w-4 h-4" />
                  </button>

                  <p className="text-[11px] v2-text-muted mt-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-v2-accent animate-pulse-glow" />
                    Confirmación inmediata por WhatsApp
                  </p>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-[10px] tracking-[0.3em] uppercase v2-text-muted flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-v2-accent animate-pulse-glow" />
                      Elegí cuándo querés venir
                    </div>
                    <div className="text-[10px] tracking-[0.2em] uppercase v2-text-dim">
                      {tipoLabel}
                    </div>
                  </div>

                  {renderDateFields()}

                  <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-3 mt-7">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-[11px] tracking-[0.28em] uppercase v2-text-muted hover:text-v2-champagne transition-colors flex items-center gap-2 self-start"
                    >
                      <ArrowLeft className="w-4 h-4" /> Atrás
                    </button>

                    <button
                      type="button"
                      onClick={goToStep3}
                      className="bg-v2-champagne text-v2-bg font-semibold tracking-[0.28em] uppercase text-[11px] px-7 py-3.5 hover:bg-v2-text hover:-translate-y-px transition-all flex items-center justify-center gap-2"
                    >
                      Continuar <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.form
                  key="step3"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                    <div className="text-[10px] tracking-[0.3em] uppercase v2-text-muted flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-v2-accent animate-pulse-glow" />
                      Completá tus datos
                    </div>
                    <div className="text-[10px] tracking-[0.2em] uppercase v2-text-dim">
                      {tipoLabel} · {new Date(date + "T00:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" })} · {time} · {people}p
                    </div>
                  </div>

                  {renderClientFields()}

                  <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-3 mt-7">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={submitting}
                      className="text-[11px] tracking-[0.28em] uppercase v2-text-muted hover:text-v2-champagne transition-colors flex items-center gap-2 self-start disabled:opacity-50"
                    >
                      <ArrowLeft className="w-4 h-4" /> Atrás
                    </button>

                    {submitButton}
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          )}
        </motion.div>
      </div>
    </section>
  );
};

// ─── Helpers ────────────────────────────────────────────────────────────────
const StepDot = ({
  active, done, label,
}: { active: boolean; done: boolean; label: string }) => (
  <span className={`flex items-center gap-2 ${active ? "text-v2-champagne" : "v2-text-dim"}`}>
    <span
      className={`w-2 h-2 rounded-full transition-colors ${
        done ? "bg-v2-accent" : active ? "bg-v2-champagne" : "bg-v2-text-dim/40"
      }`}
    />
    {label}
  </span>
);

const Field = ({
  icon, label, children, full, hint,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  full?: boolean;
  hint?: string;
}) => (
  <label
    className={`group flex flex-col gap-1 bg-v2-bg/60 border border-v2-champagne/10 hover:border-v2-accent transition-colors px-4 py-2.5 cursor-pointer ${
      full ? "md:col-span-2" : ""
    }`}
  >
    <span className="text-[9px] uppercase tracking-[0.3em] v2-text-dim flex items-center gap-1.5">
      <span className="text-v2-accent">{icon}</span>
      {label}
    </span>
    {children}
    {hint && (
      <span className="text-[10px] v2-text-dim/80 mt-1 italic">{hint}</span>
    )}
  </label>
);

export default ReservationFormV2;
