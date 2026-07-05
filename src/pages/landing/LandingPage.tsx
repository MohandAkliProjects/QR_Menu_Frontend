import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  QrCode, Languages, BarChart3, RefreshCw, Menu, X,
  Check, MessageCircle, Phone, Mail,
  ArrowRight, Zap, Clock, ChevronRight, LogIn, Sparkles,
} from "lucide-react";
import logoImg from "../../assets/ph_pix-logo-fill.png";
import "../../styles/landing.css";

const MENU_PREVIEW_URL = "https://www.qrestodz.app/menu/cafe-el-bahdja";

const WA_URL =
  "https://wa.me/213771356474?text=Bonjour%2C%20je%20suis%20int%C3%A9ress%C3%A9(e)%20par%20QResto%20pour%20mon%20%C3%A9tablissement.";

const DISPLAY_FONT = { fontFamily: '"Playfair Display", Georgia, serif' };

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { label: "Fonctionnalités", href: "#features" },
    { label: "Comment ça marche", href: "#how" },
    { label: "Tarifs", href: "#pricing" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-card border-b border-border shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5">
          <img src={logoImg} alt="QResto" className="w-8 h-8 object-contain" />
          <span className="text-xl font-semibold text-primary" style={DISPLAY_FONT}>
            QResto
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-primary text-sm font-bold hover:bg-card transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Connexion
          </button>
          <a
            href={WA_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366] text-white text-sm font-bold hover:bg-[#1EBE5A] transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-primary" onClick={() => setOpen((o) => !o)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-card border-b border-border px-6 pb-5 pt-2 flex flex-col gap-4">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-primary"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={() => { setOpen(false); navigate("/login"); }}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-primary text-sm font-bold"
          >
            <LogIn className="w-4 h-4" />
            Connexion
          </button>

          <a
            href={WA_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-bold"
          >
            <MessageCircle className="w-4 h-4" />
            Nous contacter sur WhatsApp
          </a>
        </div>
      )}
    </header>
  );
}

