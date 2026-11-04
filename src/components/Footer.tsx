import logo from "@/assets/logo.png";
import { Facebook, Instagram, Twitter, Youtube, Linkedin } from "lucide-react";

const socials = [
  { label: "Instagram", href: "https://www.instagram.com/ankur_chemidyes/", Icon: Instagram },
  {
    label: "Threads",
    href: "https://www.threads.com/@ankur.chemidyes",
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-[18px] w-[18px]">
        <path d="M18.263 11.097c-.03-3.486-1.92-5.586-5.111-5.586-2.13 0-3.922.963-4.863 2.499l2.062 1.438c.535-.843 1.272-1.543 2.628-1.543 1.528 0 2.318.85 2.544 2.431a15 15 0 0 0-2.236-.173c-4.125 0-6.068 1.867-6.068 4.336s1.943 3.99 4.804 3.99c3.139 0 5.013-2.115 5.781-4.735.798.361 1.348 1.204 1.348 2.47 0 3.387-3.907 5.232-7.22 5.232-4.885 0-8.077-3.207-8.077-8.424 0-6.392 4.223-10.487 9.9-10.487 3.808 0 5.69 1.671 6.97 3.914l2.108-1.475C21.44 2.078 18.331 0 13.663 0 6.227 0 1.168 5.277 1.168 12.934c0 7 4.953 11.066 10.856 11.066 4.878 0 9.809-2.846 9.809-7.716 0-2.545-1.46-4.231-3.569-5.187m-6.33 4.855c-1.077 0-2.026-.512-2.026-1.453 0-1.483 1.822-1.934 3.606-1.934.678 0 1.34.045 1.927.173-.422 1.927-1.671 3.215-3.508 3.214Z" />
      </svg>
    ),
  },
  { label: "X (Twitter)", href: "https://x.com/AnkurChemidyes", Icon: Twitter },
  { label: "YouTube", href: "https://www.youtube.com/@ankurchemidyesofficial", Icon: Youtube },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/ankurchemidyes/", Icon: Linkedin },
  { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61589184028778", Icon: Facebook },
];

export const Footer = () => (
  <footer className="relative z-10 border-t border-border/60 py-6 mt-12">
    <div className="container">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        {/* Social section — top on mobile, left on desktop */}
        <div className="flex flex-col items-center gap-3 md:items-start md:order-1">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Follow Us</span>
          <div className="relative z-20 flex items-center gap-2.5">
            {socials.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className="group relative z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-border/60 bg-surface-1/60 text-muted-foreground shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:text-primary hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Icon className="pointer-events-none relative z-10 h-[18px] w-[18px]" strokeWidth={2} />
                <span className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 bg-gradient-glow group-hover:opacity-30" />
              </a>
            ))}
          </div>
        </div>

        {/* Brand + tagline — bottom on mobile, aligned slightly to the left on desktop to match form width */}
        <div className="flex items-center gap-3.5 md:order-2 md:text-left lg:mr-8 xl:mr-16">
          <img
            src={logo}
            alt="Ankur Chemidyes"
            width={38}
            height={38}
            loading="lazy"
            className="h-9 w-9 rounded-lg shadow-elevated shrink-0"
          />
          <div className="text-center md:text-left">
            <div className="font-display font-semibold">Ankur Chemidyes</div>
            <div className="text-xs text-muted-foreground">Premier Suppliers of Footwear Raw Materials</div>
          </div>
        </div>
      </div>

      {/* Bottom bar: nav + copyright */}
      <div className="mt-5 flex flex-col items-center gap-3 border-t border-border/40 pt-4 md:flex-row md:justify-between">
        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#home" className="hover:text-foreground transition-colors">Home</a>
          <a href="#products" className="hover:text-foreground transition-colors">Products</a>
          <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
        </nav>
        <div className="text-xs text-muted-foreground text-center">© {new Date().getFullYear()} Ankur Chemidyes. All rights reserved.</div>
      </div>
    </div>
  </footer>
);
