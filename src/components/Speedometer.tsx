import React from "react";

type Props = {
  smerteVerdi: number; // 0–10 skala
};

export default function Speedometer({ smerteVerdi }: Props) {
  const angle = (smerteVerdi / 10) * 180;

  return (
    <div className="relative w-64 h-40 bg-white rounded-2xl shadow-lg flex flex-col items-center justify-center p-4">
      <svg viewBox="0 0 200 100" className="w-full h-full">
  <defs>
  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">

      <stop offset="0%" stopColor="#4ade80" />     {/* grønn */}
      <stop offset="50%" stopColor="#facc15" />    {/* gul */}
      <stop offset="100%" stopColor="#b91c1c" />   {/* blodrød */}
    </linearGradient>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.2" />
    </filter>
  </defs>

  {/* Bakgrunnsbue */}
  <path
    d="M10,100 A90,90 0 0,1 190,100"
    fill="url(#gradient)"
    stroke="none"
    filter="url(#shadow)"
  />

  {/* Nålen med animasjon */}
  <g transform={`rotate(${angle - 90}, 100, 100)`}>
    <rect x="99.5" y="40" width="1" height="55" fill="black" rx="0.5" />
  </g>

  <circle cx="100" cy="100" r="6" fill="black" />
</svg>


      {/* Forklaring under */}
      <p className="mt-2 text-sm font-bold text-gray-600">
        {smerteVerdi <= 3
          ? " Lav smerte"
          : smerteVerdi <= 7
          ? " Moderat smerte"
          : " Høy smerte"}
      </p>
    </div>
  );
}