// ── Phone mockup ──────────────────────────────────────────────────────────────
function PhoneMockup() {
  return (
    <div className="relative flex-shrink-0">
      <div className="absolute inset-0 rounded-[2.8rem] blur-2xl opacity-20 bg-accent scale-90 translate-y-4" />
      <div
        className="relative w-56 rounded-[2.8rem] p-[3px] shadow-2xl"
        style={{ background: "linear-gradient(160deg,#B68D37,#63432B,#1C0F08)" }}
      >
        <div className="bg-[#1C0F08] rounded-[2.6rem] overflow-hidden">
          <div className="h-6 flex items-center justify-center">
            <div className="w-20 h-3.5 bg-[#2A150C] rounded-full" />
          </div>

          <div
            className="relative overflow-hidden bg-[#F3EFEC]"
            style={{ width: 224, height: 440 }}
          >
            <iframe
              src={MENU_PREVIEW_URL}
              title="Aperçu en direct — Café El Bahdja"
              loading="lazy"
              style={{
                width: 375,
                height: 440 / (224 / 375),
                border: "none",
                zoom: 224 / 375,
                pointerEvents: "none",
              }}
            />
          </div>

          <div className="h-5 bg-[#1C0F08] flex items-center justify-center">
            <div className="w-16 h-1 bg-white/20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="min-h-screen bg-background pt-16 flex items-center overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent px-3 py-1.5 rounded-full text-xs font-bold tracking-wide mb-6">
            <Zap className="w-3.5 h-3.5" />
            Disponible en Algérie 🇩🇿
          </div>

          <h1 className="text-4xl lg:text-5xl font-semibold text-primary leading-tight mb-5" style={DISPLAY_FONT}>
            Digitalisez votre carte en{" "}
            <span className="text-accent">quelques minutes</span>
          </h1>

          <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-md">
            Créez un menu QR élégant pour votre hôtel, restaurant ou café.
            Vos clients scannent, explorent et découvrent — sans contact, sans attente.
          </p>

          <div className="flex flex-wrap gap-3 mb-10">
            <a
              href={WA_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#25D366] text-white font-bold text-sm hover:bg-[#1EBE5A] transition-all shadow-lg shadow-green-900/20 active:scale-95"
            >
              <MessageCircle className="w-5 h-5" />
              Nous contacter sur WhatsApp
            </a>

            <a
              href="#features"
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-border text-primary font-bold text-sm hover:bg-card transition-all"
            >
              Voir les fonctionnalités
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          <div className="flex flex-wrap gap-4">
            {["✓ Sans engagement", "✓ Installation rapide", "✓ Support WhatsApp"].map((b) => (
              <span key={b} className="text-sm text-muted-foreground font-medium">{b}</span>
            ))}
          </div>
        </div>

        <div className="flex justify-center md:justify-end">
          <PhoneMockup />
        </div>
      </div>
    </section>
  );
}

// ── Features ──────────────────────────────────────────────────────────────────
function Features() {
  const features = [
    {
      icon: <QrCode className="w-6 h-6" />,
      title: "QR Code Instantané",
      desc: "Générez votre QR code en un clic. Affichez-le sur vos tables, comptoirs ou à l'entrée.",
    },
    {
      icon: <Languages className="w-6 h-6" />,
      title: "Multilingue",
      desc: "Français, Arabe et Anglais intégrés. Vos clients internationaux se sentent chez eux.",
    },
    {
      icon: <RefreshCw className="w-6 h-6" />,
      title: "Mise à jour en temps réel",
      desc: "Modifiez vos prix, ajoutez des plats ou signalez une rupture — sans réimprimer.",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Analytiques intégrées",
      desc: "Suivez les plats les plus consultés et optimisez votre carte selon les tendances.",
    },
  ];

  return (
    <section id="features" className="bg-background py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-accent text-sm font-bold tracking-widest uppercase mb-3">Fonctionnalités</p>
          <h2 className="text-3xl lg:text-4xl font-semibold text-primary" style={DISPLAY_FONT}>
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Une plateforme pensée pour les professionnels de l'hôtellerie et de la restauration.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-4">
                {f.icon}
              </div>
              <h3 className="font-bold text-primary mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How it works ──────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Créez votre compte",
      desc: "Inscription gratuite en moins de 2 minutes. Aucune carte bancaire requise pour commencer.",
    },
    {
      icon: <QrCode className="w-6 h-6" />,
      title: "Ajoutez vos plats",
      desc: "Interface simple et intuitive. Photos, descriptions, prix, allergènes — tout est paramétrable.",
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Partagez votre QR code",
      desc: "Imprimez sur vos tables ou envoyez le lien par WhatsApp à vos clients.",
    },
  ];

  return (
    <section id="how" className="bg-card py-24 border-y border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-accent text-sm font-bold tracking-widest uppercase mb-3">Comment ça marche</p>
          <h2 className="text-3xl lg:text-4xl font-semibold text-primary" style={DISPLAY_FONT}>
            Démarrez en 3 étapes simples
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-10 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px bg-border" />
          {steps.map((s, i) => (
            <div key={s.title} className="flex flex-col items-center text-center relative">
              <div className="relative mb-5">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
                  {s.icon}
                </div>
                <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-accent flex items-center justify-center text-[10px] font-black text-white">
                  {i + 1}
                </div>
              </div>
              <h3 className="font-bold text-primary text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Preview ───────────────────────────────────────────────────────────────────
function Preview() {
  return (
    <section className="bg-background py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        <div className="order-2 md:order-1">
          <p className="text-accent text-sm font-bold tracking-widest uppercase mb-3">Aperçu du produit</p>
          <h2 className="text-3xl lg:text-4xl font-semibold text-primary mb-5 leading-tight" style={DISPLAY_FONT}>
            Un menu qui donne envie d'explorer
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Vos clients découvrent vos plats avec des photos haute qualité, des descriptions appétissantes
            et la disponibilité en temps réel — le tout depuis leur smartphone.
          </p>
          <ul className="space-y-3 mb-8">
            {[
              "Galerie photos par catégorie",
              "Filtres : Halal, Végétarien, Sans gluten",
              "Détails : temps de préparation, allergènes, calories",
              "Promotions et offres spéciales intégrées",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                <div className="w-5 h-5 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-accent" />
                </div>
                {item}
              </li>
            ))}
          </ul>
          <a
            href={WA_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity"
          >
            Voir une démo
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="order-1 md:order-2 relative">
          <div className="rounded-3xl overflow-hidden shadow-xl border border-border aspect-[4/3] bg-muted">
            <img
              src="https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=700&h=520&fit=crop&auto=format"
              alt="Plats du restaurant"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs font-bold text-primary">Toujours à jour</p>
              <p className="text-[11px] text-muted-foreground">Modifiable à tout moment</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Pricing ───────────────────────────────────────────────────────────────────
function Pricing() {
  const plans = [
    {
      name: "Mensuel",
      price: "2 000",
      period: "/ mois",
      badge: null,
      desc: "Idéal pour tester QResto sans engagement.",
      features: [
        "Menu QR illimité",
        "Mises à jour en temps réel",
        "Support WhatsApp",
        "Multilingue (FR / AR / EN)",
      ],
      highlighted: false,
    },
    {
      name: "Annuel",
      price: "20 000",
      period: "/ an",
      badge: "2 mois offerts",
      desc: "Le meilleur rapport pour un établissement en place.",
      features: [
        "Tout ce qui est inclus dans le plan mensuel",
        "Équivalent à 1 666 DA / mois",
        "Facturation unique, plus simple",
        "Support prioritaire",
      ],
      highlighted: true,
    },
  ];

  return (
    <section id="pricing" className="bg-card py-24 border-y border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-accent text-sm font-bold tracking-widest uppercase mb-3">Tarifs</p>
          <h2 className="text-3xl lg:text-4xl font-semibold text-primary" style={DISPLAY_FONT}>
            Une offre simple, sans surprise
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Choisissez le rythme qui vous convient. Changez de formule à tout moment.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-2xl p-8 flex flex-col ${
                p.highlighted
                  ? "bg-primary text-primary-foreground shadow-xl scale-[1.02]"
                  : "bg-background border border-border shadow-sm"
              }`}
            >
              {p.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  {p.badge}
                </div>
              )}

              <h3
                className={`font-bold text-lg mb-1 ${p.highlighted ? "text-primary-foreground" : "text-primary"}`}
              >
                {p.name}
              </h3>
              <p
                className={`text-sm mb-6 ${p.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"}`}
              >
                {p.desc}
              </p>

              <div className="mb-6 flex items-baseline gap-1.5">
                <span className="text-4xl font-semibold" style={DISPLAY_FONT}>
                  {p.price}
                </span>
                <span className={`text-sm font-medium ${p.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  DA {p.period}
                </span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        p.highlighted ? "bg-white/15" : "bg-accent/15"
                      }`}
                    >
                      <Check className={`w-2.5 h-2.5 ${p.highlighted ? "text-white" : "text-accent"}`} />
                    </div>
                    <span className={p.highlighted ? "text-primary-foreground/90" : "text-foreground"}>{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href={WA_URL}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 ${
                  p.highlighted
                    ? "bg-white text-primary hover:bg-white/90"
                    : "bg-primary text-primary-foreground hover:opacity-90"
                }`}
              >
                Choisir {p.name.toLowerCase()}
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Contact CTA ───────────────────────────────────────────────────────────────
function ContactCTA() {
  return (
    <section
      id="contact"
      className="py-24"
      style={{ background: "linear-gradient(135deg,#2C1610 0%,#3D2010 60%,#1C0F08 100%)" }}
    >
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p className="text-accent text-sm font-bold tracking-widest uppercase mb-4">Passez à l'action</p>
        <h2 className="text-3xl lg:text-5xl font-semibold text-white mb-5 leading-tight" style={DISPLAY_FONT}>
          Prêt à digitaliser votre carte ?
        </h2>
        <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
          Contactez-nous directement sur WhatsApp. Nous répondons en moins d'une heure et vous guidons pas à pas.
        </p>

        <a
          href={WA_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#25D366] text-white font-bold text-lg hover:bg-[#1EBE5A] transition-all shadow-xl shadow-green-900/30 active:scale-95 mb-10"
        >
          <MessageCircle className="w-6 h-6" />
          Démarrer sur WhatsApp
        </a>

        <div className="flex flex-wrap justify-center gap-6 pt-8 border-t border-white/10">
          {[
            { icon: <Phone className="w-4 h-4" />,     label: "0771356474",            href: "tel:+213771356474" },
            { icon: <Mail className="w-4 h-4" />,      label: "qrestoalger@gmail.com", href: "mailto:qrestoalger@gmail.com" },
            { icon: <InstagramIcon className="w-4 h-4" />, label: "@qrestoalger",          href: "https://www.instagram.com/qrestoalger/" },
          ].map((c) => (
            <a
              key={c.label}
              href={c.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors"
            >
              {c.icon}
              {c.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const navigate = useNavigate();
  const navLinks = [
    { label: "Fonctionnalités", href: "#features" },
    { label: "Comment ça marche", href: "#how" },
    { label: "Tarifs", href: "#pricing" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <footer className="bg-[#120A07] border-t border-white/5 py-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <img src={logoImg} alt="QResto" className="w-7 h-7 object-contain opacity-80" />
          <span className="text-white/70 font-semibold" style={DISPLAY_FONT}>QResto</span>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-white/40 text-sm">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-white/70 transition-colors">
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4 text-white/40">
          <button
            onClick={() => navigate("/login")}
            className="hover:text-white/70 transition-colors text-sm font-medium flex items-center gap-1.5"
          >
            <LogIn className="w-4 h-4" />
            Connexion
          </button>
          <a href="https://www.instagram.com/qrestoalger/" target="_blank" rel="noreferrer" className="hover:text-white/70 transition-colors">
            <InstagramIcon className="w-5 h-5" />
          </a>
          <a href={WA_URL} target="_blank" rel="noreferrer" className="hover:text-white/70 transition-colors">
            <MessageCircle className="w-5 h-5" />
          </a>
        </div>
      </div>

      <div className="text-center mt-8 text-white/25 text-xs">
        © {new Date().getFullYear()} QResto · qrestodz.app · Tous droits réservés
      </div>
    </footer>
  );
}

// ── WhatsApp float ────────────────────────────────────────────────────────────
function WhatsAppFloat() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fn = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <a
      href={WA_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Contacter sur WhatsApp"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[#25D366] text-white font-bold rounded-full shadow-2xl shadow-green-900/40 transition-all duration-300 hover:bg-[#1EBE5A] hover:scale-105 active:scale-95 px-5 py-3.5 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <MessageCircle className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm hidden sm:block">WhatsApp</span>
    </a>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
function LandingPage() {
  return (
    <div className="landing-root min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Preview />
      <Pricing />
      <ContactCTA />
      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

export default LandingPage;