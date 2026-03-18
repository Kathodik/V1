import React from 'react';
import { Badge } from '../components/ui/badge';
import { AnimateOnScroll } from '../components/AnimateOnScroll';
import { useParallax } from '../hooks/useScrollAnimation';

const portfolioItems = [
  {
    id: 1,
    image: '/portfolio/IMG_5986.jpg',
    title: 'Chrom-Veredelung',
    subtitle: 'AEG Föhn-Gehäuse (80er Jahre)',
    metal: 'Chrom',
    metalSymbol: 'Cr',
    finish: 'Hochglanz',
    description: 'Restaurierung und Neuverchromung eines klassischen AEG Föhn-Gehäuses aus den 80er Jahren. Spiegelglanz-Finish bringt den Vintage-Charme zurück.',
    details: ['Restaurierung', 'Vintage 80er', 'Spiegelpoliert'],
    accentColor: '#c8ccd0',
  },
  {
    id: 2,
    image: '/portfolio/IMG_6660.jpg',
    title: 'Gold-Veredelung',
    subtitle: 'Panzerkette',
    metal: 'Gold',
    metalSymbol: 'Au',
    finish: 'Glanzgold',
    description: 'Gleichmäßige Vergoldung einer Cuban-Link-Kette. Warmer Goldton mit hoher Brillanz und perfekter Beschichtungsgleichmäßigkeit.',
    details: ['Gleichmäßige Schichtdicke', 'Warmer Goldton', 'Hochglanz-Finish'],
    accentColor: '#d4a800',
  },
  {
    id: 3,
    image: '/portfolio/IMG_5949.jpg',
    title: 'Roségold-Beschichtung',
    subtitle: 'Schmuckkollektion',
    metal: 'Gold',
    metalSymbol: 'Au',
    finish: 'Roségold',
    description: 'Feine Roségold-Galvanisierung einer Schmuckkollektion. Armbänder, Ringe und Perlenbesatz mit einheitlichem, warmem Roségold-Ton.',
    details: ['Roségold-Legierung', 'Schmuck-Qualität', 'Hypoallergen'],
    accentColor: '#c87860',
  },
  {
    id: 4,
    image: '/portfolio/IMG_7096.jpg',
    title: 'Vergoldung Präsentationsstück',
    subtitle: 'NIEDAX Firmenlogo',
    metal: 'Gold',
    metalSymbol: 'Au',
    finish: 'Spiegelgold',
    description: 'Premium-Vergoldung eines Firmen-Präsentationsstücks mit eingravierten Logos. Spiegelglatte, goldfarbene Oberfläche mit höchster Reflexion.',
    details: ['Gravur-kompatibel', 'Repräsentativ', 'Spiegelglanz'],
    accentColor: '#c8a000',
  },
  {
    id: 5,
    image: '/portfolio/IMG_6151.jpg',
    title: 'Zink-Veredelung',
    subtitle: 'Türbeschläge & Stangen',
    metal: 'Zink',
    metalSymbol: 'Zn',
    finish: 'Gelbchromatiert',
    description: 'Verzinkung und Gelbchromatierung von Türbeschlägen und Zierstangen. Gleichmäßige Zinkschicht mit gelbchromatierter Passivierung für langanhaltenden Korrosionsschutz.',
    details: ['Gelbchromatiert', 'Korrosionsschutz', 'Langlebig'],
    accentColor: '#b8a040',
  },
];

const References = () => {
  const scrollY = useParallax();

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative py-28 overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimateOnScroll variant="fadeUp" duration="slow">
            <div className="text-center">
              <p className="text-sm font-semibold tracking-[0.2em] uppercase text-[#2c7a7b] mb-4">
                Portfolio
              </p>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 mb-4"
                data-testid="references-heading"
              >
                Unsere <span className="text-[#2c7a7b]">Referenzen</span>
              </h1>
              <p className="text-lg text-slate-500 max-w-xl mx-auto">
                Echte Projekte, echte Ergebnisse – Galvanisierung auf höchstem Niveau
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Portfolio Grid – alternating large/small layout */}
      <section className="pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-20">
            {portfolioItems.map((item, index) => {
              const isEven = index % 2 === 0;
              return (
                <AnimateOnScroll
                  key={item.id}
                  variant={isEven ? 'fadeRight' : 'fadeLeft'}
                  duration="slow"
                >
                  <div
                    className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
                      !isEven ? 'lg:grid-flow-dense' : ''
                    }`}
                  >
                    {/* Image */}
                    <div className={`${!isEven ? 'lg:col-start-2' : ''}`}>
                      <div className="relative group overflow-hidden rounded-2xl">
                        <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            data-testid={`portfolio-image-${item.id}`}
                          />
                        </div>
                        {/* Overlay gradient on hover */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        {/* Metal badge overlay */}
                        <div className="absolute top-4 left-4">
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center backdrop-blur-md border border-white/30 shadow-lg"
                            style={{
                              background: `linear-gradient(135deg, ${item.accentColor}ee, ${item.accentColor}aa)`,
                            }}
                          >
                            <span className="text-lg font-black text-white drop-shadow-md">
                              {item.metalSymbol}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className={`${!isEven ? 'lg:col-start-1' : ''}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <Badge
                          className="border-0 text-xs font-semibold px-3 py-1"
                          style={{
                            backgroundColor: `${item.accentColor}18`,
                            color: item.accentColor,
                          }}
                        >
                          {item.metal}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-xs border-slate-200 text-slate-500"
                        >
                          {item.finish}
                        </Badge>
                      </div>

                      <h3 className="text-3xl font-bold text-slate-800 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm font-semibold tracking-[0.1em] uppercase text-[#2c7a7b] mb-5">
                        {item.subtitle}
                      </p>
                      <p className="text-slate-500 leading-relaxed mb-6 text-base">
                        {item.description}
                      </p>

                      {/* Detail tags */}
                      <div className="flex flex-wrap gap-2">
                        {item.details.map((detail, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200"
                          >
                            {detail}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </AnimateOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* Owner Section */}
      <section className="relative py-20 mt-12 overflow-hidden grain-overlay">
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
                Mit jahrelanger Erfahrung in der Galvanotechnik biete ich professionelle
                Lohngalvanisierung für anspruchsvolle Projekte – vom Schmuckstück bis zum
                Industrie-Bauteil. Qualität und Zuverlässigkeit stehen bei Kathodik an erster Stelle.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
};

export default References;
