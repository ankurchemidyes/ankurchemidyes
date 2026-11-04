import { motion } from "framer-motion";
import { MapPin, Clock, Mail, Send, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { LocationMap } from "./LocationMap";

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxYhzc35nnDkzcFdnBGYNYknwLqdSqzOruOAdISgNUK2wDDEUKxuh8IPKVpUluBE3bV/exec";

export const Contact = () => {
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const requirements = (formData.get("msg") as string)?.trim();

    if (!name || !email || !requirements) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);

    const body = JSON.stringify({ name, email, requirements });

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body,
      });

      form.reset();
      toast.success("Inquiry sent", {
        description: "We'll get back to you within one business day.",
      });
    } catch (err) {
      console.error("Inquiry submission failed:", err);
      toast.error("Something went wrong", {
        description: "Please try again or email us directly.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="relative py-24 lg:py-32 overflow-hidden">
      <div aria-hidden className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
      <div aria-hidden className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-gradient-glow blur-3xl opacity-50" />

      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Contact</p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mt-3">
            Partner <span className="text-gradient">With Us</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            We provide bulk raw materials to footwear manufacturers across the globe. Get in touch to
            discuss your supply chain needs.
          </p>
        </motion.div>

        <div className="mt-16 grid lg:grid-cols-5 gap-8">
          {/* Info cards */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-4"
          >
            {[
              {
                icon: MapPin,
                title: "Office Address",
                lines: ["Modern, Kolathara Rd, near Krishi Bhavan", "Nallalam, Kozhikode, Kerala 673655"],
              },
              {
                icon: Clock,
                title: "Business Hours",
                lines: ["Monday – Saturday", "9:00 AM – 6:00 PM"],
              },
              {
                icon: Mail,
                title: "Email Us",
                lines: ["ankurchemidyes123@gmail.com", "info@ankurchemidyes.com"],
                emails: true,
              },
            ].map(({ icon: Icon, title, lines, emails }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="glass rounded-2xl p-6 shadow-elevated transition-shadow hover:shadow-floating"
              >
                <div className="flex items-start gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-display text-base font-semibold">{title}</h4>
                    <div className="mt-1.5 space-y-0.5 text-sm text-muted-foreground">
                      {lines.map((l) =>
                        emails ? (
                          <a key={l} href={`mailto:${l}`} className="block hover:text-primary transition-colors">
                            {l}
                          </a>
                        ) : (
                          <div key={l}>{l}</div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3 perspective"
          >
            <form
              onSubmit={onSubmit}
              className="glass-strong rounded-3xl p-8 shadow-deep relative overflow-hidden"
            >
              <div aria-hidden className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-gradient-primary opacity-15 blur-2xl" />

              <h3 className="font-display text-2xl font-semibold">Send an Inquiry</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Tell us what you need — we'll respond within one business day.
              </p>

              <div className="mt-6 space-y-4">
                <Field label="Company / Name" id="name" type="text" required />
                <Field label="Email Address" id="email" type="email" required />
                <div>
                  <label htmlFor="msg" className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                    Material Requirements
                  </label>
                  <textarea
                    id="msg"
                    name="msg"
                    rows={5}
                    required
                    placeholder="Describe the materials, quantities and delivery timelines you need…"
                    className="w-full rounded-2xl bg-background/60 border border-border px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:shadow-glow placeholder:text-muted-foreground/60"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-primary px-6 py-4 text-sm font-semibold text-primary-foreground shadow-deep transition-all hover:-translate-y-0.5 hover:shadow-glow disabled:opacity-70"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      Send Inquiry
                      <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>

        {/* Location Map */}
        <div className="mt-12 sm:mt-16">
          <LocationMap />
        </div>
      </div>
    </section>
  );
};

const Field = ({ label, id, type, required }: { label: string; id: string; type: string; required?: boolean }) => (
  <div>
    <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
      {label}
    </label>
    <input
      id={id}
      name={id}
      type={type}
      required={required}
      className="w-full rounded-2xl bg-background/60 border border-border px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:shadow-glow"
    />
  </div>
);
