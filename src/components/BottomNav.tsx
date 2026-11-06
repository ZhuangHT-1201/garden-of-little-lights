import { BookHeart, Flower2, Settings2, ShoppingBasket } from "lucide-react";
import type { Lang } from "../game/types";
import { t } from "../game/i18n";

export type SheetName = "album" | "shop" | "settings" | "journey" | "story" | "howto" | null;

interface BottomNavProps {
  lang: Lang;
  active: SheetName;
  discovered: number;
  onNavigate: (sheet: Exclude<SheetName, null>) => void;
  onPlay: () => void;
}

export default function BottomNav({ lang, active, discovered, onNavigate, onPlay }: BottomNavProps) {
  const entries = [
    { id: "play" as const, icon: Flower2, label: t(lang, "nav.play") },
    { id: "album" as const, icon: BookHeart, label: t(lang, "nav.album"), badge: discovered },
    { id: "shop" as const, icon: ShoppingBasket, label: t(lang, "nav.shop") },
    { id: "settings" as const, icon: Settings2, label: t(lang, "nav.settings") }
  ];

  return (
    <nav className="bottom-nav">
      {entries.map(({ id, icon: Icon, label, badge }) => {
        const isActive = id === "play" ? active === null : active === id;
        return (
          <button
            key={id}
            className={isActive ? "active" : ""}
            onClick={() => {
              if (id === "play") onPlay();
              else onNavigate(id);
            }}
          >
            <span className="nav-icon">
              <Icon size={19}/>
              {id === "album" && badge > 0 && <i>{badge}</i>}
            </span>
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
