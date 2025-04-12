"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Bell, FileText, Book } from "lucide-react";

interface Varsel {
  lest: boolean;
}

const GridComponent = () => {
  const [ulesteVarsler, setUlesteVarsler] = useState<number>(0);

  useEffect(() => {
    const fetchVarsler = async () => {
      try {
        const res = await fetch(
          "https://fysioterapi-backend-production.up.railway.app/api/varsler",
          {
            credentials: "include", // Bruk cookies for autentisering
          }
        );

        if (!res.ok) throw new Error("Feil ved henting av varsler");

        const data: Varsel[] = await res.json();
        const uleste = data.filter((v) => !v.lest).length;
        setUlesteVarsler(uleste);
      } catch (err) {
        console.error("Klarte ikke hente varsler:", err);
      }
    };

    fetchVarsler();
  }, []);

  const gridItems = [
    {
      id: 1,
      icon: <Users size={40} />,
      title: "Pasienter",
      href: "/admin/pasienter",
    },
    {
      id: 2,
      icon: <Bell size={40} />,
      title: "Varsler",
      href: "/admin/varsler",
      badge: ulesteVarsler,
    },
    {
      id: 3,
      icon: <FileText size={40} />,
      title: "Rapporter",
      href: "/admin/rapporter",
    },
    {
      id: 4,
      icon: <Book size={40} />,
      title: "Bibliotek",
      href: "/admin/bibliotek",
    },
  ];

  return (
    <div className="p-8 mt-28 flex justify-center items-center">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-x-32 gap-y-16 w-full max-w-4xl">
        {gridItems.map((item) => (
          <Link key={item.id} href={item.href}>
            <div className="relative bg-teal rounded-lg h-40 w-full flex flex-col items-center justify-center text-white text-2xl font-semibold shadow-lg transition-transform transform hover:scale-105 hover:bg-light_teal cursor-pointer">
              {item.icon}
              <p className="mt-3 text-lg">{item.title}</p>

              {(item.badge ?? 0) > 0 && (
                                <div className="absolute top-2 right-4 bg-red-600 text-white text-2xl rounded-full px-2 py-0.5 animate-pulse">
                  {item.badge}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default GridComponent;
