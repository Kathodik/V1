import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { AnimateOnScroll } from '../components/AnimateOnScroll';
import { useParallax } from '../hooks/useScrollAnimation';
import { references } from '../data/mockData';

const References = () => {
  const scrollY = useParallax();

  return (
    <div className="bg-white">
      {/* Hero banner */}
      <section className="relative py-28 overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        />
        <div
          className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #2c7a7b 0%, transparent 70%)' }}
        />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimateOnScroll variant="fadeUp" duration="slow">
            <div className="text-center">
              <p className="text-sm font-semibold tracking-[0.2em] uppercase text-[#2c7a7b] mb-4">
                Portfolio
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 mb-4" data-testid="references-heading">
                Unsere <span className="text-[#2c7a7b]">Referenzen</span>
              </h1>
              <p className="text-lg text-slate-500 max-w-xl mx-auto">
                Ausgewählte Projekte und erfolgreiche Galvanisierungen
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Reference Grid */}
      <section className="pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
            {references.map((ref, index) => (
              <AnimateOnScroll key={ref.id} variant="fadeUp" duration="normal" delay={index * 120}>
                <Card className="bg-white border border-slate-200 overflow-hidden hover:border-[#2c7a7b]/40 transition-all duration-500 hover:shadow-xl group">
                  <CardContent className="p-0">
                    <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50">
                      <div>
                        <p className="text-xs text-slate-500 mb-2 text-center font-semibold tracking-wider uppercase">
                          Vorher
                        </p>
                        <div className="aspect-square bg-slate-200 rounded-lg overflow-hidden">
                          <img
                            src={ref.before}
                            alt="Vorher"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-[#2c7a7b] mb-2 text-center font-semibold tracking-wider uppercase">
                          Nachher
                        </p>
                        <div className="aspect-square bg-slate-200 rounded-lg overflow-hidden border-2 border-[#2c7a7b]/30">
                          <img
                            src={ref.after}
                            alt="Nachher"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-semibold text-slate-800">{ref.title}</h3>
                        <Badge className="bg-[#2c7a7b]/10 text-[#2c7a7b] border-[#2c7a7b]/30">
                          {ref.metal}
                        </Badge>
                      </div>
                      <p className="text-slate-500 text-sm leading-relaxed">{ref.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Team / Owner Section */}
      <section className="relative py-20 overflow-hidden grain-overlay">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2c7a7b] via-[#285e61] to-[#1a4e50]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimateOnScroll variant="fadeUp" duration="slow">
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-white/60 text-sm font-semibold tracking-[0.3em] uppercase mb-4">
                Ihr Ansprechpartner
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                Hannes Barfuß
              </h2>
              <p className="text-white/70 text-lg mb-2">Inhaber, Kathodik</p>
              <div className="w-20 h-1 bg-white/30 rounded-full mx-auto my-8" />
              <p className="text-white/80 leading-relaxed text-lg">
                Mit jahrelanger Erfahrung in der Galvanotechnik und als mobiler Betrieb biete ich Ihnen
                professionelle Lohngalvanisierung. Qualität und Zuverlässigkeit stehen bei
                Kathodik an erster Stelle.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Mobile Business Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll variant="fadeUp" duration="slow">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-sm font-semibold tracking-[0.2em] uppercase text-[#2c7a7b] mb-4">
                Flexibel & Professionell
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-6">
                Mobiler Galvanikbetrieb
              </h2>
              <p className="text-lg text-slate-500 leading-relaxed">
                Unser Firmentransporter ist unsere Hauptbetriebsstätte und ermöglicht uns,
                flexibel und professionell für Sie da zu sein. Wir kommen zu Ihnen!
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
};

export default References;
