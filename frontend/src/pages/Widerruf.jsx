import React from 'react';
import { Button } from '../components/ui/button';
import { Download, FileText, AlertCircle } from 'lucide-react';
import { AnimateOnScroll } from '../components/AnimateOnScroll';
import { useParallax } from '../hooks/useScrollAnimation';

const PDF_URL = 'https://customer-assets.emergentagent.com/job_46881bec-8eb9-4794-935a-8a25c0642f1f/artifacts/jg08x399_Widerrufsformular_Kathodik_Aptos.pdf';

const Widerruf = () => {
  const scrollY = useParallax();

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white" style={{ transform: `translateY(${scrollY * 0.1}px)` }} />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimateOnScroll variant="fadeUp" duration="slow">
            <div className="text-center">
              <p className="text-sm font-semibold tracking-[0.2em] uppercase text-[#2c7a7b] mb-4">Rechtliches</p>
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-4" data-testid="widerruf-heading">
                Widerrufsbelehrung
              </h1>
              <p className="text-lg text-slate-500 max-w-xl mx-auto">
                Kathodik – Galvanotechnik | Hannes Barfuß
              </p>
              <p className="text-sm text-slate-400 mt-2">Stand: Mai 2026</p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-12">

            {/* Widerrufsrecht */}
            <AnimateOnScroll variant="fadeUp">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-5 pb-2 border-b border-slate-200">
                  Widerrufsbelehrung für Verbraucher
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-[#2c7a7b] mb-2">Widerrufsrecht</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag
                      zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsschlusses.
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed mt-3">
                      Um Ihr Widerrufsrecht auszuüben, müssen Sie uns
                      (Kathodik – Galvanotechnik | Hannes Barfuß, Gartenstraße 70, 53547 Kasbach-Ohlenberg,
                      E-Mail: <a href="mailto:service@kathodik.com" className="text-[#2c7a7b] font-semibold underline">service@kathodik.com</a>)
                      mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder
                      eine E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#2c7a7b] mb-2">Folgen des Widerrufs</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen
                      erhalten haben, unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag
                      zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns
                      eingegangen ist.
                    </p>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>

            {/* Wichtiger Hinweis */}
            <AnimateOnScroll variant="fadeUp">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 flex items-start gap-4" data-testid="widerruf-erloeschen">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-amber-900 mb-2">
                    Wichtiger Hinweis zum vorzeitigen Erlöschen des Widerrufsrechts
                  </h3>
                  <p className="text-sm text-amber-900/90 leading-relaxed">
                    Ihr Widerrufsrecht erlischt bei einem Vertrag zur Erbringung von Dienstleistungen
                    vorzeitig, wenn wir mit der Ausführung der Dienstleistung erst begonnen haben,
                    nachdem Sie dazu Ihre ausdrückliche Zustimmung gegeben und gleichzeitig Ihre
                    Kenntnis davon bestätigt haben, dass Sie Ihr Widerrufsrecht bei vollständiger
                    Vertragserfüllung durch uns verlieren.
                  </p>
                </div>
              </div>
            </AnimateOnScroll>

            {/* Ausschluss */}
            <AnimateOnScroll variant="fadeUp">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 flex items-start gap-4" data-testid="widerruf-ausschluss">
                <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-slate-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 mb-2">
                    Ausschluss des Widerrufsrechts
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Das Widerrufsrecht besteht nicht bei Verträgen zur Lieferung von Waren, die nicht
                    vorgefertigt sind und für deren Herstellung eine individuelle Auswahl oder Bestimmung
                    durch den Verbraucher maßgeblich ist oder die eindeutig auf die persönlichen
                    Bedürfnisse des Verbrauchers zugeschnitten sind (z. B. individuelle
                    Oberflächenveredelungen nach spezifischen Kundenwünschen).
                  </p>
                </div>
              </div>
            </AnimateOnScroll>

            {/* Muster-Widerrufsformular */}
            <AnimateOnScroll variant="fadeUp">
              <div className="rounded-2xl border border-[#2c7a7b]/20 bg-gradient-to-br from-[#2c7a7b]/[0.03] to-white p-7 sm:p-9 shadow-sm" data-testid="widerrufs-formular">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#2c7a7b]/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-6 w-6 text-[#2c7a7b]" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">
                      Muster-Widerrufsformular
                    </h2>
                    <p className="text-sm text-slate-500">
                      Zum Ausdrucken und postalisch oder per E-Mail zurücksenden.
                    </p>
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed mb-5">
                  Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus
                  und senden Sie es an uns zurück.
                </p>

                <div className="space-y-5 bg-white rounded-xl border border-slate-200 p-6">
                  <div>
                    <p className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-1">An</p>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      Kathodik – Galvanotechnik<br />
                      Hannes Barfuß<br />
                      Gartenstraße 70<br />
                      D-53547 Kasbach-Ohlenberg<br />
                      E-Mail: <a href="mailto:service@kathodik.com" className="text-[#2c7a7b] font-semibold underline">service@kathodik.com</a>
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      Hiermit widerrufe(n) ich/wir <span className="text-slate-400">(*)</span> den von mir/uns <span className="text-slate-400">(*)</span> abgeschlossenen Vertrag über die Erbringung der folgenden Dienstleistung / die Lieferung der folgenden Waren <span className="text-slate-400">(*)</span>:
                    </p>
                    <div className="mt-3 border-b border-dashed border-slate-300 h-6" />
                    <div className="mt-2 border-b border-dashed border-slate-300 h-6" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-1">Bestellt am <span className="text-slate-400 normal-case">(*)</span></p>
                      <div className="border-b border-dashed border-slate-300 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-1">Erhalten am <span className="text-slate-400 normal-case">(*)</span></p>
                      <div className="border-b border-dashed border-slate-300 h-6" />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-1">Name des/der Verbraucher(s)</p>
                    <div className="border-b border-dashed border-slate-300 h-6" />
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-1">Anschrift des/der Verbraucher(s)</p>
                    <div className="border-b border-dashed border-slate-300 h-6" />
                    <div className="mt-2 border-b border-dashed border-slate-300 h-6" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-1">Datum</p>
                      <div className="border-b border-dashed border-slate-300 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-1">Unterschrift des/der Verbraucher(s)</p>
                      <div className="border-b border-dashed border-slate-300 h-6" />
                      <p className="text-[10px] text-slate-400 mt-1">(nur bei Mitteilung auf Papier)</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 pt-3 border-t border-slate-100">(*) Unzutreffendes streichen.</p>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <a href={PDF_URL} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button className="w-full bg-[#2c7a7b] hover:bg-[#285e61] text-white rounded-full py-6" data-testid="download-widerrufs-pdf">
                      <Download className="h-4 w-4 mr-2" /> Widerrufsformular als PDF herunterladen
                    </Button>
                  </a>
                  <a href="mailto:service@kathodik.com?subject=Widerruf&body=Hiermit%20widerrufe%20ich%20den%20abgeschlossenen%20Vertrag.%0A%0ABestellt%20am%3A%20%0AErhalten%20am%3A%20%0AName%3A%20%0AAnschrift%3A%20%0ADatum%3A%20" className="flex-1">
                    <Button variant="outline" className="w-full rounded-full py-6 border-slate-300" data-testid="email-widerruf">
                      Per E-Mail widerrufen
                    </Button>
                  </a>
                </div>
              </div>
            </AnimateOnScroll>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Widerruf;
