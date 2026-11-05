import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

const links = [
  { href: "/#home", label: "Home" },
  { href: "/#products", label: "Products" },
  { href: "/#contact", label: "Contact" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled ? "py-2" : "py-4"
      )}
    >
      <div className="container">
        <nav
          className={cn(
            "flex items-center justify-between rounded-full px-3 py-2 transition-all duration-500",
            scrolled ? "glass-strong shadow-floating" : "glass"
          )}
        >
          <a href="/#home" className="flex items-center gap-3 pl-2">
            <motion.img
              src={logo}
              alt="Ankur Chemidyes logo"
              width={40}
              height={40}
              className="h-10 w-10 rounded-xl shadow-elevated"
              whileHover={{ rotate: -8, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            <span className="font-display text-lg font-semibold tracking-tight">
              Ankur <span className="text-gradient">Chemidyes</span>
            </span>
          </a>

          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="relative px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
                <span className="absolute inset-x-3 -bottom-0.5 h-px scale-x-0 bg-gradient-primary transition-transform duration-300 hover:scale-x-100" />
              </a>
            ))}
            <a
              href="/videos"
              className="ml-2 inline-flex items-center gap-2 rounded-full bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-elevated transition-all hover:shadow-glow hover:-translate-y-0.5"
            >
              <span className="grid h-4 w-4 place-items-center rounded-sm bg-white/20">▶</span>
              Videos
            </a>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            <button
              aria-label="Toggle menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="md:hidden grid h-10 w-10 place-items-center rounded-full glass"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden mt-2 glass-strong rounded-2xl p-4 flex flex-col gap-2"
            >
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-secondary"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="/videos"
                onClick={() => setOpen(false)}
                className="rounded-xl bg-gradient-primary px-4 py-3 text-sm font-medium text-primary-foreground"
              >
                Videos
              </a>
              <div className="pt-2 sm:hidden">
                <ThemeToggle />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
