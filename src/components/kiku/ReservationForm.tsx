import { useState } from "react";
import { Calendar, Clock, Users, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Props {
  variant?: "hero" | "panel";
}

const ReservationForm = ({ variant = "hero" }: Props) => {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [time, setTime] = useState("20:30");
  const [people, setPeople] = useState("2");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Format the date to be more readable
    const formattedDate = new Date(date).toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long"
    });

    // Create the pre-filled message
    const message = `Hola Kiku Sushi 🍣, me gustaría solicitar una reserva:\n\n📅 Fecha: ${formattedDate}\n⏰ Hora: ${time}\n👥 Personas: ${people}\n\nQuedo a la espera de su confirmación. ¡Gracias!`;

    // WhatsApp API URL (Phone number from footer: +341 15-276-4562)
    // Note for Argentina numbers, the standard WhatsApp format is 549 + area code + number (without 15)
    const phoneNumber = "5493412764562";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    // Open WhatsApp in a new tab
    window.open(whatsappUrl, "_blank");

    toast.success("Redirigiendo a WhatsApp...", {
      description: "Por favor envía el mensaje para confirmar tu reserva con el local.",
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-gradient-card backdrop-blur-xl border border-primary/30 rounded-2xl p-5 md:p-6 shadow-[0_20px_60px_-20px_hsl(280_100%_50%/0.5)] ${variant === "hero" ? "max-w-3xl mx-auto" : "w-full"
        }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-accent" />
        <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Reserva en menos de 30 segundos
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
            {["13:00", "13:30", "14:00", "14:30", "15:00", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30"].map(t => (
              <option key={t} value={t} className="bg-background">{t}</option>
            ))}
          </select>
        </Field>

        <Field icon={<Users className="w-4 h-4" />} label="Personas">
          <select
            value={people}
            onChange={(e) => setPeople(e.target.value)}
            className="w-full bg-transparent text-foreground outline-none text-sm font-medium appearance-none cursor-pointer"
          >
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"].map(n => (
              <option key={n} value={n} className="bg-background">{n} {n === "1" ? "persona" : "personas"}</option>
            ))}
          </select>
        </Field>

        <button
          type="submit"
          className="bg-gradient-neon text-primary-foreground font-semibold tracking-wide rounded-xl px-6 py-3.5 text-sm uppercase animate-pulse-glow hover:scale-[1.03] active:scale-[0.98] transition-transform duration-300"
        >
          Reservar ahora
        </button>
      </div>

      <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-blink" />
        Confirmación inmediata
      </p>
    </form>
  );
};

const Field = ({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) => (
  <label className="group flex flex-col gap-1 bg-input/60 border border-border hover:border-primary/50 transition-colors rounded-xl px-4 py-2.5 cursor-pointer">
    <span className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
      <span className="text-accent">{icon}</span>
      {label}
    </span>
    {children}
  </label>
);

export default ReservationForm;
