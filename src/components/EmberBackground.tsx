// Ambientação decorativa global. O movimento fica no CSS; apenas a visibilidade
// da aba é observada para pausar as animações sem trabalho por quadro em JavaScript.
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

type EmberStyle = CSSProperties & Record<`--ember-${string}`, string>;

// Distribuição determinística: evita reposicionar as brasas quando a tela renderiza.
const EMBERS = Array.from({ length: 64 }, (_, i) => {
  const size = 1.3 + ((i * 7) % 9) * 0.4;
  const duration = 16 + ((i * 7) % 19);
  // Fases independentes da velocidade distribuem as brasas por toda a altura já na abertura.
  const phase = (i * 0.61803398875 + 0.17) % 1;
  const tones = ["orange", "gold", "coal", "orange", "red", "gold"] as const;
  const style: EmberStyle = {
    "--ember-left": `${(i * 37 + 9) % 100}%`,
    "--ember-size": `${size.toFixed(1)}px`,
    "--ember-duration": `${duration}s`,
    "--ember-delay": `-${(duration * phase).toFixed(2)}s`,
    "--ember-drift": `${((i * 43) % 180) - 90}px`,
    "--ember-sway": `${12 + ((i * 11) % 34)}px`,
    "--ember-opacity": (0.3 + (i % 5) * 0.1).toFixed(2),
    "--ember-flicker": `${2.3 + (i % 7) * 0.47}s`,
    "--ember-flicker-delay": `-${(i % 9) * 0.6}s`,
    "--ember-blur": i % 8 === 0 ? "0.7px" : "0px",
  };
  return {
    style,
    className: `ember ember--${tones[i % tones.length]}${i % 3 === 0 ? " ember--flake" : ""}`,
  };
});

export function EmberBackground() {
  const [paused, setPaused] = useState(() => typeof document !== "undefined" && document.hidden);

  useEffect(() => {
    const updateVisibility = () => setPaused(document.hidden);
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  return (
    <div className="ember-background" aria-hidden="true" data-paused={paused}>
      {EMBERS.map(({ style, className }, i) => (
        <span key={i} className={className} style={style}>
          <span className="ember-spark" />
        </span>
      ))}
    </div>
  );
}
