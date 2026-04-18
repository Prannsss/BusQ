"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-50 p-4 bg-[#1d348a] border-2 border-[#1d348a] hover:bg-[#1d348a]/90 hover:scale-110 transition-all duration-300 rounded-none shadow-[4px_4px_0px_0px_rgba(255,104,2)]"
      aria-label="Back to top"
    >
      <ArrowUp className="h-6 w-6 text-[#ff6802] font-black" strokeWidth={3} />
    </button>
  );
}
