import { useId } from "react";
import type { Kind } from "../game/types";

interface ItemArtProps {
  kind: Kind;
  level: number;
  className?: string;
  decorative?: boolean;
}

const sparkle = (
  <g fill="#fff3c5" opacity=".9">
    <path d="M18 23l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z"/>
    <circle cx="80" cy="29" r="1.6"/>
    <circle cx="74" cy="17" r="1"/>
  </g>
);

export default function ItemArt({ kind, level, className, decorative = true }: ItemArtProps) {
  const rawId = useId().replaceAll(":", "");
  const gold = `gold-${rawId}`;
  const wood = `wood-${rawId}`;
  const green = `green-${rawId}`;
  const glass = `glass-${rawId}`;
  const red = `red-${rawId}`;
  const blue = `blue-${rawId}`;
  const shadow = `shadow-${rawId}`;
  const glow = `glow-${rawId}`;

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      focusable="false"
    >
      <defs>
        <linearGradient id={gold} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe9a8"/>
          <stop offset=".45" stopColor="#e8be67"/>
          <stop offset="1" stopColor="#b77c35"/>
        </linearGradient>
        <linearGradient id={wood} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c98d5b"/>
          <stop offset=".46" stopColor="#95603c"/>
          <stop offset="1" stopColor="#583727"/>
        </linearGradient>
        <linearGradient id={green} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#b8ca78"/>
          <stop offset=".5" stopColor="#6d965f"/>
          <stop offset="1" stopColor="#365b46"/>
        </linearGradient>
        <linearGradient id={glass} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff6d7"/>
          <stop offset=".35" stopColor="#d9e7cb"/>
          <stop offset=".7" stopColor="#9dbaa6"/>
          <stop offset="1" stopColor="#5a8374"/>
        </linearGradient>
        <linearGradient id={red} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffd58f"/>
          <stop offset=".4" stopColor="#e99362"/>
          <stop offset="1" stopColor="#b64f42"/>
        </linearGradient>
        <linearGradient id={blue} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d7eee7"/>
          <stop offset=".55" stopColor="#7bb2aa"/>
          <stop offset="1" stopColor="#376b6a"/>
        </linearGradient>
        <radialGradient id={glow} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#fff2b4" stopOpacity=".9"/>
          <stop offset=".5" stopColor="#f2d886" stopOpacity=".3"/>
          <stop offset="1" stopColor="#f2d886" stopOpacity="0"/>
        </radialGradient>
        <filter id={shadow} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.2" floodColor="#172b25" floodOpacity=".28"/>
        </filter>
      </defs>

      <ellipse cx="50" cy="83" rx={level > 3 ? 30 : 23} ry="5" fill="#17352e" opacity=".16"/>
      {level >= 5 && <circle cx="50" cy="48" r="42" fill={`url(#${glow})`}/>}

      {kind === "wood" && level === 1 && (
        <g filter={`url(#${shadow})`}>
          <path d="M29 75C40 64 47 55 60 42C65 37 70 32 74 25" fill="none" stroke={`url(#${wood})`} strokeWidth="6" strokeLinecap="round"/>
          <path d="M54 51C45 44 38 45 31 49" fill="none" stroke="#76513a" strokeWidth="4" strokeLinecap="round"/>
          <path d="M61 39C66 34 73 34 79 37" fill="none" stroke="#76513a" strokeWidth="3.5" strokeLinecap="round"/>
          <path d="M66 36C69 24 76 20 85 21C83 32 77 38 66 36Z" fill={`url(#${green})`}/>
          <path d="M46 47C45 34 39 29 30 29C31 40 37 46 46 47Z" fill="#a77b45"/>
          <path d="M32 60C32 50 37 45 45 43C45 52 41 57 32 60Z" fill="#d49c59"/>
          <path d="M30 75C36 70 44 70 49 74" fill="none" stroke="#5e4232" strokeWidth="2" strokeLinecap="round" opacity=".55"/>
        </g>
      )}

      {kind === "wood" && level === 2 && (
        <g filter={`url(#${shadow})`}>
          <rect x="20" y="54" width="58" height="18" rx="9" fill={`url(#${wood})`} transform="rotate(-5 20 54)"/>
          <rect x="27" y="67" width="54" height="16" rx="8" fill="#70472f"/>
          <ellipse cx="77" cy="72" rx="10" ry="8" fill="#d2a16c"/>
          <ellipse cx="77" cy="72" rx="6.5" ry="5" fill="none" stroke="#a77346" strokeWidth="1.5"/>
          <ellipse cx="77" cy="72" rx="2.8" ry="2" fill="none" stroke="#a77346" strokeWidth="1.2"/>
          <path d="M32 67C24 60 21 52 22 44C34 47 39 55 38 67Z" fill="#6d8e55"/>
          <path d="M43 66C44 54 50 47 58 44C58 55 53 63 43 66Z" fill={`url(#${green})`}/>
          <path d="M25 62C42 60 58 60 72 63" fill="none" stroke="#e2b27d" strokeWidth="1.5" opacity=".45"/>
        </g>
      )}

      {kind === "wood" && level === 3 && (
        <g filter={`url(#${shadow})`}>
          <path d="M18 78C25 62 33 47 43 29C48 20 53 20 58 29C68 47 76 62 83 78" fill="none" stroke={`url(#${wood})`} strokeWidth="7" strokeLinecap="round"/>
          <path d="M28 72V87M72 72V87M20 83H81" fill="none" stroke="#70452e" strokeWidth="6" strokeLinecap="round"/>
          <path d="M34 55H68M39 42H62" fill="none" stroke="#c28a58" strokeWidth="4" strokeLinecap="round"/>
          <path d="M37 55C32 46 28 41 22 38C24 49 28 55 37 58Z" fill={`url(#${green})`}/>
          <path d="M64 55C70 46 75 42 82 40C80 51 74 56 65 59Z" fill="#739a5b"/>
          <circle cx="30" cy="39" r="4.5" fill={`url(#${gold})`}/>
          <circle cx="77" cy="52" r="4" fill="#d9aa56"/>
          <path d="M24 78H78" stroke="#e0b477" strokeWidth="1.5" opacity=".45"/>
        </g>
      )}

      {kind === "wood" && level === 4 && (
        <g filter={`url(#${shadow})`}>
          <path d="M15 47C33 38 66 38 87 47C79 39 68 34 51 34C34 34 23 39 15 47Z" fill="#264b43"/>
          <path d="M11 48C29 44 47 41 51 39C56 41 73 44 90 48C84 55 79 58 72 58H30C23 58 18 55 11 48Z" fill={`url(#${wood})`}/>
          <path d="M25 59H77L72 86H30Z" fill="#e4d3a9"/>
          <rect x="29" y="55" width="7" height="34" rx="2" fill="#67422f"/>
          <rect x="66" y="55" width="7" height="34" rx="2" fill="#67422f"/>
          <rect x="43" y="64" width="16" height="20" rx="2" fill="#35574d"/>
          <path d="M30 83H74" stroke="#9b704d" strokeWidth="3"/>
          <path d="M43 68H59M43 74H59" stroke="#c7ae75" strokeWidth="1.2" opacity=".7"/>
          <circle cx="16" cy="51" r="3.5" fill="#e7c878"/>
          <circle cx="86" cy="50" r="3" fill="#e7c878"/>
        </g>
      )}

      {kind === "wood" && level === 5 && (
        <g filter={`url(#${shadow})`}>
          <circle cx="51" cy="24" r="13" fill="#f9e6ae" opacity=".92"/>
          <path d="M14 43C34 37 68 37 88 43C78 34 66 29 51 29C35 29 24 34 14 43Z" fill="#1d443c"/>
          <path d="M9 44C28 41 45 37 51 33C58 37 74 41 94 44C88 50 82 53 73 53H30C22 53 15 50 9 44Z" fill={`url(#${wood})`}/>
          <path d="M24 54H79L73 73H29Z" fill="#eadcba"/>
          <path d="M18 75C34 69 68 69 85 75L78 82H25Z" fill="#254b42"/>
          <path d="M24 82C31 80 39 81 45 84H20Z" fill={`url(#${wood})`}/>
          <path d="M55 82C64 79 73 80 82 84H58Z" fill={`url(#${wood})`}/>
          <rect x="31" y="56" width="5" height="28" fill="#69452f"/>
          <rect x="66" y="56" width="5" height="28" fill="#69452f"/>
          <rect x="43" y="58" width="16" height="17" rx="2" fill="#34584b"/>
          <path d="M51 58V89" stroke="#704a31" strokeWidth="4"/>
          <g fill="#f4d48c">
            <circle cx="40" cy="68" r="2.2"/>
            <circle cx="63" cy="68" r="2.2"/>
          </g>
          {sparkle}
        </g>
      )}

      {kind === "wood" && level === 6 && (
        <g filter={`url(#${shadow})`}>
          <circle cx="57" cy="28" r="19" fill="#fbe8b2" stroke="#fef5d9" strokeWidth="2"/>
          <path d="M4 51C24 42 40 41 50 35C60 41 76 42 98 51C86 38 70 30 50 30C31 30 16 38 4 51Z" fill="#153d36"/>
          <path d="M5 52C26 49 42 44 50 38C60 44 75 49 97 52C91 59 81 63 69 63H33C21 63 12 59 5 52Z" fill={`url(#${gold})`}/>
          <path d="M21 64H81L73 86H29Z" fill="#f0e1bd"/>
          <path d="M13 87C31 78 70 78 89 87L82 94H20Z" fill="#1b443b"/>
          <rect x="27" y="62" width="6" height="32" fill="#69452f"/>
          <rect x="69" y="62" width="6" height="32" fill="#69452f"/>
          <rect x="42" y="66" width="18" height="24" rx="3" fill="#33594c"/>
          <path d="M51 66V94M36 67H67" stroke="#e8c47b" strokeWidth="2"/>
          <path d="M7 81C1 78 -2 71 0 64C11 66 17 72 18 83Z" fill={`url(#${green})`}/>
          <path d="M92 78C100 76 105 70 105 61C95 64 89 70 87 80Z" fill="#87a663"/>
          {sparkle}
        </g>
      )}

      {kind === "flower" && level === 1 && (
        <g filter={`url(#${shadow})`}>
          <path d="M35 80C50 73 63 60 70 43C72 37 76 32 80 28" fill="none" stroke="#68814c" strokeWidth="3" strokeLinecap="round"/>
          <path d="M52 61C43 56 35 58 29 65C38 70 46 69 52 61Z" fill={`url(#${green})`}/>
          <path d="M61 47C68 41 76 42 82 48C75 54 68 54 61 47Z" fill="#9fb267"/>
          <ellipse cx="69" cy="38" rx="9" ry="6" fill="#9a7241" transform="rotate(-35 69 38)"/>
          <ellipse cx="74" cy="33" rx="8" ry="5" fill="#c99651" transform="rotate(-35 74 33)"/>
          <path d="M63 42C67 38 72 34 77 31" fill="none" stroke="#ecd08a" strokeWidth="1.4" strokeLinecap="round" opacity=".8"/>
        </g>
      )}

      {kind === "flower" && level === 2 && (
        <g filter={`url(#${shadow})`}>
          <path d="M22 78C43 77 62 76 77 74C74 84 58 89 40 86C31 84 25 82 22 78Z" fill="#7d5c3d"/>
          <path d="M50 78C49 62 51 47 54 30" fill="none" stroke="#5c8253" strokeWidth="4" strokeLinecap="round"/>
          <path d="M50 62C41 53 33 54 26 61C35 68 42 68 50 62Z" fill={`url(#${green})`}/>
          <path d="M52 54C59 43 68 41 78 46C72 56 64 59 52 54Z" fill="#82a565"/>
          <path d="M54 31C44 23 44 15 51 8C60 15 61 24 54 31Z" fill="#b0bf71"/>
          <path d="M54 30C61 17 68 14 77 15C75 25 68 31 54 30Z" fill="#8ba45e"/>
          <circle cx="54" cy="30" r="3" fill="#f4dfa0"/>
          <path d="M30 78C38 74 46 72 55 72M61 75C68 73 73 72 78 72" stroke="#b18b61" strokeWidth="1" opacity=".6"/>
        </g>
      )}

      {kind === "flower" && level === 3 && (
        <g filter={`url(#${shadow})`}>
          <path d="M50 82C49 68 50 51 53 33" fill="none" stroke="#587b4c" strokeWidth="4" strokeLinecap="round"/>
          <path d="M51 66C40 56 31 58 23 68C35 75 43 74 51 66Z" fill={`url(#${green})`}/>
          <path d="M52 58C63 47 72 48 82 57C72 66 62 66 52 58Z" fill="#799a5b"/>
          <g transform="translate(52 32)">
            <g fill={`url(#${gold})`}>
              <ellipse cx="0" cy="-16" rx="6" ry="14"/>
              <ellipse cx="15" cy="-8" rx="6" ry="14" transform="rotate(70 15 -8)"/>
              <ellipse cx="15" cy="8" rx="6" ry="14" transform="rotate(135 15 8)"/>
              <ellipse cx="0" cy="16" rx="6" ry="14"/>
              <ellipse cx="-15" cy="8" rx="6" ry="14" transform="rotate(225 -15 8)"/>
              <ellipse cx="-15" cy="-8" rx="6" ry="14" transform="rotate(290 -15 -8)"/>
            </g>
            <circle cx="0" cy="0" r="7" fill="#8d6430"/>
            <circle cx="0" cy="0" r="3" fill="#f7e0a0"/>
          </g>
          <circle cx="31" cy="78" r="4" fill="#d7a64a"/>
          <circle cx="71" cy="82" r="3" fill="#e0b958"/>
          {sparkle}
        </g>
      )}

      {kind === "flower" && level === 4 && (
        <g filter={`url(#${shadow})`}>
          <path d="M33 82C49 72 58 56 67 32" fill="none" stroke="#5c7d4e" strokeWidth="4" strokeLinecap="round"/>
          <path d="M51 56C39 49 32 53 27 63C37 67 45 65 51 56Z" fill={`url(#${green})`}/>
          <path d="M57 47C66 39 75 41 81 49C73 57 65 56 57 47Z" fill="#72985c"/>
          <path d="M56 44C55 36 57 29 62 23" fill="none" stroke="#7d673e" strokeWidth="2"/>
          <path d="M49 43H75L70 62H54Z" fill={`url(#${gold})`} opacity=".92"/>
          <rect x="50" y="39" width="24" height="6" rx="3" fill="#74512e"/>
          <rect x="56" y="62" width="12" height="4" rx="2" fill="#74512e"/>
          <circle cx="62" cy="51" r="6" fill="#fff0b5"/>
          <g fill="#d48e3d">
            <circle cx="40" cy="39" r="4.5"/>
            <circle cx="49" cy="34" r="3.8"/>
            <circle cx="58" cy="31" r="4.2"/>
            <circle cx="68" cy="34" r="4"/>
            <circle cx="77" cy="40" r="4.6"/>
          </g>
          <path d="M35 48C42 43 51 38 60 35" fill="none" stroke="#6f8249" strokeWidth="2" strokeLinecap="round"/>
          {sparkle}
        </g>
      )}

      {kind === "flower" && level === 5 && (
        <g filter={`url(#${shadow})`}>
          <path d="M34 82C38 67 42 50 50 32C59 50 63 67 66 82Z" fill={`url(#${glass})`} stroke="#e8f0d6" strokeWidth="1.5"/>
          <ellipse cx="50" cy="81" rx="25" ry="6" fill={`url(#${gold})`}/>
          <path d="M43 77H58L55 84H46Z" fill="#b88743"/>
          <path d="M50 35C44 22 35 21 30 27C33 35 39 40 50 39C48 48 40 52 32 51C35 61 42 64 50 57C58 64 66 61 68 51C60 52 53 47 50 39C61 40 68 35 70 27C64 21 55 22 50 35Z" fill="#f7dc8c" opacity=".93"/>
          <path d="M50 39C46 48 46 58 50 68C54 58 54 48 50 39Z" fill="#d39d4d" opacity=".7"/>
          <circle cx="50" cy="39" r="5" fill="#f9edbf"/>
          <path d="M40 73C45 69 55 69 61 73" stroke="#f6e6b5" strokeWidth="1.5" opacity=".7"/>
          {sparkle}
        </g>
      )}

      {kind === "flower" && level === 6 && (
        <g filter={`url(#${shadow})`}>
          <circle cx="50" cy="45" r="35" fill="#f4d67e" opacity=".13"/>
          <circle cx="50" cy="45" r="26" fill="none" stroke="#f3d580" strokeWidth="1.3" strokeDasharray="2 4"/>
          <path d="M35 88C40 73 43 61 50 45C57 61 60 73 65 88Z" fill={`url(#${glass})`} opacity=".8"/>
          <path d="M50 19C44 10 33 10 29 17C34 25 42 26 50 20C45 31 36 36 25 35C27 47 38 52 49 44C48 57 42 67 33 75C45 79 52 69 51 56C57 69 69 75 78 68C70 60 62 51 58 44C71 51 81 47 82 36C71 35 60 30 55 20C63 25 72 23 75 16C68 10 58 11 50 19Z" fill={`url(#${gold})`} stroke="#f8e9b6" strokeWidth="1"/>
          <circle cx="50" cy="45" r="9" fill="#fff1b4"/>
          <circle cx="50" cy="45" r="4" fill="#d49a45"/>
          <g fill="#f2c86d">
            <circle cx="20" cy="47" r="3"/>
            <circle cx="78" cy="57" r="3.5"/>
            <circle cx="32" cy="80" r="2.5"/>
          </g>
          {sparkle}
        </g>
      )}

      {kind === "tea" && level === 1 && (
        <g filter={`url(#${shadow})`}>
          <path d="M42 83C45 67 49 49 56 32" fill="none" stroke="#577b4d" strokeWidth="3.5" strokeLinecap="round"/>
          <path d="M56 33C47 28 42 19 44 10C54 13 59 23 56 33Z" fill={`url(#${green})`}/>
          <path d="M51 49C43 41 34 42 28 49C36 57 44 56 51 49Z" fill="#8da866"/>
          <path d="M55 45C62 34 70 32 79 37C75 47 67 50 55 45Z" fill="#719258"/>
          <path d="M47 68C39 62 31 64 26 71C34 78 41 76 47 68Z" fill="#9aae69"/>
          <path d="M45 82C51 78 58 78 63 82" stroke="#94714e" strokeWidth="2" strokeLinecap="round"/>
          <path d="M47 15C50 20 52 25 53 29" fill="#d8df9c" opacity=".55"/>
        </g>
      )}

      {kind === "tea" && level === 2 && (
        <g filter={`url(#${shadow})`}>
          <path d="M47 84C48 66 51 45 55 24" fill="none" stroke="#55764b" strokeWidth="4" strokeLinecap="round"/>
          <path d="M53 48C44 35 35 33 26 39C32 51 42 55 53 48Z" fill={`url(#${green})`}/>
          <path d="M54 42C60 27 69 22 80 25C77 39 68 45 54 42Z" fill="#73975d"/>
          <path d="M50 67C40 55 31 55 22 63C31 74 41 75 50 67Z" fill="#90a968"/>
          <path d="M53 25C45 15 46 8 53 2C61 9 61 17 53 25Z" fill="#b0c17b"/>
          <path d="M44 43C50 43 57 44 63 46M36 61C42 60 48 60 54 58" stroke="#c7d393" strokeWidth="1.2" opacity=".65"/>
          <circle cx="75" cy="70" r="4" fill="#d6b46a" opacity=".75"/>
          <circle cx="28" cy="77" r="2.5" fill="#d6b46a" opacity=".7"/>
        </g>
      )}

      {kind === "tea" && level === 3 && (
        <g filter={`url(#${shadow})`}>
          <path d="M20 75C30 66 70 66 81 75C75 87 30 88 20 75Z" fill="#8b6d48"/>
          <path d="M20 75C37 79 65 80 81 75" fill="none" stroke="#c9a171" strokeWidth="2"/>
          <circle cx="50" cy="52" r="24" fill={`url(#${green})`}/>
          <circle cx="50" cy="52" r="17" fill="none" stroke="#b8ca83" strokeWidth="2" opacity=".75"/>
          <path d="M35 48C42 38 53 33 64 36C66 45 60 58 49 64C41 61 36 55 35 48Z" fill="#668d58" opacity=".5"/>
          <path d="M56 38C61 43 64 50 63 57" fill="none" stroke="#d2dfa8" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M35 72C44 68 57 68 65 72" stroke="#f0d49a" strokeWidth="1" opacity=".55"/>
          <g fill="#d3b26b">
            <circle cx="28" cy="75" r="2"/>
            <circle cx="72" cy="77" r="2.5"/>
          </g>
        </g>
      )}

      {kind === "tea" && level === 4 && (
        <g filter={`url(#${shadow})`}>
          <path d="M28 38C23 36 18 33 16 29" fill="none" stroke="#55724e" strokeWidth="3" strokeLinecap="round"/>
          <path d="M24 42C31 31 41 26 52 28C53 39 48 50 37 57C31 54 27 49 24 42Z" fill={`url(#${green})`}/>
          <path d="M64 42C71 32 79 29 87 32C86 42 79 49 68 52" fill="#6f925a"/>
          <path d="M30 47H72L65 78H38Z" fill={`url(#${glass})`} stroke="#dfead5" strokeWidth="1.5"/>
          <ellipse cx="51" cy="44" rx="25" ry="7" fill="#4c6650"/>
          <ellipse cx="51" cy="43" rx="19" ry="4" fill="#78926a"/>
          <path d="M38 56C46 52 56 52 64 56" fill="none" stroke="#688178" strokeWidth="1.5"/>
          <path d="M45 64C48 60 56 58 62 62C59 68 51 70 45 64Z" fill="#315a53" opacity=".75"/>
          <path d="M66 12C75 21 78 30 76 40" fill="none" stroke="#e7ddbc" strokeWidth="2" strokeLinecap="round" opacity=".7"/>
          <circle cx="77" cy="22" r="4" fill={`url(#${gold})`}/>
        </g>
      )}

      {kind === "tea" && level === 5 && (
        <g filter={`url(#${shadow})`}>
          <circle cx="50" cy="46" r="36" fill="#f1dfaa" opacity=".1"/>
          <path d="M19 73H81L75 84H25Z" fill="#6d5035"/>
          <path d="M36 57C32 48 33 39 40 34C49 34 57 39 61 48C57 60 49 66 39 64C38 62 37 60 36 57Z" fill={`url(#${glass})`} stroke="#dfe9d8" strokeWidth="1.3"/>
          <path d="M57 50C68 48 73 53 72 60C66 65 61 63 58 59" fill="none" stroke="#b4cdc2" strokeWidth="5" strokeLinecap="round"/>
          <path d="M34 46C42 43 50 44 57 48" fill="none" stroke="#eff4df" strokeWidth="1.2" opacity=".8"/>
          <ellipse cx="50" cy="36" rx="11" ry="4" fill="#7f9b86"/>
          <circle cx="50" cy="33" r="3" fill="#d5c078"/>
          <path d="M24 65H37L34 76H27Z" fill="#d6e2cf"/>
          <path d="M21 66H40" stroke="#edf1dc" strokeWidth="2"/>
          <path d="M23 57C18 49 17 43 20 37C29 41 31 48 28 58" fill="#dce5d3" opacity=".4"/>
          <path d="M72 31C77 23 80 17 86 12" fill="none" stroke="#567a4d" strokeWidth="3" strokeLinecap="round"/>
          <path d="M82 19C87 14 93 13 98 16C94 22 89 24 82 19Z" fill="#78995d"/>
          {sparkle}
        </g>
      )}

      {kind === "tea" && level === 6 && (
        <g filter={`url(#${shadow})`}>
          <circle cx="50" cy="42" r="39" fill={`url(#${glow})`}/>
          <path d="M10 73C27 66 73 66 91 73L82 87H18Z" fill="#765639"/>
          <path d="M16 73C32 76 68 77 86 73" fill="none" stroke="#d2ad75" strokeWidth="2"/>
          <path d="M38 49C35 40 36 33 42 28C50 29 56 35 58 43C55 53 49 58 42 56C40 54 39 52 38 49Z" fill={`url(#${glass})`} stroke="#e3eddc" strokeWidth="1.3"/>
          <path d="M56 42C64 41 69 45 67 51C63 55 58 53 56 50" fill="none" stroke="#afc9bd" strokeWidth="4.5" strokeLinecap="round"/>
          <ellipse cx="48" cy="29" rx="9" ry="3.5" fill="#779282"/>
          <path d="M68 57H82L78 68H71Z" fill="#e7ead6"/>
          <path d="M66 58H84" stroke="#f5f1d9" strokeWidth="2"/>
          <path d="M20 59H34L31 70H23Z" fill="#d9e4d0"/>
          <path d="M18 60H36" stroke="#eef1dc" strokeWidth="2"/>
          <path d="M22 53C19 47 19 42 22 36C28 40 29 46 27 54" fill="#dfe8d4" opacity=".45"/>
          <path d="M78 25C83 18 89 15 96 17C92 25 87 29 78 29" fill="#829d62"/>
          <g fill="#e6c36f">
            <circle cx="72" cy="30" r="3.2"/>
            <circle cx="79" cy="24" r="2.6"/>
            <circle cx="64" cy="22" r="2.2"/>
          </g>
          <path d="M50 15C55 10 58 5 59 0" fill="none" stroke="#f8e9c0" strokeWidth="2" strokeLinecap="round" opacity=".7"/>
          {sparkle}
        </g>
      )}

      {kind === "koi" && level === 1 && (
        <g filter={`url(#${shadow})`}>
          <path d="M22 66C35 31 75 21 84 54C70 75 39 82 22 66Z" fill={`url(#${blue})`} stroke="#e3f2e9" strokeWidth="1.4"/>
          <path d="M29 61C42 41 64 36 77 48" fill="none" stroke="#eef8ee" strokeWidth="2" opacity=".55"/>
          <path d="M39 53L52 65M51 45L62 60M64 40L70 55" stroke="#dcefe4" strokeWidth="1.2" opacity=".35"/>
          <path d="M75 38C85 33 90 38 92 48C84 49 79 46 75 38Z" fill="#8cc1b6" opacity=".7"/>
          <circle cx="34" cy="62" r="3" fill="#fff2bf"/>
          {sparkle}
        </g>
      )}

      {kind === "koi" && level === 2 && (
        <g filter={`url(#${shadow})`}>
          <path d="M18 61C34 43 57 41 72 54C64 67 47 73 30 69C24 67 20 65 18 61Z" fill={`url(#${red})`}/>
          <path d="M67 49C77 39 86 40 92 50C85 57 78 58 70 56Z" fill="#f4b36c"/>
          <path d="M67 60C78 61 84 68 85 77C74 75 68 70 64 63Z" fill="#d76b4e" opacity=".82"/>
          <path d="M30 56C39 48 51 47 61 52C58 62 50 68 39 69C34 65 31 61 30 56Z" fill="#f9d69c" opacity=".8"/>
          <path d="M43 50C46 57 45 64 41 70" fill="none" stroke="#b94d3f" strokeWidth="1.2" opacity=".55"/>
          <circle cx="29" cy="58" r="2.6" fill="#2c3f37"/>
          <circle cx="29" cy="58" r=".9" fill="#fff8d8"/>
          <path d="M20 61C13 63 9 69 10 76C17 73 21 68 23 64Z" fill="#e58c65" opacity=".7"/>
          <path d="M44 43C50 38 57 38 63 41" fill="none" stroke="#fff0c8" strokeWidth="1.4" strokeLinecap="round" opacity=".55"/>
        </g>
      )}

      {kind === "koi" && level === 3 && (
        <g filter={`url(#${shadow})`}>
          <path d="M42 15C54 23 61 34 63 48C64 60 58 70 48 79" fill="none" stroke="#6a4a32" strokeWidth="2"/>
          <path d="M61 48C66 62 63 75 51 83" fill="none" stroke="#6a4a32" strokeWidth="2"/>
          <path d="M13 57C27 35 51 33 67 48C59 64 43 73 24 69C18 66 14 62 13 57Z" fill={`url(#${red})`}/>
          <path d="M62 43C71 35 82 37 89 47C82 55 73 56 65 50Z" fill="#e7af63"/>
          <path d="M61 57C72 60 77 68 76 78C66 74 61 67 59 60Z" fill="#cb5944"/>
          <path d="M28 53C37 46 48 46 57 51C53 60 44 65 35 66C31 62 29 58 28 53Z" fill="#f7d19a"/>
          <circle cx="24" cy="55" r="2.7" fill="#442e29"/>
          <path d="M69 63C74 69 82 72 90 70C85 64 80 61 72 59Z" fill="#f1b56b" opacity=".72"/>
          <path d="M12 60C4 62 -1 67 0 74C8 72 12 68 14 63Z" fill="#e7885e"/>
          <path d="M38 38C44 34 51 34 57 37" fill="none" stroke="#fff0ca" strokeWidth="1.4" opacity=".6"/>
          {sparkle}
        </g>
      )}

      {kind === "koi" && level === 4 && (
        <g filter={`url(#${shadow})`}>
          <path d="M49 12V88" stroke="#6b4730" strokeWidth="2"/>
          <path d="M14 53C27 29 52 27 65 43C58 62 42 72 23 67C17 63 15 58 14 53Z" fill={`url(#${gold})`} opacity=".95"/>
          <path d="M61 39C70 29 82 31 90 42C82 51 72 51 63 46Z" fill="#efb659"/>
          <path d="M60 54C71 58 76 66 76 77C66 72 60 65 57 58Z" fill="#d88142"/>
          <path d="M28 49C36 42 47 42 56 47C52 57 43 62 34 63C31 59 29 54 28 49Z" fill="#fff0bd" opacity=".72"/>
          <circle cx="24" cy="51" r="2.7" fill="#4d3127"/>
          <path d="M12 56C3 55 -2 50 0 42C8 47 12 51 15 58Z" fill="#e4a34e" opacity=".6"/>
          <path d="M24 37C36 25 51 20 66 23" fill="none" stroke="#f6e4a6" strokeWidth="1.5" strokeLinecap="round" opacity=".6"/>
          <path d="M70 27C74 20 81 17 88 19C84 26 79 30 72 30" fill="#6f955d"/>
          <g fill="#fff0ae">
            <circle cx="35" cy="44" r="3"/>
            <circle cx="44" cy="50" r="2.2"/>
            <circle cx="51" cy="42" r="2.5"/>
          </g>
          {sparkle}
        </g>
      )}

      {kind === "koi" && level === 5 && (
        <g filter={`url(#${shadow})`}>
          <path d="M9 60C29 25 60 20 78 37C79 54 70 70 55 81C39 87 22 79 9 60Z" fill={`url(#${blue})`}/>
          <path d="M73 32C84 22 93 25 98 37C91 45 84 46 76 42Z" fill="#9ed2c7"/>
          <path d="M55 78C67 70 77 72 87 82C75 89 64 88 54 83Z" fill="#75b2a8" opacity=".7"/>
          <path d="M32 42C45 36 59 41 64 53C59 67 45 76 30 71C24 62 24 50 32 42Z" fill="#d7ece1" opacity=".7"/>
          <path d="M29 41C19 31 11 31 5 36C8 46 17 51 27 48Z" fill="#b0d8cc"/>
          <path d="M26 71C19 81 21 89 29 95C37 87 37 79 32 72Z" fill="#84b9ad"/>
          <circle cx="28" cy="56" r="3" fill="#f9edb5"/>
          <circle cx="28" cy="56" r="1" fill="#3b4b40"/>
          <path d="M17 61C24 65 32 67 40 66" fill="none" stroke="#f7f1d4" strokeWidth="1.4" opacity=".5"/>
          <g fill="none" stroke="#f4e7b9" strokeWidth="1.2" opacity=".55" strokeLinecap="round">
            <path d="M5 31C2 26 3 21 7 18"/>
            <path d="M14 25C12 20 15 15 19 13"/>
          </g>
          {sparkle}
        </g>
      )}

      {kind === "koi" && level === 6 && (
        <g filter={`url(#${shadow})`}>
          <circle cx="50" cy="44" r="40" fill={`url(#${glow})`}/>
          <path d="M8 55C24 25 55 17 74 33C77 49 69 67 53 78C37 83 20 74 8 55Z" fill={`url(#${blue})`} stroke="#f1e4b1" strokeWidth="1.5"/>
          <path d="M66 28C79 18 91 21 99 34C92 45 81 46 71 40Z" fill="#f1c76c"/>
          <path d="M51 75C64 65 76 69 88 81C74 90 61 89 49 81Z" fill="#deaa54" opacity=".9"/>
          <path d="M25 35C37 25 52 26 61 37C59 51 49 63 35 67C25 60 20 48 25 35Z" fill="#fff1c2" opacity=".8"/>
          <path d="M27 38C17 27 8 27 2 33C7 43 16 47 25 44Z" fill="#9dd0c3"/>
          <path d="M25 66C17 77 20 88 30 95C38 84 37 74 30 67Z" fill="#e3b760"/>
          <circle cx="27" cy="49" r="3" fill="#f9e7a3"/>
          <circle cx="27" cy="49" r="1" fill="#3d4c42"/>
          <path d="M19 43C12 36 9 29 10 21M22 37C20 29 22 21 27 15" fill="none" stroke="#f6eabd" strokeWidth="1.2" strokeLinecap="round" opacity=".7"/>
          <g fill="#fff0aa">
            <circle cx="45" cy="35" r="3"/>
            <circle cx="55" cy="48" r="2.2"/>
            <circle cx="41" cy="54" r="2.5"/>
            <circle cx="61" cy="61" r="1.8"/>
          </g>
          <path d="M500 0" stroke="none"/>
          {sparkle}
        </g>
      )}
    </svg>
  );
}
