import React from "react";

type Props = {
  smerteVerdi: number; // 0 = grønn, 10 = rød
};

export default function Speedometer({ smerteVerdi }: Props) {
  // Oversett 0–10 til 0–180 grader
  const angle = (smerteVerdi / 10) * 180;

  return (
    <div className="relative w-56 h-32 bg-white rounded-md shadow-lg">
      <svg viewBox="0 0 200 100" className="w-full h-full">
        {/* Bue-deler: Venstre = grønn, midt = gul, høyre = rød */}
        <path d="M10,100 A90,90 0 0,1 70,10" fill="#81C995" /> 
        <path d="M70,10 A90,90 0 0,1 130,10" fill="#FCE181" /> 
        <path d="M130,10 A90,90 0 0,1 190,100" fill="#F28B82" /> 

        {/* Selve nålen (roteres rundt (100,100)) */}
        <g transform={`rotate(${angle - 90}, 100, 100)`}>
          <rect
            x="99.5"
            y="40"
            width="1"
            height="55"
            fill="black"
            rx="0.5"
            className="drop-shadow"
          />
        </g>

        {/* Sentrert nålbase */}
        <circle cx="100" cy="100" r="6" fill="black" />
      </svg>
    </div>
  );
}
