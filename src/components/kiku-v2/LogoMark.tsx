import { CSSProperties } from "react";

/**
 * Logo Kiku — versión original conservada.
 * Kanji 菊 + wordmark (imagen /public/logo.png).
 *
 * Decisión del cliente: el logo NO se cambia.
 * Las exploraciones del mark están en
 * mockups/v3-logo-explorations/index.html (archivadas).
 */
interface LogoMarkProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
}

/** Solo el kanji 菊 — para favicons, iconos pequeños, watermarks */
export const LogoMark = ({ size = 32, className = "", style }: LogoMarkProps) => {
  return (
    <span
      className={`font-jp inline-block leading-none v2-text-accent ${className}`}
      style={{
        fontSize: size,
        textShadow: "0 0 24px hsla(270, 50%, 50%, 0.4)",
        ...style,
      }}
      aria-label="Kiku"
    >
      菊
    </span>
  );
};

/** Lockup: kanji 菊 + imagen del wordmark KIKU */
export const LogoLockup = ({ kanjiSize = 36 }: { kanjiSize?: number }) => (
  <div className="flex items-center gap-3 md:gap-4">
    <span
      className="font-jp leading-none v2-text-accent"
      style={{
        fontSize: kanjiSize,
        textShadow: "0 0 28px hsla(270, 50%, 50%, 0.45)",
      }}
    >
      菊
    </span>
    <img
      src="/logo.png"
      alt="KIKU"
      className="h-9 md:h-10 object-contain"
    />
  </div>
);
