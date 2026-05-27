import { useState } from "react";
import { Calendar, Clock, Users, Sparkles, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface Props {
  variant?: "hero" | "panel";
}

const ReservationForm = ({ variant = "hero" }: Props) => {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [time, setTime] = useState("20:30");
  const [people, setPeople] = useState("2");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const cleanName = name.trim();
    if (!cleanName) {
      toast.error("Falta tu nombre", {
        description: "Para que el local pueda identificarte cuando llegues.",
      });
      return;
    }

    setSubmitting(true);

    const formattedDate = new Date(date + "T00:00:00").toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    // 1) Guardar en Supabase (RPC con security definer + validación 2h–30 días).
    //    "10+" se convierte a 10 para que el integer pase, el detalle queda en notas.
    const peopleInt = parseInt(people, 10) || 2;
    let reservaId: string | null = null;
    let dbError: string | null = null;

    try {
      const { data, error } = await supabase.rpc("crear_reserva", {
        p_fecha:            date,
        p_hora:             time + ":00",
        p_personas:         peopleInt,
        p_cliente_nombre:   cleanName,
        p_cliente_telefono: null,
        p_cliente_email:    null,
        p_notas:            people === "10+" ? "Grupo de 10 o más personas" : null,
        p_origen:           "web",
        p_duracion_min:     90,
        p_auto_confirmar:   true,
      });
      if (error) dbError = error.message;
      else reservaId = data as string;
    } catch (err) {
      dbError = err instanceof Error ? err.message : "Error desconocido";
    }

    // 2) Armar mensaje de WhatsApp (incluye ID si la DB grabó OK)
    // Iconos por codepoint para evitar corrupción de encoding
    const _SUSHI  = String.fromCodePoint(0x1F363);
    const _PERSON = String.fromCodePoint(0x1F464);
    const _DATE   = String.fromCodePoint(0x1F4C5);
    const _CLOCK  = String.fromCodePoint(0x1F550);
    const _PEOPLE = String.fromCodePoint(0x1F465);
    const _TICKET = String.fromCodePoint(0x1F3AB);
    const _CHECK  = String.fromCodePoint(0x2713);

    const shortId = reservaId ? reservaId.slice(0, 8).toUpperCase() : null;
    const message = [
      `Hola Kiku Sushi ${_SUSHI}`,
      `Quiero confirmar mi reserva:`,
      ``,
      `${_DATE} Fecha · ${formattedDate}`,
      `${_CLOCK} Hora · ${time}`,
      `${_PEOPLE} Personas · ${people}`,
      ``,
      `— Datos del cliente —`,
      `${_PERSON} ${cleanName}`,
      ``,
      shortId ? `${_TICKET} Código de reserva · #${shortId}` : null,
      shortId
        ? `${_CHECK} Ya quedó registrada en el sistema. Este mensaje es solo para confirmar.`
        : `Quedo a la espera de su confirmación. ¡Gracias!`,
    ]
      .filter(Boolean)
      .join("\n");

    // 3) Abrir WhatsApp (mismo número que antes)
    const phoneNumber = "5493412764562";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");

    // 4) Feedback al usuario
    if (reservaId) {
      toast.success("¡Reserva registrada!", {
        description: "Te abrimos WhatsApp para que confirmes con el local.",
      });
    } else {
      toast.warning("Te abrimos WhatsApp para confirmar", {
        description: dbError
          ? `No pudimos pre-registrar la reserva (${dbError}), pero podés confirmarla por WhatsApp.`
          : "Por favor envía el mensaje para confirmar tu reserva con el local.",
      });
    }

    setSubmitting(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-gradient-card backdrop-blur-xl border border-primary/30 rounded-2xl p-5 md:p-6 shadow-[0_20px_60px_-20px_hsl(280_100%_50%/0.5)] ${
        variant === "hero" ? "max-w-3xl mx-auto" : "w-full"
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-accent" />
        <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Reserva en menos de 30 segundos
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <Field icon={<User className="w-4 h-4" />} label="Nombre">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            required
            className="w-full bg-transparent text-foreground outline-none text-sm font-medium placeholder:text-muted-foreground/50"
          />
        </Field>

        <Field icon={<Calendar className="w-4 h-4" />} label="Fecha">
          <input
            type="date"
            value={date}
            min={today}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-transparent text-foreground outline-none text-sm font-medium"
          />
        </Field>

        <Field icon={<Clock className="w-4 h-4" />} label="Hora">
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full bg-transparent text-foreground outline-none text-sm font-medium appearance-none cursor-pointer"
          >
            {["13:00", "13:30", "14:00", "14:30", "15:00", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30"].map((t) => (
              <option key={t} value={t} className="bg-background">
                {t}
              </option>
            ))}
          </select>
        </Field>

        <Field icon={<Users className="w-4 h-4" />} label="Personas">
          <select
            value={people}
            onChange={(e) => setPeople(e.target.value)}
            className="w-full bg-transparent text-foreground outline-none text-sm font-medium appearance-none cursor-pointer"
          >
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"].map((n) => (
              <option key={n} value={n} className="bg-background">
                {n} {n === "1" ? "persona" : "personas"}
              </option>
            ))}
          </select>
        </Field>

        <button
          type="submit"
          disabled={submitting}
          className="bg-gradient-neon text-primary-foreground font-semibold tracking-wide rounded-xl px-6 py-3.5 text-sm uppercase animate-pulse-glow hover:scale-[1.03] active:scale-[0.98] transition-transform duration-300 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Reservando…
            </>
          ) : (
            "Reservar ahora"
          )}
        </button>
      </div>

      <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-blink" />
        Confirmación inmediata
      </p>
    </form>
  );
};

const Field = ({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) => (
  <label className="group flex flex-col gap-1 bg-input/60 border border-border hover:border-primary/50 transition-colors rounded-xl px-4 py-2.5 cursor-pointer">
    <span className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
      <span className="text-accent">{icon}</span>
      {label}
    </span>
    {children}
  </label>
);

export default ReservationForm;
