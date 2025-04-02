"use client";

import { motion } from "framer-motion";

export default function Elev8LogoReveal() {
  return (
    <div className="relative flex items-center justify-center mt-24 scale-[1.6] -ml-10">
      {/* elev.png kommer fra venstre */}
      <motion.img
        src="/elev.png"
        alt="elev"
        className="w-[200px] z-10 relative"
        initial={{ opacity: 0, x: -80 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
      />

      {/* ∞ tegnet animert og stilrent */}
      <motion.span
        className="text-[85px] font-bold -ml-12 -mt-2 text-black drop-shadow-md"
        initial={{ scale: 1.3, x: -10, opacity: 0 }}
        animate={{ scale: 1, x: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
      >
        ∞
      </motion.span>
    </div>
  );
}
