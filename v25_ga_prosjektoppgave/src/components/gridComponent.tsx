"use client";
import React from "react";
import { Users, Bell, FileText, Book } from "lucide-react"; // Importer relevante ikoner

const gridItems = [
  { id: 1, icon: <Users size={40} />, title: "Pasienter" },
  { id: 2, icon: <Bell size={40} />, title: "Varsler" },
  { id: 3, icon: <FileText size={40} />, title: "Rapporter" },
  { id: 4, icon: <Book size={40} />, title: "Bibliotek" },
];

const GridComponent = () => {
  return (
    <div className="p-8 mt-28 flex justify-center">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-x-32 gap-y-16 w-full max-w-4xl">
        {gridItems.map((item) => (
          <div
            key={item.id}
            className="bg-red-400 rounded-lg h-40 w-full flex flex-col items-center justify-center text-white text-2xl font-semibold shadow-lg transition-transform transform hover:scale-105"
          >
            {item.icon}
            <p className="mt-3 text-lg">{item.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GridComponent;
