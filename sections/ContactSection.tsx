"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import type { Profile } from "@/types/content";

const mailIcon = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const githubIcon = (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  </svg>
);

const linkedinIcon = (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

/**
 * Web3Forms (web3forms.com): sunucusuz form servisi, mesajı doğrudan
 * profildeki e-postaya iletir. Anahtar herkese açık olacak şekilde tasarlanmış;
 * yalnızca bu forma gönderim yapmaya yarar, gizli değildir.
 */
const WEB3FORMS_ACCESS_KEY = "f0f6b9e3-56f0-4168-ae17-e814f89eef45";
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

type Status = "idle" | "submitting" | "success" | "error";

/** Bağlantı metni: "https://" ve son eğik çizgi gösterilmez. */
function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export default function ContactSection({ profile }: { profile: Profile }) {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
    // Honeypot: gizli alan, yalnızca botlar doldurur. Web3Forms dolu gelen
    // gönderimi sessizce reddeder.
    botcheck: false,
  });
  const [status, setStatus] = useState<Status>("idle");

  const contacts = [
    {
      label: "Email",
      value: profile.email,
      href: `mailto:${profile.email}`,
      icon: mailIcon,
    },
    profile.githubUrl && {
      label: "GitHub",
      value: displayUrl(profile.githubUrl),
      href: profile.githubUrl,
      icon: githubIcon,
    },
    profile.linkedinUrl && {
      label: "LinkedIn",
      value: displayUrl(profile.linkedinUrl),
      href: profile.linkedinUrl,
      icon: linkedinIcon,
    },
  ].filter(Boolean) as {
    label: string;
    value: string;
    href: string;
    icon: React.ReactNode;
  }[];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    // FormData "basit istek"tir, CORS preflight gerektirmez. JSON gövdeli
    // isteğin preflight'ı Web3Forms önündeki Cloudflare'de takılabiliyor.
    const body = new FormData();
    body.append("access_key", WEB3FORMS_ACCESS_KEY);
    body.append("subject", `Portfolio contact from ${formState.name}`);
    body.append("from_name", "burakgemici.com.tr");
    body.append("name", formState.name);
    body.append("email", formState.email);
    body.append("message", formState.message);
    if (formState.botcheck) body.append("botcheck", "on");

    try {
      const response = await fetch(WEB3FORMS_ENDPOINT, { method: "POST", body });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.success) {
        setStatus("error");
        return;
      }

      setStatus("success");
      setFormState({ name: "", email: "", message: "", botcheck: false });
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="contact" className="py-24 px-6 relative pb-32">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Get in <span className="gradient-text">Touch</span>
          </h2>
          <p className="text-zinc-400 text-sm font-mono uppercase tracking-widest">
            Write to me
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="space-y-6"
          >
            {contacts.map((contact) => {
              const isMail = contact.href.startsWith("mailto:");
              return (
                <motion.a
                  key={contact.label}
                  href={contact.href}
                  {...(isMail
                    ? {}
                    : { target: "_blank", rel: "noopener noreferrer" })}
                  variants={item}
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-4 p-4 rounded-xl glass hover:bg-white/5 transition-colors border border-white/5"
                >
                  <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
                    {contact.icon}
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400 uppercase tracking-wider">
                      {contact.label}
                    </p>
                    <p className="text-white font-medium">{contact.value}</p>
                  </div>
                </motion.a>
              );
            })}
          </motion.div>

          <motion.form
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="glass-strong rounded-2xl p-8 border border-white/10"
          >
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm text-zinc-400 mb-2">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  value={formState.name}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, name: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-accent/50 transition-colors"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm text-zinc-400 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={formState.email}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, email: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-accent/50 transition-colors"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm text-zinc-400 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formState.message}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, message: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-accent/50 transition-colors resize-none"
                  placeholder="Your message..."
                  required
                />
              </div>

              <input
                type="checkbox"
                name="botcheck"
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                checked={formState.botcheck}
                onChange={(e) =>
                  setFormState((s) => ({ ...s, botcheck: e.target.checked }))
                }
              />

              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full py-3 rounded-xl bg-accent-dark hover:bg-accent text-white font-medium transition-all hover:shadow-lg hover:shadow-accent/25 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === "submitting" ? "Sending..." : "Send Message"}
              </button>

              <p role="status" aria-live="polite" className="text-sm text-center">
                {status === "success" && (
                  <span className="text-emerald-400">
                    Thanks, your message was sent. I&apos;ll get back to you soon.
                  </span>
                )}
                {status === "error" && (
                  <span className="text-red-400">
                    The message couldn&apos;t be sent. Please try again or email me at{" "}
                    <a href={`mailto:${profile.email}`} className="underline">
                      {profile.email}
                    </a>
                    .
                  </span>
                )}
              </p>
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
