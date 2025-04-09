"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "./ui/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
} from "@tabler/icons-react";
import { FaPeopleArrows } from "react-icons/fa";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user: { navn: string } | null;
}

export function SidebarDemo({ user }: SidebarProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Logg ut-funksjon
  const handleLogout = () => {
    localStorage.removeItem("token"); // Fjern token
    router.push("/");
  };

  const links = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: <IconBrandTabler className="text-light h-5 w-5 shrink-0" />,
    },
    {
      label: "Profil",
      href: "/admin/profile",
      icon: <IconUserBolt className="text-light h-5 w-5 shrink-0" />,
    },
    {
      label: "Pasienter",
      href: "/admin/pasienter",
      icon: <FaPeopleArrows className="text-light h-5 w-5 shrink-0" />,
    },
    {
      label: "Innstillinger",
      href: "/admin/settings",
      icon: <IconSettings className="text-light h-5 w-5 shrink-0" />,
    },
  ];

  return (
    <div
      className={cn(
        "fixed top-0 left-0 h-screen w-64  flex flex-col"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 p-2 w-full text-left text-light hover:bg-light_teal rounded-md"
            >
              <IconArrowLeft className="h-5 w-5  shrink-0" />
              <span>Logg ut</span>
            </button>
          </div>

          {/* Brukerinformasjon */}
                    {/* Brukerinformasjon */}
          <div className="flex items-center gap-2 p-4">
            <Image
              src="/doctor.png"
              className="h-7 w-7 shrink-0 rounded-full"
              width={50}
              height={50}
              alt="Avatar"
            />
            {open && (
              <span className="text-white dark:text-white text-sm">
                {user ? user.navn : "Ukjent bruker"}
              </span>
            )}
          </div>
        </SidebarBody>
      </Sidebar>
    </div>
  );
}

export const Logo = () => (
  <div className="flex items-center justify-center py-4 ">
    <Image
      src="/eightlogo.png"
      alt="Logo"
      width={100}
      height={100}
      className="object-contain"
    />
  </div>
);

export const LogoIcon = () => (
  <div className="flex items-center justify-center py-4 ">
    <Image
      src="/eightlogo.png"
      alt="Logo"
      width={50}
      height={50}
      className="object-contain"
    />
  </div>
);
