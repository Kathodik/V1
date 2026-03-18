import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Atom, CheckCircle2, Zap, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { AnimateOnScroll } from '../components/AnimateOnScroll';
import { useParallax } from '../hooks/useScrollAnimation';
import { services } from '../data/mockData';

const iconMap = {
  Layers: Layers,
  Atom: Atom,
  CheckCircle2: CheckCircle2,
  Zap: Zap
};

const Home = () => {
  const scrollY = useParallax();

  return (
    <div className="bg-white">
      {/* Hero Section - Full viewport, cinematic */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Parallax background layers */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-white"
            style={{ transform: `translateY(${scrollY * 0.15}px)` }}
          />
          <div
            className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full opacity-[0.07]"
            style={{
              background: 'radial-gradient(circle, #2c7a7b 0%, transparent 70%)',
              transform: `translate(${-100 + scrollY * 0.05}px, ${-100 + scrollY * 0.08}px)`,
            }}
          />
          <div
            className="absolute bottom-0 right-0 w-[800px] h-[800px] rounded-full opacity-[0.05]"
            style={{
              background: 'radial-gradient(circle, #2c7a7b 0%, transparent 70%)',
              transform: `translate(${100 - scrollY * 0.03}px, ${100 - scrollY * 0.06}px)`,
            }}
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-10 hero-reveal">
              <img
                src="https://customer-assets.emergentagent.com/job_metal-coating/artifacts/4mzqxaj5_A80F545A-F543-476F-BF3A-7169BDADA022.png"
                alt="Kathodik"
                className="h-28 w-auto mx-auto"
                style={{ transform: `translateY(${scrollY * -0.1}px)` }}
              />
            </div>
            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-800 mb-8 leading-[1.1] tracking-tight hero-reveal hero-reveal-delay-1"
              data-testid="hero-heading"
            >
              <span className="text-[#2c7a7b]">Kathodik.</span>{' '}
              <span className="block mt-2">Weil Ihr Lieblingsstück</span>
              <span className="block">die Kathode ist.</span>
            </h1>
            <p
              className="text-lg sm:text-xl text-slate-500 mb-12 leading-relaxed max-w-2xl mx-auto font-medium hero-reveal hero-reveal-delay-2"
              data-testid="hero-subline"
            >
              Wir schauen, was sich machen lässt –
              <br />
              und liefern, was sich sehen lässt.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center hero-reveal hero-reveal-delay-3">
              <Link to="/services">
                <Button
                  size="lg"
                  className="bg-[#2c7a7b] hover:bg-[#285e61] text-white px-10 py-6 text-base rounded-full shadow-lg shadow-[#2c7a7b]/20 hover:shadow-xl hover:shadow-[#2c7a7b]/30 transition-all duration-300"
                  data-testid="hero-services-btn"
                >
                  Metall auswählen
                </Button>
              </Link>
              <Link to="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-slate-300 text-slate-700 hover:border-[#2c7a7b] hover:text-[#2c7a7b] px-10 py-6 text-base rounded-full transition-all duration-300"
                  data-testid="hero-contact-btn"
                >
                  Kontakt aufnehmen
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 hero-reveal hero-reveal-delay-4 cursor-pointer"
          onClick={() => document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <ChevronDown className="h-6 w-6 text-slate-400 animate-bounce" />
        </div>

        {/* Bottom gradient fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </section>

      {/* Services Section */}
      <section id="services-section" className="py-28 bg-white relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll variant="fadeUp" duration="slow">
            <div className="text-center mb-20">
              <p className="text-sm font-semibold tracking-[0.2em] uppercase text-[#2c7a7b] mb-4">
                Was wir bieten
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold text-slate-800 leading-tight">
                Unsere Dienstleistungen
              </h2>
            </div>
          </AnimateOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => {
              const Icon = iconMap[service.icon];
              return (
                <AnimateOnScroll
                  key={index}
                  variant="fadeUp"
                  duration="normal"
                  delay={index * 120}
                >
                  <Card className="bg-white border border-slate-200 hover:border-[#2c7a7b]/40 transition-all duration-500 hover:shadow-xl hover:shadow-[#2c7a7b]/5 group h-full">
                    <CardContent className="p-8">
                      <div className="w-14 h-14 bg-slate-50 group-hover:bg-[#2c7a7b]/10 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-500">
                        <Icon className="h-7 w-7 text-[#2c7a7b]" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-800 mb-3">
                        {service.title}
                      </h3>
                      <p className="text-slate-500 leading-relaxed text-sm">
                        {service.description}
                      </p>
                    </CardContent>
                  </Card>
                </AnimateOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* Full-width image/brand section with parallax */}
      <section className="relative h-[60vh] min-h-[400px] overflow-hidden grain-overlay">
        <div
          className="absolute inset-0 bg-[#2c7a7b]"
          style={{ transform: `translateY(${(scrollY - 800) * 0.08}px)` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#2c7a7b] via-[#285e61] to-[#1a4e50]" />
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 border border-white/20 rounded-full" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 border border-white/10 rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/5 rounded-full" />
          </div>
        </div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <AnimateOnScroll variant="scaleUp" duration="slow">
            <div className="text-center px-4">
              <p className="text-white/60 text-sm font-semibold tracking-[0.3em] uppercase mb-6">
                Seit Generationen
              </p>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Präzision trifft
                <br />
                Leidenschaft
              </h2>
              <p className="text-white/70 text-lg max-w-xl mx-auto">
                Professionelle Galvanotechnik für anspruchsvolle Projekte – von der Einzelanfertigung bis zur Serie.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Features / Why Kathodik section */}
      <section className="py-28 bg-white relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center max-w-6xl mx-auto">
            <AnimateOnScroll variant="fadeRight" duration="slow">
              <div>
                <p className="text-sm font-semibold tracking-[0.2em] uppercase text-[#2c7a7b] mb-4">
                  Ihre Vorteile
                </p>
                <h2 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-8 leading-tight">
                  Warum Kathodik?
                </h2>
                <p className="text-lg text-slate-500 mb-10 leading-relaxed">
                  Als mobiler Galvanikbetrieb bieten wir Ihnen flexible und professionelle Lösungen für Ihre Beschichtungsanforderungen.
                </p>
                <ul className="space-y-5">
                  {[
                    'Breite Auswahl an 12 Galvanisierungsmetallen',
                    'Präzise Beschichtung bis max. 40 x 60 x 160 cm',
                    'Kostenloser Versand – Porto übernehmen wir',
                    'Persönlicher Service und Fachberatung',
                    'Dokumentierte Qualitätskontrolle',
                  ].map((feature, index) => (
                    <AnimateOnScroll
                      key={index}
                      variant="fadeUp"
                      delay={index * 80}
                    >
                      <li className="flex items-start space-x-4">
                        <div className="w-6 h-6 rounded-full bg-[#2c7a7b]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle2 className="h-4 w-4 text-[#2c7a7b]" />
                        </div>
                        <span className="text-slate-600 text-base">{feature}</span>
                      </li>
                    </AnimateOnScroll>
                  ))}
                </ul>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll variant="fadeLeft" duration="slow" delay={200}>
              <div className="relative">
                <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-[#2c7a7b]/5 to-[#2c7a7b]/10 border border-[#2c7a7b]/10 flex items-center justify-center">
                  <img
                    src="https://customer-assets.emergentagent.com/job_metal-coating/artifacts/4mzqxaj5_A80F545A-F543-476F-BF3A-7169BDADA022.png"
                    alt="Kathodik Logo"
                    className="w-3/4 h-3/4 object-contain opacity-80"
                    style={{ transform: `translateY(${(scrollY - 1600) * -0.04}px)` }}
                  />
                </div>
                {/* Floating accent */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-2xl bg-[#2c7a7b] opacity-10" />
                <div className="absolute -top-4 -left-4 w-16 h-16 rounded-xl bg-[#2c7a7b] opacity-10" />
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Metals preview strip */}
      <section className="py-20 bg-slate-50 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll variant="fadeUp" duration="slow">
            <div className="text-center mb-16">
              <p className="text-sm font-semibold tracking-[0.2em] uppercase text-[#2c7a7b] mb-4">
                12 Metalle
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-4">
                Unser Periodensystem
              </h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">
                Von Chrom bis Gold – wählen Sie die perfekte Beschichtung für Ihr Projekt
              </p>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fadeUp" duration="slow" delay={150}>
            <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto mb-12">
              {['Cr', 'Co', 'Ni', 'Cu', 'Zn', 'Ru', 'Rh', 'Pd', 'Ag', 'Sn', 'Pt', 'Au'].map(
                (symbol, i) => (
                  <div
                    key={symbol}
                    className="w-14 h-14 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm shadow-sm hover:border-[#2c7a7b] hover:text-[#2c7a7b] hover:shadow-md transition-all duration-300 cursor-default"
                  >
                    {symbol}
                  </div>
                )
              )}
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fadeUp" delay={300}>
            <div className="text-center">
              <Link to="/services">
                <Button
                  size="lg"
                  className="bg-[#2c7a7b] hover:bg-[#285e61] text-white px-10 py-6 text-base rounded-full shadow-lg shadow-[#2c7a7b]/20"
                  data-testid="metals-cta-btn"
                >
                  Alle Metalle entdecken
                </Button>
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-32 overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          style={{ transform: `translateY(${(scrollY - 3000) * 0.05}px)` }}
        />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full border border-[#2c7a7b]/30" />
          <div className="absolute bottom-1/3 left-1/4 w-48 h-48 rounded-full border border-[#2c7a7b]/20" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimateOnScroll variant="fadeUp" duration="slow">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
                Bereit für Ihr Projekt?
              </h2>
              <p className="text-xl text-white/60 mb-10 leading-relaxed">
                Wählen Sie Ihr Metall, beschreiben Sie Ihr Projekt, und wir kümmern uns um den Rest.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/services">
                  <Button
                    size="lg"
                    className="bg-[#2c7a7b] hover:bg-[#4fd1c5] text-white px-10 py-6 text-base rounded-full shadow-lg transition-all duration-300"
                    data-testid="cta-services-btn"
                  >
                    Jetzt Metall auswählen
                  </Button>
                </Link>
                <Link to="/3d-configurator">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white/30 text-white hover:bg-white/10 px-10 py-6 text-base rounded-full transition-all duration-300"
                    data-testid="cta-configurator-btn"
                  >
                    3D-Konfigurator starten
                  </Button>
                </Link>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
};

export default Home;
