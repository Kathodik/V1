import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { CheckCircle2, Loader2, AlertCircle, Mail } from 'lucide-react';
import { AnimateOnScroll } from '../components/AnimateOnScroll';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const BestaetigungAuftrag = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState(null);
  const [error, setError] = useState('');
  const [agb, setAgb] = useState(false);
  const [haftung, setHaftung] = useState(false);
  const [widerruf, setWiderruf] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API}/contact/confirm/${token}`);
        setContact(res.data);
        if (res.data.status === 'confirmed') setConfirmed(true);
      } catch (err) {
        setError(err.response?.data?.detail || 'Bestätigungslink ungültig oder abgelaufen');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleConfirm = async () => {
    if (!(agb && haftung && widerruf)) {
      toast.error('Bitte alle drei Punkte bestätigen');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/contact/confirm/${token}`, {
        agb_accepted: true,
        haftung_accepted: true,
        widerruf_accepted: true,
      });
      setConfirmed(true);
      toast.success('Auftrag erfolgreich bestätigt!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Bestätigung fehlgeschlagen');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-[#2c7a7b] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-7 w-7 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">Link ungültig</h1>
            <p className="text-sm text-slate-500 mb-6">{error}</p>
            <Link to="/contact"><Button variant="outline" className="rounded-full">Zurück zum Kontaktformular</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <section className="relative py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-2xl mx-auto">
            <AnimateOnScroll variant="fadeUp">
              {confirmed ? (
                <Card data-testid="confirmed-state">
                  <CardContent className="p-8 sm:p-10 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-5">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
                      Auftrag bestätigt
                    </h1>
                    <p className="text-base text-slate-500 mb-6 leading-relaxed">
                      Vielen Dank, <span className="font-semibold text-slate-700">{contact.name}</span>!
                      AGB, Haftungsausschluss und Widerrufsbelehrung wurden bestätigt.
                      Wir beginnen umgehend mit der Bearbeitung Ihrer Anfrage.
                    </p>
                    <div className="inline-flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-4 py-2 rounded-full">
                      <Mail className="h-4 w-4" />
                      <span>Eine Bestätigungs-E-Mail wurde an {contact.email} gesendet</span>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 sm:p-10">
                    <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#2c7a7b] mb-3">Auftrag bestätigen</p>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2" data-testid="confirm-heading">
                      Hallo {contact.name}
                    </h1>
                    <p className="text-base text-slate-500 mb-6 leading-relaxed">
                      Damit wir Ihren Auftrag verbindlich anlegen können, bestätigen Sie bitte die folgenden rechtlichen Hinweise:
                    </p>

                    {/* Original message preview */}
                    <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
                      <p className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-2">Ihre Anfrage</p>
                      <p className="text-sm text-slate-700 whitespace-pre-line">{contact.message}</p>
                    </div>

                    {/* 3 checkboxes */}
                    <div className="space-y-3 mb-6">
                      {[
                        { id: 'agb', state: agb, set: setAgb, label: 'AGB', desc: 'Ich habe die Allgemeinen Geschäftsbedingungen gelesen und akzeptiere sie.', link: '/agb' },
                        { id: 'haftung', state: haftung, set: setHaftung, label: 'Haftungsausschluss', desc: 'Ich nehme den Haftungsausschluss (insbesondere für Materialfehler) zur Kenntnis.', link: '/agb' },
                        { id: 'widerruf', state: widerruf, set: setWiderruf, label: 'Widerrufsbelehrung', desc: 'Ich habe die Widerrufsbelehrung gelesen und zur Kenntnis genommen.', link: '/widerruf' },
                      ].map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-start space-x-3 p-4 rounded-xl border-2 transition-all ${
                            item.state ? 'border-[#2c7a7b] bg-[#2c7a7b]/5' : 'border-slate-200 bg-white'
                          }`}
                          data-testid={`confirm-${item.id}-area`}
                        >
                          <Checkbox
                            id={`cb-${item.id}`}
                            checked={item.state}
                            onCheckedChange={item.set}
                            className="mt-0.5"
                            data-testid={`confirm-${item.id}-checkbox`}
                          />
                          <Label htmlFor={`cb-${item.id}`} className="cursor-pointer flex-1">
                            <p className="text-sm font-bold text-slate-800 mb-0.5">
                              {item.label}{' '}
                              <Link to={item.link} target="_blank" className="text-[#2c7a7b] underline font-semibold text-xs ml-1">lesen</Link>
                            </p>
                            <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                          </Label>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={handleConfirm}
                      disabled={submitting || !(agb && haftung && widerruf)}
                      className="w-full bg-[#2c7a7b] hover:bg-[#285e61] text-white py-6 rounded-full text-base font-semibold"
                      data-testid="confirm-submit-btn"
                    >
                      {submitting ? (
                        <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Wird bestätigt…</>
                      ) : (
                        <><CheckCircle2 className="h-5 w-5 mr-2" /> Auftrag verbindlich bestätigen</>
                      )}
                    </Button>
                    <p className="text-xs text-slate-400 text-center mt-3">
                      Erst nach Ihrer Bestätigung beginnen wir mit der Bearbeitung.
                    </p>
                  </CardContent>
                </Card>
              )}
            </AnimateOnScroll>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BestaetigungAuftrag;
