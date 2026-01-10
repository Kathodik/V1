import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { companyInfo } from '../data/mockData';

const Imprint = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              Impressum
            </h1>
          </div>

          <Card className="bg-white border-slate-300">
            <CardContent className="p-8 space-y-8">
              {/* Company Info */}
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b-2 border-slate-300">
                  Angaben gemäß § 5 TMG
                </h2>
                <div className="space-y-2 text-slate-700">
                  <p className="text-xl font-semibold text-[#2c7a7b]">{companyInfo.name}</p>
                  <p>{companyInfo.legalForm}</p>
                  <p className="mt-4">
                    {companyInfo.address}<br />
                    {companyInfo.city}
                  </p>
                </div>
              </div>

              {/* Owner */}
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b-2 border-slate-300">
                  Vertreten durch
                </h2>
                <p className="text-slate-700">
                  Inhaber: <span className="text-[#2c7a7b] font-semibold">{companyInfo.owner}</span>
                </p>
              </div>

              {/* Contact */}
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b-2 border-slate-300">
                  Kontakt
                </h2>
                <div className="space-y-2 text-slate-700">
                  <p>
                    Telefon: <a href={`tel:${companyInfo.phone}`} className="text-[#2c7a7b] hover:underline">{companyInfo.phone}</a>
                  </p>
                  <p>
                    E-Mail: <a href={`mailto:${companyInfo.email}`} className="text-[#2c7a7b] hover:underline">{companyInfo.email}</a>
                  </p>
                </div>
              </div>

              {/* Steuer */}
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b-2 border-slate-300">
                  Umsatzsteuer-ID
                </h2>
                <p className="text-slate-700">
                  Als Kleinunternehmer im Sinne von § 19 Abs. 1 UStG wird keine Umsatzsteuer berechnet.
                </p>
              </div>

              {/* Streitschlichtung */}
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b-2 border-slate-300">
                  Streitschlichtung
                </h2>
                <p className="text-slate-700 leading-relaxed">
                  Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
                  <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-[#2c7a7b] hover:underline ml-1">
                    https://ec.europa.eu/consumers/odr/
                  </a>
                  <br /><br />
                  Unsere E-Mail-Adresse finden Sie oben im Impressum.
                  <br /><br />
                  Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer 
                  Verbraucherschlichtungsstelle teilzunehmen.
                </p>
              </div>

              {/* Haftung Content */}
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b-2 border-slate-300">
                  Haftung für Inhalte
                </h2>
                <p className="text-slate-700 leading-relaxed">
                  Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den 
                  allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht 
                  verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu 
                  forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
                </p>
              </div>

              {/* Haftung Links */}
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b-2 border-slate-300">
                  Haftung für Links
                </h2>
                <p className="text-slate-700 leading-relaxed">
                  Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. 
                  Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der 
                  verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
                </p>
              </div>

              {/* Urheberrecht */}
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b-2 border-slate-300">
                  Urheberrecht
                </h2>
                <p className="text-slate-700 leading-relaxed">
                  Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem 
                  deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung 
                  außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors 
                  bzw. Erstellers.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Imprint;
