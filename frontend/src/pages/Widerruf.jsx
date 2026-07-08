import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Download, FileText, AlertCircle, Send, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { AnimateOnScroll } from '../components/AnimateOnScroll';
import { useParallax } from '../hooks/useScrollAnimation';
import { toast } from 'sonner';

const PDF_URL = 'https://customer-assets.emergentagent.com/job_46881bec-8eb9-4794-935a-8a25c0642f1f/artifacts/jg08x399_Widerrufsformular_Kathodik_Aptos.pdf';

const Widerruf = () => {
  const scrollY = useParallax();
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    leistung: '',
    bestelltAm: '',
    erhaltenAm: '',
    name: '',
    email: '',
    anschrift: '',
    datum: today,
  });
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  const handleOnlineWiderruf = async () => {
    if (!form.name || !form.leistung || !form.email) {
      toast.error('Bitte mindestens Name, E-Mail und Leistung/Ware angeben');
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/widerruf`, {
        name: form.name,
        email: form.email,
        anschrift: form.anschrift || null,
        leistung: form.leistung,
        bestellt_am: form.bestelltAm || null,
        erhalten_am: form.erhaltenAm || null,
      });
      setConfirmation(res.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Widerruf konnte nicht übermittelt werden – bitte nutzen Sie alternativ E-Mail oder Post.');
    } finally {
      setSubmitting(false);
    }
  };

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const buildMailto = () => {
    const subject = `Widerruf – ${form.name || 'Vertrag'}`;
    const body =
`Sehr geehrte Damen und Herren,

hiermit widerrufe ich den von mir abgeschlossenen Vertrag über die Erbringung der folgenden Dienstleistung / die Lieferung der folgenden Waren:

${form.leistung || '(bitte angeben)'}

Bestellt am: ${form.bestelltAm || '(bitte angeben)'}
Erhalten am: ${form.erhaltenAm || '(bitte angeben)'}

Name des/der Verbraucher(s):
${form.name || '(bitte angeben)'}

Anschrift des/der Verbraucher(s):
${form.anschrift || '(bitte angeben)'}

Datum: ${form.datum || today}

Mit freundlichen Grüßen
${form.name || ''}`;
    return `mailto:service@kathodik.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleSend = () => {
    if (!form.name || !form.leistung) {
      toast.error('Bitte mindestens Name und Leistung/Ware angeben');
      return;
    }
    window.location.href = buildMailto();
    toast.success('E-Mail-Programm wird geöffnet…');
  };

  const inputCls = "bg-white border-slate-200 focus:border-[#2c7a7b] focus:ring-[#2c7a7b]/20 text-sm";
  const labelCls = "text-xs font-semibold tracking-wider uppercase text-slate-500 mb-1.5 block";

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
              <p className="text-sm text-slate-400 mt-2">Stand: Juli 2026</p>
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
                    <p className="text-sm text-slate-600 leading-relaxed mt-3">
                      Sie können Ihren Widerruf auch direkt über die{' '}
                      <a href="#widerrufsfunktion" className="text-[#2c7a7b] font-semibold underline">Widerrufsfunktion</a>{' '}
                      auf dieser Seite erklären. Machen Sie von dieser Möglichkeit Gebrauch, bestätigen
                      wir Ihnen den Eingang des Widerrufs unverzüglich per E-Mail unter Angabe von Datum
                      und Uhrzeit des Eingangs.
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
              <div id="widerrufsfunktion" className="rounded-2xl border border-[#2c7a7b]/20 bg-gradient-to-br from-[#2c7a7b]/[0.03] to-white p-7 sm:p-9 shadow-sm scroll-mt-24" data-testid="widerrufs-formular">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#2c7a7b]/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-6 w-6 text-[#2c7a7b]" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">
                      Vertrag hier widerrufen
                    </h2>
                    <p className="text-sm text-slate-500">
                      Füllen Sie das Formular aus und erklären Sie Ihren Widerruf direkt online.
                      Alternativ: ausdrucken und postalisch oder per E-Mail senden.
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
                    <p className="text-sm text-slate-700 leading-relaxed mb-3">
                      Hiermit widerrufe(n) ich/wir <span className="text-slate-400">(*)</span> den von mir/uns <span className="text-slate-400">(*)</span> abgeschlossenen Vertrag über die Erbringung der folgenden Dienstleistung / die Lieferung der folgenden Waren <span className="text-slate-400">(*)</span>:
                    </p>
                    <Textarea
                      value={form.leistung}
                      onChange={update('leistung')}
                      placeholder="z.B. Vergoldung eines Ringes, Auftrags-Nr. 12345"
                      className={`${inputCls} min-h-20`}
                      data-testid="widerruf-leistung"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
                    <div>
                      <label className={labelCls}>Bestellt am <span className="text-slate-400 normal-case">(*)</span></label>
                      <Input
                        type="date"
                        value={form.bestelltAm}
                        onChange={update('bestelltAm')}
                        className={inputCls}
                        data-testid="widerruf-bestellt-am"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Erhalten am <span className="text-slate-400 normal-case">(*)</span></label>
                      <Input
                        type="date"
                        value={form.erhaltenAm}
                        onChange={update('erhaltenAm')}
                        className={inputCls}
                        data-testid="widerruf-erhalten-am"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <label className={labelCls}>Name des/der Verbraucher(s)</label>
                    <Input
                      value={form.name}
                      onChange={update('name')}
                      placeholder="Vor- und Nachname"
                      className={inputCls}
                      data-testid="widerruf-name"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <label className={labelCls}>E-Mail-Adresse (für die Eingangsbestätigung) *</label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={update('email')}
                      placeholder="ihre@email.de"
                      className={inputCls}
                      data-testid="widerruf-email"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <label className={labelCls}>Anschrift des/der Verbraucher(s)</label>
                    <Textarea
                      value={form.anschrift}
                      onChange={update('anschrift')}
                      placeholder="Straße & Hausnummer&#10;PLZ Ort"
                      className={`${inputCls} min-h-20`}
                      data-testid="widerruf-anschrift"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <label className={labelCls}>Datum</label>
                    <Input
                      type="date"
                      value={form.datum}
                      onChange={update('datum')}
                      className={`${inputCls} max-w-xs`}
                      data-testid="widerruf-datum"
                    />
                    <p className="text-[10px] text-slate-400 mt-2">Unterschrift erfolgt nur bei Mitteilung auf Papier.</p>
                  </div>

                  <p className="text-xs text-slate-400 pt-3 border-t border-slate-100">(*) Unzutreffendes streichen.</p>
                </div>

                {confirmation ? (
                  <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-6 text-center" data-testid="widerruf-confirmation">
                    <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-green-900 mb-2">Ihr Widerruf ist bei uns eingegangen</h3>
                    <p className="text-sm text-green-900/90 leading-relaxed">
                      Eingang: <strong>{confirmation.received_display}</strong><br />
                      Vorgangsnummer: {confirmation.id}<br />
                      Eine Eingangsbestätigung wurde an Ihre E-Mail-Adresse gesendet.
                    </p>
                  </div>
                ) : (
                <>
                <div className="mt-6">
                  <Button
                    onClick={handleOnlineWiderruf}
                    disabled={submitting}
                    className="w-full bg-[#2c7a7b] hover:bg-[#285e61] text-white rounded-full py-6 text-base disabled:opacity-50"
                    data-testid="send-widerruf-online"
                  >
                    {submitting ? 'Wird übermittelt…' : 'Jetzt widerrufen'}
                  </Button>
                  <p className="text-xs text-slate-400 mt-2 text-center">
                    Ihr Widerruf wird direkt an uns übermittelt – Sie erhalten unverzüglich eine
                    Eingangsbestätigung mit Datum und Uhrzeit per E-Mail.
                  </p>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleSend}
                    variant="outline"
                    className="flex-1 rounded-full py-5 border-slate-300"
                    data-testid="send-widerruf"
                  >
                    <Send className="h-4 w-4 mr-2" /> Alternativ per E-Mail-Programm
                  </Button>
                  <a href={PDF_URL} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button variant="outline" className="w-full rounded-full py-5 border-slate-300" data-testid="download-widerrufs-pdf">
                      <Download className="h-4 w-4 mr-2" /> PDF herunterladen
                    </Button>
                  </a>
                </div>
                </>
                )}
              </div>
            </AnimateOnScroll>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Widerruf;
