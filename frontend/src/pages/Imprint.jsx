import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { AnimateOnScroll } from '../components/AnimateOnScroll';
import { companyInfo } from '../data/mockData';

const Imprint = () => {
  const sections = [
    {
      title: 'Angaben gemäß § 5 TMG',
      content: (
        <div className="space-y-2 text-slate-600">
          <p className="text-xl font-semibold text-[#2c7a7b]">{companyInfo.name}</p>
          <p>{companyInfo.legalForm}</p>
          <p className="mt-4">{companyInfo.address}<br />{companyInfo.city}</p>
        </div>
      )
    },
    {
      title: 'Vertreten durch',
      content: (
        <p className="text-slate-600">Inhaber: <span className="text-[#2c7a7b] font-semibold">{companyInfo.owner}</span></p>
      )
    },
    {
      title: 'Kontakt',
      content: (
        <div className="space-y-2 text-slate-600">
          <p>Telefon: <a href={`tel:${companyInfo.phone}`} className="text-[#2c7a7b] hover:underline">{companyInfo.phone}</a></p>
          <p>E-Mail: <a href={`mailto:${companyInfo.email}`} className="text-[#2c7a7b] hover:underline">{companyInfo.email}</a></p>
        </div>
      )
    },
    {
      title: 'Umsatzsteuer-ID',
      content: <p className="text-slate-600">Als Kleinunternehmer im Sinne von § 19 Abs. 1 UStG wird keine Umsatzsteuer berechnet.</p>
    },
    {
      title: 'Streitschlichtung',
      content: (
        <p className="text-slate-600 leading-relaxed">
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
      )
    },
    {
      title: 'Haftung für Inhalte',
      content: (
        <p className="text-slate-600 leading-relaxed">
          Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den
          allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht
          verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu
          forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
        </p>
      )
    },
    {
      title: 'Haftung für Links',
      content: (
        <p className="text-slate-600 leading-relaxed">
          Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben.
          Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der
          verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
        </p>
      )
    },
    {
      title: 'Urheberrecht',
      content: (
        <p className="text-slate-600 leading-relaxed">
          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem
          deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung
          außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors
          bzw. Erstellers.
        </p>
      )
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimateOnScroll variant="fadeUp" duration="slow">
            <div className="text-center">
              <p className="text-sm font-semibold tracking-[0.2em] uppercase text-[#2c7a7b] mb-4">
                Rechtliches
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-800" data-testid="imprint-heading">
                Impressum
              </h1>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {sections.map((section, index) => (
              <AnimateOnScroll key={index} variant="fadeUp" duration="normal" delay={index * 60}>
                <Card className="bg-white border border-slate-200 hover:border-slate-300 transition-colors">
                  <CardContent className="p-8">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100">
                      {section.title}
                    </h2>
                    {section.content}
                  </CardContent>
                </Card>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Imprint;
