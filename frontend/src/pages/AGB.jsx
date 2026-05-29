import React from 'react';
import { AnimateOnScroll } from '../components/AnimateOnScroll';
import { useParallax } from '../hooks/useScrollAnimation';
import { Phone, Mail, MapPin, User } from 'lucide-react';

const Section = ({ number, title, children, highlight = false }) => (
  <AnimateOnScroll variant="fadeUp">
    <div className="mb-10">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-5 pb-2 border-b border-slate-200">
        <span className="text-[#2c7a7b] mr-2">{number}.</span>{title}
      </h2>
      <div className={`text-sm text-slate-600 leading-relaxed space-y-3 ${highlight ? 'bg-amber-50/60 border border-amber-200 rounded-2xl p-5 sm:p-6' : ''}`}>
        {children}
      </div>
    </div>
  </AnimateOnScroll>
);

const Clause = ({ id, children }) => (
  <p>
    <span className="font-semibold text-slate-800 mr-1.5">{id}</span>
    {children}
  </p>
);

const AGB = () => {
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
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-4" data-testid="agb-heading">
                Allgemeine Geschäftsbedingungen
              </h1>
              <p className="text-lg text-slate-500 max-w-xl mx-auto">
                & Haftungsausschluss
              </p>
              <p className="text-sm text-slate-400 mt-2">Stand: Mai 2026</p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Company info card */}
      <section className="pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <AnimateOnScroll variant="fadeUp">
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 sm:p-7">
                <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#2c7a7b] mb-3">Auftragnehmer</p>
                <h3 className="text-xl font-bold text-slate-800 mb-1">Kathodik – Galvanotechnik</h3>
                <p className="text-sm text-slate-500 mb-5">Kathodik – Oberflächenveredelung</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-[#2c7a7b] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Geschäftsführer</p>
                      <p className="text-slate-700 font-medium">Hannes Barfuß</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-[#2c7a7b] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Telefon</p>
                      <a href="tel:+491626431168" className="text-slate-700 font-medium hover:text-[#2c7a7b]">+49 162 6431168</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-[#2c7a7b] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">E-Mail</p>
                      <a href="mailto:service@kathodik.com" className="text-slate-700 font-medium hover:text-[#2c7a7b]">service@kathodik.com</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-[#2c7a7b] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Anschrift</p>
                      <p className="text-slate-700 font-medium">Gartenstraße 70, D-53547 Kasbach-Ohlenberg</p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">

            <Section number="1" title="Geltungsbereich">
              <Clause id="1.1">Diese Allgemeinen Geschäftsbedingungen (nachfolgend „AGB") gelten für sämtliche Geschäftsbeziehungen, Verträge und Leistungen zwischen Kathodik – Galvanotechnik | Hannes Barfuß (nachfolgend „Auftragnehmer") und dem Auftraggeber.</Clause>
              <Clause id="1.2">Abweichende, entgegenstehende oder ergänzende Bedingungen des Auftraggebers werden nicht Vertragsbestandteil, es sei denn, ihrer Geltung wird ausdrücklich in Textform zugestimmt.</Clause>
              <Clause id="1.3">Diese AGB gelten sowohl gegenüber Verbrauchern (§ 13 BGB) als auch gegenüber Unternehmern (§ 14 BGB), es sei denn, in der jeweiligen Klausel wird eine ausdrückliche Unterscheidung getroffen.</Clause>
            </Section>

            <Section number="2" title="Vertragsschluss">
              <Clause id="2.1">Angebote des Auftragnehmers sind freibleibend und unverbindlich.</Clause>
              <Clause id="2.2">Ein Vertrag kommt erst durch eine Auftragsbestätigung in Textform (z. B. per E-Mail) oder durch die tatsächliche Ausführung der Leistung zustande.</Clause>
              <Clause id="2.3">Angaben in Werbemedien, sozialen Netzwerken oder auf der Webseite stellen keine verbindlichen Beschaffenheitsvereinbarungen dar.</Clause>
            </Section>

            <Section number="3" title="Leistungsumfang & Vermittlung">
              <Clause id="3.1">Der konkrete Leistungsumfang ergibt sich aus der jeweiligen individuellen Auftragsvereinbarung. Die Leistungen umfassen insbesondere die galvanische Beschichtung, Oberflächenbearbeitung, Entschichtung, Reparatur- und Restaurationsarbeiten sowie mobile Vor-Ort-Dienstleistungen und technische Modellierung.</Clause>
              <Clause id="3.2">Leistungen im Bereich des 3D-Drucks können über externe Partnerbetriebe vermittelt werden.</Clause>
              <Clause id="3.3">KI-generierte Konzeptbilder, Entwürfe oder Visualisierungen dienen ausschließlich der Veranschaulichung und stellen keine verbindliche Zusicherung des späteren Endergebnisses dar.</Clause>
            </Section>

            <Section number="4" title="Pflichten und Mitwirkung des Auftraggebers">
              <Clause id="4.1">Der Auftraggeber ist verpflichtet, sämtliche relevanten Informationen über das angelieferte Werkstück (Materialzusammensetzung, Vorschäden, Vorbehandlungen, Legierungen oder Altbeschichtungen) vollständig und wahrheitsgemäß mitzuteilen.</Clause>
              <Clause id="4.2">Die Werkstücke müssen sich in einem bearbeitungsfähigen Zustand befinden. Erhöhter Aufwand durch starke Verunreinigungen, Öle oder unvorhergesehene Altbeschichtungen kann gesondert in Rechnung gestellt werden.</Clause>
              <Clause id="4.3">Der Versand der Werkstücke an den Auftragnehmer erfolgt auf Gefahr und Kosten des Auftraggebers. Dem Auftraggeber wird empfohlen, die Werkstücke vor dem Versand fotografisch zu dokumentieren.</Clause>
              <Clause id="4.4">Bei mobilen Vor-Ort-Einsätzen hat der Auftraggeber einen sicheren, zugänglichen und den Arbeitsanforderungen entsprechenden Arbeitsbereich bereitzustellen.</Clause>
            </Section>

            <Section number="5" title="Eingangsprüfung & Dokumentation">
              <Clause id="5.1">Der Auftragnehmer ist berechtigt, den Zustand der Werkstücke bei Anlieferung, während der einzelnen Bearbeitungsschritte und nach Fertigstellung fotografisch oder videografisch zu dokumentieren. Diese Dokumentation dient der Beweis- und Qualitätssicherung.</Clause>
              <Clause id="5.2">Der Auftragnehmer ist nicht verpflichtet, Werkstücke auf nicht erkennbare, versteckte Mängel, Materialfehler, innere Spannungsrisse oder ungeeignete Legierungsgefüge umfassend zu untersuchen, es sei denn, dies wurde ausdrücklich vereinbart.</Clause>
            </Section>

            <Section number="6" title="Material- und Prozessrisiken (Haftungsausschluss für Materialfehler)" highlight>
              <Clause id="6.1">Galvanische, chemische, thermische oder mechanische Bearbeitungsverfahren können bei gebrauchten, alten, korrodierten oder minderwertigen Werkstoffen zu unvorhersehbaren Reaktionen führen.</Clause>
              <Clause id="6.2">Der Auftragnehmer übernimmt keine Haftung für Schäden, Mängel oder Oberflächenveränderungen, die auf die inhärenten Eigenschaften oder Vorschäden der angelieferten Werkstücke zurückzuführen sind. Dies gilt insbesondere für:</Clause>
              <ul className="list-disc pl-6 space-y-1.5 text-slate-700">
                <li>Porositäten, Lunker oder Schlackeneinschlüsse im Grundmaterial.</li>
                <li>Das Auftreten von Spannungsrissen, Verzug oder Materialermüdung während des Prozesses.</li>
                <li>Mangelhafte Haftungseigenschaften der Schichten aufgrund unbekannter Legierungsbestandteile oder verdeckter Oxidschichten.</li>
                <li>Die Freilegung von tieferliegenden, verdeckten Korrosionsschäden (z. B. unter altem Lack oder Altchrom).</li>
              </ul>
              <Clause id="6.3">Bei Restaurations-, Reparatur- oder Aufbereitungsarbeiten an gebrauchten/historischen Bauteilen wird kein bestimmter optischer oder technischer Erfolg geschuldet, sofern dieser aufgrund des Ausgangszustands des Materials objektiv nicht sicher erreichbar ist.</Clause>
            </Section>

            <Section number="7" title="Haftungsbeschränkung (Allgemeiner Haftungsausschluss)">
              <Clause id="7.1">Der Auftragnehmer haftet unbeschränkt bei Vorsatz, grober Fahrlässigkeit sowie bei der schuldhaften Verletzung von Leben, Körper oder Gesundheit.</Clause>
              <Clause id="7.2">Bei leicht fahrlässiger Verletzung wesentlicher Vertragspflichten (Kardinalpflichten – Pflichten, deren Erfüllung die ordnungsgemäße Durchführung des Vertrags überhaupt erst ermöglicht und auf deren Einhaltung der Vertragspartner regelmäßig vertraut), ist die Haftung des Auftragnehmers auf den vertragstypischen, vorhersehbaren Schaden begrenzt.</Clause>
              <Clause id="7.3">Im Übrigen ist die Haftung für leichte Fahrlässigkeit ausgeschlossen.</Clause>
              <Clause id="7.4">Die Haftung nach dem Produkthaftungsgesetz bleibt unberührt.</Clause>
              <Clause id="7.5">Bei mobilen Einsätzen haftet der Auftragnehmer nicht für Schäden, die nachweislich durch unzureichende örtliche Arbeitsbedingungen oder nicht mitgeteilte Gegebenheiten vor Ort verursacht wurden.</Clause>
            </Section>

            <Section number="8" title="Gewährleistung & Mängelrüge">
              <Clause id="8.1">Es gelten die gesetzlichen Mängelhaftungsrechte, soweit nachfolgend nichts anderes vereinbart ist.</Clause>
              <Clause id="8.2">Gegenüber Unternehmern beträgt die Gewährleistungsfrist für erbrachte Leistungen 12 Monate ab Übergabe/Rückversand. Offensichtliche Mängel müssen von Unternehmern innerhalb von 7 Werktagen nach Erhalt der Ware in Textform gerügt werden.</Clause>
              <Clause id="8.3">Gegenüber Verbrauchern gelten die gesetzlichen Fristen.</Clause>
              <Clause id="8.4">Branchenübliche, geringfügige Abweichungen hinsichtlich des Glanzgrades, des Farbtons, der Schichtdicke oder des Oberflächenbildes stellen keinen Mangel dar.</Clause>
              <Clause id="8.5">Gewährleistungsansprüche sind ausgeschlossen, wenn der Mangel auf Ursachen gemäß Ziffer 6 (Materialrisiken) oder auf unsachgemäße thermische, chemische oder mechanische Beanspruchung durch den Kunden nach der Übergabe zurückzuführen ist.</Clause>
            </Section>

            <Section number="9" title="Versand & Gefahrübergang">
              <Clause id="9.1">Ist der Auftraggeber Unternehmer, geht die Gefahr des zufälligen Untergangs oder der Verschlechterung der Ware mit der Übergabe an das Versandunternehmen auf den Auftraggeber über (Versendungskauf).</Clause>
              <Clause id="9.2">Ist der Auftraggeber Verbraucher, trägt der Auftragnehmer das Transportrisiko beim Rückversand, sofern der Versand durch den Auftragnehmer organisiert wird.</Clause>
              <Clause id="9.3">Eine Transportversicherung für den Rückversand erfolgt nur auf ausdrücklichen Wunsch und auf Kosten des Auftraggebers.</Clause>
            </Section>

            <Section number="10" title="Preise, Zahlungsbedingungen & Pfandrecht">
              <Clause id="10.1">Alle Preise verstehen sich zuzüglich der gesetzlichen Umsatzsteuer, sofern diese anfällt und ausgewiesen wird.</Clause>
              <Clause id="10.2">Rechnungen sind innerhalb von 14 Tagen nach Rechnungsstellung ohne Abzug zur Zahlung fällig. Der Auftragnehmer ist berechtigt, angemessene Vorauszahlungen zu verlangen.</Clause>
              <Clause id="10.3">Dem Auftragnehmer steht an den vom Auftraggeber übergebenen Werkstücken ein gesetzliches Unternehmerpfandrecht (§ 647 BGB) für alle bestehenden Forderungen aus dem jeweiligen Auftrag zu.</Clause>
              <Clause id="10.4">Werden fertiggestellte Werkstücke nach Aufforderung nicht innerhalb von 14 Tagen abgeholt oder der Versand freigegeben, können angemessene Lagergebühren berechnet werden.</Clause>
            </Section>

            <Section number="11" title="Referenznutzung & Urheberrecht">
              <Clause id="11.1">Der Auftragnehmer ist berechtigt, anonymisierte Bild- und Videodokumentationen der bearbeiteten Werkstücke (z. B. Vorher-Nachher-Vergleiche) zu Referenz-, Werbe- und Dokumentationszwecken (z. B. auf der eigenen Webseite oder in sozialen Medien) zu nutzen.</Clause>
              <Clause id="11.2">Dies gilt nicht, wenn der Auftraggeber der Nutzung vor oder bei der Auftragserteilung ausdrücklich in Textform widerspricht. Personenbezogene Merkmale (z. B. Kennzeichen, Gravuren) werden unkenntlich gemacht.</Clause>
            </Section>

            <Section number="12" title="Schlussbestimmungen">
              <Clause id="12.1">Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Bei Verbrauchern gilt diese Rechtswahl nur insoweit, als nicht der gewährte Schutz durch zwingende Bestimmungen des Rechts des Staates, in dem der Verbraucher seinen gewöhnlichen Aufenthalt hat, entzogen wird.</Clause>
              <Clause id="12.2">Ist der Auftraggeber Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen, ist der exklusive Gerichtsstand der Sitz des Auftragnehmers.</Clause>
              <Clause id="12.3">Sollten einzelne Bestimmungen dieses Vertrages unwirksam sein oder werden, so wird dadurch die Wirksamkeit der übrigen Bestimmungen nicht berührt (Salvatorische Klausel).</Clause>
            </Section>

          </div>
        </div>
      </section>
    </div>
  );
};

export default AGB;
