import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers, Atom, CheckCircle2, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { services } from '../data/mockData';

const iconMap = {
  Layers: Layers,
  Atom: Atom,
  CheckCircle2: CheckCircle2,
  Zap: Zap
};

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Clean Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-white">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-72 h-72 bg-[#2c7a7b]/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#2c7a7b]/10 rounded-full blur-3xl"></div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8 inline-block">
              <img 
                src="https://customer-assets.emergentagent.com/job_metal-coating/artifacts/4mzqxaj5_A80F545A-F543-476F-BF3A-7169BDADA022.png" 
                alt="Kathodik" 
                className="h-32 w-auto mx-auto"
              />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-slate-800 mb-6 leading-tight">
              Präzise <span className="text-[#2c7a7b]">Galvanotechnik</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 mb-8 leading-relaxed">
              Ihr Partner für professionelle Lohngalvanisierung. Hochwertige Metallbeschichtungen für Ihre Produkte.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/services">
                <Button size="lg" className="bg-[#2c7a7b] hover:bg-[#285e61] text-white px-8 py-6 text-lg shadow-lg transition-all duration-300 hover:scale-105">
                  Metall auswählen
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-2 border-[#2c7a7b] text-[#2c7a7b] hover:bg-[#2c7a7b]/10 px-8 py-6 text-lg transition-all duration-300 hover:scale-105">
                  Kontakt aufnehmen
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-[#2c7a7b]/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-[#2c7a7b] rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              Unsere <span className="text-[#2c7a7b]">Dienstleistungen</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Von der Auswahl des richtigen Metalls bis zur fertigen Beschichtung
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => {
              const Icon = iconMap[service.icon];
              return (
                <Card 
                  key={index} 
                  className="bg-white border-slate-200 hover:border-[#2c7a7b] transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <CardContent className="p-6">
                    <div className="w-14 h-14 bg-[#2c7a7b]/10 rounded-xl flex items-center justify-center mb-4">
                      <Icon className="h-7 w-7 text-[#2c7a7b]" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 mb-3">{service.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{service.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
                Warum <span className="text-[#2c7a7b]">Kathodik</span>?
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Als mobiler Galvanikbetrieb bieten wir Ihnen flexible und professionelle Lösungen für Ihre Beschichtungsanforderungen.
              </p>
              <ul className="space-y-4">
                {[
                  'Breite Auswahl an Galvanisierungsmetallen',
                  'Präzise Beschichtung bis max. 40 x 60 x 160 cm',
                  'Kostenloser Versand (Porto von uns bezahlt)',
                  'Persönlicher Service und Beratung',
                  'Dokumentierte Qualitätskontrolle'
                ].map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle2 className="h-6 w-6 text-[#2c7a7b] flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 text-lg">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-[#2c7a7b]/10 to-[#2c7a7b]/5 rounded-3xl border-2 border-[#2c7a7b]/20 p-8 flex items-center justify-center">
                <img 
                  src="https://customer-assets.emergentagent.com/job_metal-coating/artifacts/4mzqxaj5_A80F545A-F543-476F-BF3A-7169BDADA022.png" 
                  alt="Kathodik Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#2c7a7b]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Bereit für Ihr Projekt?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Wählen Sie Ihr gewünschtes Metall aus unserem Periodensystem und starten Sie Ihre Anfrage.
          </p>
          <Link to="/services">
            <Button size="lg" className="bg-white text-[#2c7a7b] hover:bg-slate-100 px-8 py-6 text-lg shadow-xl transition-all duration-300 hover:scale-105">
              Jetzt Metall auswählen
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
