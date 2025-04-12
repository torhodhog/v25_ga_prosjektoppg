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
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const storedSize = localStorage.getItem("fontSize");
    const storedColor = localStorage.getItem("primaryColor");
    const storedImage = localStorage.getItem("profileImage"); // Hent lagret bilde

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
    if (storedImage) {
      setProfileImage(storedImage); // Sett lagret bilde
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const res = await fetch("https://fysioterapi-backend-production.up.railway.app/api/profil/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setProfileImage(data.bildeUrl);
        localStorage.setItem("profileImage", data.bildeUrl); // Lagre bilde-URL i localStorage
      } else {
        console.error("Image upload failed.");
      }
    } catch (err) {
      console.error("Error uploading image:", err);
    }
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
        <label className="block mb-1 font-semibold">Tekststørrelse :</label>
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

      <div>
        <label className="block mb-1 font-semibold">Last opp profilbilde:</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="block mt-2"
        />
        {profileImage && (
          <div className="mt-4">
            <img
              src={profileImage}
              alt="Uploaded profile"
              className="rounded-full w-24 h-24"
            />
          </div>
        )}
      </div>
    </div>
  );
}