"use client";

import { useEffect, useState } from "react";

const fontSizes = [
  { label: "Liten", value: "14px" },
  { label: "Normal", value: "16px" },
  { label: "Stor", value: "18px" },
  { label: "Ekstra stor", value: "20px" },
];

const themeColors = [
  { label: "Teal", value: "180 98% 20%" },
  { label: "Koral", value: "12 76% 61%" },
  { label: "Lilla", value: "280 65% 60%" },
];

export default function SettingsControls() {
  const [darkMode, setDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState("16px");
  const [primaryColor, setPrimaryColor] = useState("180 98% 20%");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const storedSize = localStorage.getItem("fontSize");
    const storedColor = localStorage.getItem("primaryColor");

    if (storedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }
    if (storedSize) {
      document.documentElement.style.setProperty("--font-size", storedSize);
      setFontSize(storedSize);
    }
    if (storedColor) {
      document.documentElement.style.setProperty("--primary", storedColor);
      setPrimaryColor(storedColor);
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newMode);
  };

  const changeFontSize = (size: string) => {
    setFontSize(size);
    localStorage.setItem("fontSize", size);
    document.documentElement.style.setProperty("--base-font-size", size);

  };

  const changeColor = (color: string) => {
    setPrimaryColor(color);
    localStorage.setItem("primaryColor", color);
    document.documentElement.style.setProperty("--primary", color);
  };

  return (
    <div className="space-y-6 text-left max-w-xl mx-auto mt-10">
      <div>
        <label className="block mb-1 font-semibold">Tema:</label>
        <button
          onClick={toggleDarkMode}
          className="bg-teal text-white px-4 py-2 rounded shadow"
        >
          {darkMode ? "Bytt til lyst tema" : "Bytt til mørkt tema"}
        </button>
      </div>

      <div>
        <label className="block mb-1 font-semibold">Tekststørrelse:</label>
        <div className="flex flex-wrap gap-2">
          {fontSizes.map((size) => (
            <button
              key={size.value}
              onClick={() => changeFontSize(size.value)}
              className={`px-4 py-1 border rounded ${
                fontSize === size.value ? "bg-teal text-white" : "bg-white"
              }`}
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block mb-1 font-semibold">Primærfarge:</label>
        <div className="flex flex-wrap gap-2">
          {themeColors.map((c) => (
            <button
              key={c.value}
              onClick={() => changeColor(c.value)}
              className={`px-4 py-1 border rounded ${
                primaryColor === c.value ? "bg-teal text-white" : "bg-white"
              }`}
              style={{ borderColor: `hsl(${c.value})` }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
