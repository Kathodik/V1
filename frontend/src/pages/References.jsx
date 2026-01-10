import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { references } from '../data/mockData';

const References = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Unsere <span className="text-[#2c7a7b]">Referenzen</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Ausgewählte Projekte und erfolgreiche Galvanisierungen
          </p>
        </div>

        {/* Reference Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {references.map((ref) => (
            <Card key={ref.id} className="bg-slate-800/50 border-slate-700 overflow-hidden hover:border-teal-500/50 transition-all duration-300">
              <CardContent className="p-0">
                <div className="grid grid-cols-2 gap-2 p-4 bg-slate-900">
                  <div>
                    <p className="text-xs text-slate-400 mb-2 text-center">Vorher</p>
                    <div className="aspect-square bg-slate-800 rounded-lg overflow-hidden">
                      <img src={ref.before} alt="Vorher" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-2 text-center">Nachher</p>
                    <div className="aspect-square bg-slate-800 rounded-lg overflow-hidden border-2 border-teal-500/30">
                      <img src={ref.after} alt="Nachher" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-white">{ref.title}</h3>
                    <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/50">
                      {ref.metal}
                    </Badge>
                  </div>
                  <p className="text-slate-400">{ref.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Team Section */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">
                Ihr Ansprechpartner
              </h2>
              <p className="text-slate-400">Hannes Barfuß - Inhaber</p>
            </div>
            <div className="max-w-md mx-auto bg-slate-900 rounded-xl p-6 border border-slate-700">
              <div className="aspect-video bg-slate-800 rounded-lg mb-4 flex items-center justify-center">
                <img 
                  src="https://customer-assets.emergentagent.com/job_metal-coating/artifacts/4mzqxaj5_A80F545A-F543-476F-BF3A-7169BDADA022.png" 
                  alt="Kathodik" 
                  className="w-32 h-32 object-contain opacity-50"
                />
              </div>
              <p className="text-slate-400 text-center leading-relaxed">
                Mit jahrelanger Erfahrung in der Galvanotechnik und als mobiler Betrieb biete ich Ihnen 
                professionelle Lohngalvanisierung direkt vor Ort. Qualität und Zuverlässigkeit stehen bei 
                Kathodik an erster Stelle.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Company Vehicle Info */}
        <Card className="bg-gradient-to-r from-teal-600/20 to-cyan-600/20 border-teal-500/30">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-3">
              Mobiler Galvanikbetrieb
            </h3>
            <p className="text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Unser Firmentransporter ist unsere Hauptbetriebsstätte und ermöglicht uns, 
              flexibel und professionell für Sie da zu sein. Wir kommen zu Ihnen!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default References;
