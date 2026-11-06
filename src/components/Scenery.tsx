import { useEffect, useState } from "react";
import type { Lang } from "../game/types";

interface SceneryProps {
  motion: boolean;
  lang: Lang;
}

function mulberry(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

const random = mulberry(91);
const leaves = Array.from({ length: 12 }, (_, index) => ({
  id: index,
  left: random() * 100,
  delay: random() * -22,
  duration: 18 + random() * 18,
  size: 5 + random() * 8,
  drift: -20 + random() * 40
}));

export default function Scenery({ motion, lang }: SceneryProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 60);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className={`scenery ${ready ? "is-ready" : ""} ${motion ? "" : "still"}`} aria-hidden="true">
      <img className="scenery-image" src="./assets/osmanthus-garden.svg" alt="" />
      <div className="scenery-wash" />
      <div className="moon-glow" />
      <div className="mist-band mist-one" />
      <div className="mist-band mist-two" />
      {motion && (
        <div className="leaf-fall">
          {leaves.map((leaf) => (
            <span
              key={leaf.id}
              style={{
                left: `${leaf.left}%`,
                animationDelay: `${leaf.delay}s`,
                animationDuration: `${leaf.duration}s`,
                width: `${leaf.size}px`,
                height: `${leaf.size * 0.55}px`,
                "--leaf-drift": `${leaf.drift}px`
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}
      <div className="fireflies">
        <i/><i/><i/><i/><i/><i/><i/><i/>
      </div>
      <div className="scenery-signature">
        <span>{lang === "zh" ? "桂影入庭" : "LIGHT IN THE GARDEN"}</span>
        <b>栀</b>
      </div>
    </div>
  );
}
