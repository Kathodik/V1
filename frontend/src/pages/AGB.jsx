import React from 'react';
import { AnimateOnScroll } from '../components/AnimateOnScroll';
import { useParallax } from '../hooks/useScrollAnimation';

const AGB = () => {
  const scrollY = useParallax();

  const sections = [
    {
      title: '1. Geltungsbereich',
      content: `Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Geschäftsbeziehungen zwischen Kathodik, Hannes Barfuß (nachfolgend "Auftragnehmer") und dem Kunden (nachfolgend "Auftraggeber"). Abweichende Bedingungen des Auftraggebers werden nicht anerkannt, es sei denn, der Auftragnehmer stimmt ihrer Geltung ausdrücklich schriftlich zu. Diese AGB gelten auch dann, wenn der Auftragnehmer in Kenntnis entgegenstehender oder abweichender Bedingungen des Auftraggebers die Leistung vorbehaltlos erbringt.`
    },
    {
      title: '2. Vertragsschluss und Auftragserteilung',
      content: `2.1 Angebote des Auftragnehmers sind freibleibend und unverbindlich, sofern sie nicht ausdrücklich als verbindlich gekennzeichnet sind.

2.2 Ein Vertrag kommt erst durch die schriftliche Auftragsbestätigung des Auftragnehmers oder durch die tatsächliche Ausführung der Leistung zustande.

2.3 Der Auftraggeber ist an seinen Auftrag für die Dauer von 14 Kalendertagen nach Zugang beim Auftragnehmer gebunden.

2.4 Angaben in Katalogen, Prospekten, Werbematerial oder auf der Website sind unverbindlich, soweit sie nicht ausdrücklich Vertragsbestandteil werden.`
    },
    {
      title: '3. Leistungsumfang',
      content: `3.1 Der Leistungsumfang richtet sich nach der schriftlichen Auftragsbestätigung des Auftragnehmers.

3.2 Der Auftragnehmer erbringt Dienstleistungen im Bereich der Galvanotechnik, insbesondere:
- Elektrolytische Beschichtung (Vergolden, Versilbern, Verchromen, Vernickeln, Verkupfern, Verzinnen, Rhodinieren, Palladinieren, Ruthenieren, Cobalt-Beschichtung, Zink-Beschichtung, Platin-Beschichtung, Weiß-Bronze-Beschichtung)
- Oberflächenreparatur und -aufbereitung
- Mobile Vor-Ort-Dienstleistungen
- 3D-Druck und Modellierung in Zusammenarbeit mit Partnerbetrieben

3.3 Änderungen und Ergänzungen des Leistungsumfangs bedürfen der schriftlichen Vereinbarung. Mehraufwand aufgrund nachträglicher Änderungswünsche des Auftraggebers wird gesondert berechnet.`
    },
    {
      title: '4. Pflichten des Auftraggebers',
      content: `4.1 Der Auftraggeber ist verpflichtet, die zu bearbeitenden Werkstücke in einem für die Bearbeitung geeigneten Zustand anzuliefern.

4.2 Der Auftraggeber hat den Auftragnehmer über die Materialbeschaffenheit, Vorbehandlungen, Legierungszusammensetzungen und etwaige Besonderheiten der angelieferten Werkstücke vollständig und wahrheitsgemäß zu informieren.

4.3 Werkstücke müssen frei von Verunreinigungen, Ölen, Fetten, Lacken und sonstigen Beschichtungen angeliefert werden, sofern nicht ausdrücklich anders vereinbart.

4.4 Der Auftraggeber trägt die Verantwortung für die ordnungsgemäße Verpackung und den Transport der Werkstücke zum Auftragnehmer. Der Versand erfolgt auf Risiko des Auftraggebers, sofern nicht anders vereinbart.

4.5 Bei mobilen Dienstleistungen hat der Auftraggeber für einen sicheren und zugänglichen Arbeitsbereich zu sorgen. Erforderliche Genehmigungen und Sicherheitsvorkehrungen obliegen dem Auftraggeber.`
    },
    {
      title: '5. Haftungsausschluss und Haftungsbeschränkung',
      content: `5.1 GRUNDMATERIAL UND MATERIALFEHLER
Der Auftragnehmer übernimmt keine Haftung für Mängel, die auf die Beschaffenheit des vom Auftraggeber bereitgestellten Grundmaterials zurückzuführen sind. Dies umfasst insbesondere, aber nicht ausschließlich:
- Schlackeeinschlüsse in Eisen- und Stahlwerkstoffen
- Porosität, Lunker oder Gaseinschlüsse im Grundmaterial
- Materialermüdung, Mikrorisse oder Spannungsrisse im Ausgangswerkstoff
- Ungeeignete Legierungszusammensetzungen oder Materialunverträglichkeiten
- Korrosionsschäden oder Vorschädigungen des Grundmaterials
- Verunreinigungen, die trotz fachgerechter Vorbehandlung nicht vollständig entfernt werden können
- Mangelnde Haftungseigenschaften des Grundmaterials aufgrund seiner Oberflächenbeschaffenheit

5.2 HAFTUNGSBESCHRÄNKUNG
Die Haftung des Auftragnehmers für Schäden gleich welcher Art, insbesondere für Folgeschäden, entgangenen Gewinn, Produktionsausfälle oder sonstige mittelbare Schäden, ist auf den Auftragswert beschränkt. Dies gilt nicht bei Vorsatz oder grober Fahrlässigkeit des Auftragnehmers sowie bei Verletzung von Leben, Körper oder Gesundheit.

5.3 MOBILE DIENSTLEISTUNGEN
Bei mobilen Vor-Ort-Einsätzen haftet der Auftragnehmer nicht für:
- Schäden an der Umgebung des Arbeitsbereichs, die trotz üblicher Schutzmaßnahmen entstehen
- Schäden, die durch nicht mitteilte Gegebenheiten am Einsatzort entstehen (z.B. verdeckte Leitungen, instabile Untergründe)
- Verzögerungen aufgrund unzureichender Zugänglichkeit oder fehlender Voraussetzungen am Einsatzort

5.4 BESCHICHTUNGSQUALITÄT
Der Auftragnehmer garantiert die fachgerechte Ausführung der vereinbarten Beschichtung nach dem aktuellen Stand der Technik. Geringfügige Abweichungen in Farbe, Glanzgrad oder Schichtdicke, die innerhalb branchenüblicher Toleranzen liegen, stellen keinen Mangel dar.

5.5 Die Haftung für eine bestimmte Haltbarkeit der Beschichtung wird nur übernommen, wenn dies ausdrücklich schriftlich vereinbart wurde. Natürlicher Verschleiß, unsachgemäße Handhabung, chemische Einwirkungen oder mechanische Beanspruchungen nach der Beschichtung sind von der Haftung ausgeschlossen.`
    },
    {
      title: '6. Gewährleistung und Mängelrüge',
      content: `6.1 Der Auftraggeber hat die erbrachte Leistung unverzüglich nach Erhalt zu prüfen und erkennbare Mängel innerhalb von 7 Werktagen schriftlich zu rügen. Verdeckte Mängel sind unverzüglich nach Entdeckung zu rügen.

6.2 Bei berechtigter Mängelrüge hat der Auftragnehmer das Recht zur Nachbesserung. Schlägt die Nachbesserung nach zwei Versuchen fehl, kann der Auftraggeber Minderung oder Rücktritt vom Vertrag verlangen.

6.3 Die Gewährleistungsfrist beträgt 12 Monate ab Übergabe der fertiggestellten Werkstücke, sofern nicht ausdrücklich anders vereinbart.

6.4 Gewährleistungsansprüche bestehen nicht, wenn der Mangel auf eine der unter Punkt 5 genannten Ursachen zurückzuführen ist oder wenn der Auftraggeber seinen Pflichten gemäß Punkt 4 nicht nachgekommen ist.`
    },
    {
      title: '7. Preise und Zahlungsbedingungen',
      content: `7.1 Es gelten die zum Zeitpunkt der Auftragsbestätigung vereinbarten Preise. Alle Preise verstehen sich zuzüglich der gesetzlichen Umsatzsteuer.

7.2 Rechnungen sind innerhalb von 14 Tagen nach Rechnungsstellung ohne Abzug zu begleichen, sofern nicht anders vereinbart.

7.3 Bei Zahlungsverzug ist der Auftragnehmer berechtigt, Verzugszinsen in Höhe von 9 Prozentpunkten über dem jeweiligen Basiszinssatz der Europäischen Zentralbank zu berechnen.

7.4 Kosten für Material, Verpackung und Versand werden gesondert berechnet, sofern nicht anders vereinbart.

7.5 Der Auftragnehmer behält sich das Recht vor, bei Neukunden oder bei Aufträgen über einem bestimmten Wert eine Vorauszahlung oder Anzahlung zu verlangen.`
    },
    {
      title: '8. Eigentumsvorbehalt und Pfandrecht',
      content: `8.1 Der Auftragnehmer behält sich das Eigentum an den von ihm eingebrachten Materialien und Beschichtungen bis zur vollständigen Bezahlung aller Forderungen vor.

8.2 Der Auftragnehmer hat ein gesetzliches Pfandrecht an den ihm zur Bearbeitung übergebenen Werkstücken für alle Forderungen aus dem Vertragsverhältnis.

8.3 Bei Zahlungsverzug von mehr als 30 Tagen ist der Auftragnehmer berechtigt, das Pfandrecht geltend zu machen und die Werkstücke nach vorheriger Ankündigung zu verwerten.`
    },
    {
      title: '9. Lieferung und Lieferfristen',
      content: `9.1 Liefertermine und -fristen sind nur verbindlich, wenn sie ausdrücklich als solche vereinbart wurden.

9.2 Der Auftragnehmer ist zu Teillieferungen berechtigt, sofern dies für den Auftraggeber zumutbar ist.

9.3 Bei Verzögerungen aufgrund höherer Gewalt, Betriebsstörungen, Materialengpässen oder sonstiger vom Auftragnehmer nicht zu vertretender Umstände verlängern sich die Lieferfristen entsprechend.

9.4 Der Versand der fertiggestellten Werkstücke erfolgt auf Kosten und Risiko des Auftraggebers, sofern nicht anders vereinbart.`
    },
    {
      title: '10. Geheimhaltung und Datenschutz',
      content: `10.1 Beide Parteien verpflichten sich, alle im Rahmen der Geschäftsbeziehung erlangten vertraulichen Informationen geheim zu halten.

10.2 Die Verarbeitung personenbezogener Daten erfolgt im Einklang mit der Datenschutz-Grundverordnung (DSGVO) und dem Bundesdatenschutzgesetz (BDSG). Weitere Informationen entnehmen Sie unserer Datenschutzerklärung.

10.3 Die im Rahmen der Auftragsabwicklung erhobenen Daten werden ausschließlich zur Vertragserfüllung und zur Kommunikation mit dem Auftraggeber verwendet.`
    },
    {
      title: '11. Höhere Gewalt',
      content: `11.1 Im Falle höherer Gewalt (Naturkatastrophen, Pandemien, behördliche Maßnahmen, Krieg, Streik, Aussperrung, Energieversorgungsstörungen) ist der Auftragnehmer für die Dauer der Störung und im Umfang ihrer Auswirkung von der Leistungspflicht befreit.

11.2 Der Auftragnehmer wird den Auftraggeber unverzüglich über das Eintreten und die voraussichtliche Dauer der höheren Gewalt informieren.`
    },
    {
      title: '12. Schlussbestimmungen',
      content: `12.1 Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.

12.2 Gerichtsstand für alle Streitigkeiten aus dem Vertragsverhältnis ist der Sitz des Auftragnehmers, sofern der Auftraggeber Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen ist.

12.3 Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, berührt dies die Wirksamkeit der übrigen Bestimmungen nicht. An die Stelle der unwirksamen Bestimmung tritt eine Regelung, die dem wirtschaftlichen Zweck der unwirksamen Bestimmung am nächsten kommt.

12.4 Änderungen und Ergänzungen dieser AGB bedürfen der Schriftform. Dies gilt auch für die Aufhebung dieses Schriftformerfordernisses.

12.5 Die Unwirksamkeit einzelner Bestimmungen berührt die Gültigkeit der übrigen Bestimmungen nicht.`
    },
    {
      title: '13. Besondere Bedingungen für 3D-Druck und KI-generierte Konzepte',
      content: `13.1 Bei der Erstellung von 3D-Druckaufträgen über Partnerbetriebe übernimmt der Auftragnehmer die Rolle des Vermittlers. Die Haftung für die Qualität des 3D-Drucks liegt beim jeweiligen Partnerbetrieb.

13.2 KI-generierte Konzeptbilder dienen ausschließlich der Veranschaulichung und stellen keine verbindliche Zusicherung der endgültigen Produktqualität dar. Abweichungen zwischen KI-Konzept und Endprodukt sind möglich und begründen keinen Mangel.

13.3 Der Auftraggeber erhält an KI-generierten Konzeptbildern ein einfaches Nutzungsrecht für den vereinbarten Zweck. Eine Weitergabe an Dritte oder kommerzielle Verwertung bedarf der vorherigen schriftlichen Zustimmung.

13.4 Hochgeladene 3D-Dateien und Referenzbilder werden vertraulich behandelt und nach Auftragsabschluss gelöscht, sofern der Auftraggeber nicht ausdrücklich eine längere Speicherung wünscht.`
    }
  ];

  return (
    <div className="bg-white min-h-screen">
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
                Kathodik – Galvanotechnik | Hannes Barfuß
              </p>
              <p className="text-sm text-slate-400 mt-2">Stand: Mai 2026</p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {sections.map((section, i) => (
              <AnimateOnScroll key={i} variant="fadeUp" delay={Math.min(i * 50, 300)}>
                <div className="mb-8">
                  <h2 className={`text-lg font-bold mb-3 ${section.title.includes('5.') ? 'text-[#2c7a7b]' : 'text-slate-800'}`}>
                    {section.title}
                  </h2>
                  <div className={`text-sm text-slate-600 leading-relaxed whitespace-pre-line ${section.title.includes('5.') ? 'bg-slate-50 border border-slate-200 rounded-xl p-5' : ''}`}>
                    {section.content}
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AGB;
