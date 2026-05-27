import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Phone, Mail, MapPin, Send, Loader2, PauseCircle, Bell, Save } from 'lucide-react';
import { AnimateOnScroll } from '../components/AnimateOnScroll';
import { useParallax } from '../hooks/useScrollAnimation';
import { companyInfo } from '../data/mockData';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [acceptingOrders, setAcceptingOrders] = useState(true);
  const [pauseMessage, setPauseMessage] = useState('');
  const [notifyMe, setNotifyMe] = useState(true);
  const [agbAccepted, setAgbAccepted] = useState(false);
  const scrollY = useParallax();

  useEffect(() => {
    axios.get(`${API}/settings/accepting-orders`)
      .then(res => {
        setAcceptingOrders(res.data.accepting_orders);
        setPauseMessage(res.data.pause_message || '');
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agbAccepted) {
      toast.error('Bitte stimmen Sie den AGB und dem Haftungsausschluss zu');
      return;
    }
    setLoading(true);
    try {
      if (acceptingOrders) {
        await axios.post(`${API}/contact`, formData);
        toast.success('Nachricht erfolgreich gesendet! Wir melden uns zeitnah bei Ihnen.');
      } else {
        await axios.post(`${API}/saved-requests`, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          notify_when_open: notifyMe
        });
        toast.success(notifyMe
          ? 'Anfrage gespeichert! Sie werden benachrichtigt, sobald wir wieder Auftraege annehmen.'
          : 'Anfrage gespeichert! Wir werden uns melden, sobald wir wieder verfuegbar sind.'
        );
      }
      setFormData({ name: '', email: '', phone: '', message: '' });
      setAgbAccepted(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.detail || 'Fehler beim Senden');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Hero banner */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white" style={{ transform: `translateY(${scrollY * 0.1}px)` }} />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.04]" style={{ background: 'radial-gradient(circle, #2c7a7b 0%, transparent 70%)' }} />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimateOnScroll variant="fadeUp" duration="slow">
            <div className="text-center">
              <p className="text-sm font-semibold tracking-[0.2em] uppercase text-[#2c7a7b] mb-4">
                Nehmen Sie Kontakt auf
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 mb-4" data-testid="contact-heading">
                Wir sind für Sie da
              </h1>
              <p className="text-lg text-slate-500 max-w-xl mx-auto">
                Haben Sie Fragen zu unseren Dienstleistungen? Kontaktieren Sie uns!
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Contact content */}
      <section className="pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 max-w-6xl mx-auto">
            {/* Contact Info */}
            <div className="lg:col-span-2">
              <AnimateOnScroll variant="fadeRight" duration="normal">
                <div className="space-y-8">
                  <div>
                    <p className="text-sm font-semibold tracking-[0.15em] uppercase text-[#2c7a7b] mb-6">Kontaktdaten</p>
                    <div className="space-y-6">
                      {[
                        { icon: Phone, label: 'Telefon', value: companyInfo.phone, href: `tel:${companyInfo.phone}` },
                        { icon: Mail, label: 'E-Mail', value: companyInfo.email, href: `mailto:${companyInfo.email}` },
                        { icon: MapPin, label: 'Adresse', value: `${companyInfo.address}\n${companyInfo.city}`, href: null }
                      ].map((item, index) => (
                        <AnimateOnScroll key={index} variant="fadeUp" delay={index * 100}>
                          <div className="flex items-start space-x-4 group">
                            <div className="w-12 h-12 rounded-xl bg-[#2c7a7b]/5 group-hover:bg-[#2c7a7b]/10 flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                              <item.icon className="h-5 w-5 text-[#2c7a7b]" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-1">{item.label}</p>
                              {item.href ? (
                                <a href={item.href} className="text-slate-700 hover:text-[#2c7a7b] transition-colors whitespace-pre-line font-medium">{item.value}</a>
                              ) : (
                                <p className="text-slate-700 whitespace-pre-line font-medium">{item.value}</p>
                              )}
                            </div>
                          </div>
                        </AnimateOnScroll>
                      ))}
                    </div>
                  </div>

                  <AnimateOnScroll variant="fadeUp" delay={400}>
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
                      <p className="text-sm font-semibold text-slate-800 mb-2">Geschäftsführer</p>
                      <p className="text-slate-600">{companyInfo.owner}</p>
                      <p className="text-sm text-slate-400 mt-1">{companyInfo.legalForm}</p>
                    </div>
                  </AnimateOnScroll>
                </div>
              </AnimateOnScroll>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <AnimateOnScroll variant="fadeLeft" duration="normal" delay={150}>
                {/* Paused Banner */}
                {!acceptingOrders && (
                  <Alert className="mb-6 bg-amber-50 border-amber-300" data-testid="paused-banner">
                    <PauseCircle className="h-5 w-5 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      <strong>Auftragsannahme pausiert</strong>
                      <p className="mt-1 text-sm">
                        {pauseMessage || 'Wir nehmen derzeit keine neuen Aufträge an. Sie können Ihre Anfrage trotzdem speichern und werden benachrichtigt, sobald wir wieder verfügbar sind.'}
                      </p>
                    </AlertDescription>
                  </Alert>
                )}

                <Card className="bg-white border border-slate-200 shadow-lg">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6">
                      {acceptingOrders ? 'Nachricht senden' : 'Anfrage speichern'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name" className="text-slate-700 font-semibold mb-2 block">Name *</Label>
                          <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Ihr Name" className="bg-white border-slate-200 focus:border-[#2c7a7b]" required data-testid="contact-name" />
                        </div>
                        <div>
                          <Label htmlFor="email" className="text-slate-700 font-semibold mb-2 block">E-Mail *</Label>
                          <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="ihre@email.de" className="bg-white border-slate-200 focus:border-[#2c7a7b]" required data-testid="contact-email" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-slate-700 font-semibold mb-2 block">Telefon</Label>
                        <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="Ihre Telefonnummer" className="bg-white border-slate-200 focus:border-[#2c7a7b]" data-testid="contact-phone" />
                      </div>
                      <div>
                        <Label htmlFor="message" className="text-slate-700 font-semibold mb-2 block">Nachricht *</Label>
                        <Textarea id="message" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} placeholder="Beschreiben Sie Ihr Projekt oder Ihre Frage..." className="bg-white border-slate-200 focus:border-[#2c7a7b] min-h-36" required data-testid="contact-message" />
                      </div>

                      {/* Notification opt-in when paused */}
                      {!acceptingOrders && (
                        <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl border border-blue-200" data-testid="notify-checkbox-area">
                          <Checkbox id="notify" checked={notifyMe} onCheckedChange={setNotifyMe} data-testid="notify-checkbox" />
                          <Label htmlFor="notify" className="text-sm text-blue-800 cursor-pointer">
                            <Bell className="h-4 w-4 inline mr-1" />
                            Benachrichtigen Sie mich, sobald wieder Aufträge angenommen werden
                          </Label>
                        </div>
                      )}

                      <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-xl border border-slate-200" data-testid="contact-agb-area">
                        <Checkbox id="agb-contact" checked={agbAccepted} onCheckedChange={setAgbAccepted} className="mt-0.5" data-testid="contact-agb-checkbox" />
                        <Label htmlFor="agb-contact" className="text-sm text-slate-700 cursor-pointer leading-relaxed">
                          Ich habe die <Link to="/agb" target="_blank" className="text-[#2c7a7b] font-semibold underline hover:text-[#285e61]">AGB und den Haftungsausschluss</Link> gelesen und akzeptiere diese. Mir ist insbesondere bekannt, dass keine Haftung für Mängel am Grundmaterial (z.B. Schlackeeinschlüsse) übernommen wird. *
                        </Label>
                      </div>

                      <Button type="submit" className="w-full bg-[#2c7a7b] hover:bg-[#285e61] text-white py-6 text-lg rounded-full transition-all duration-300 shadow-lg shadow-[#2c7a7b]/20" disabled={loading} data-testid="contact-submit-btn">
                        {loading ? (
                          <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Wird gesendet...</>
                        ) : acceptingOrders ? (
                          <><Send className="mr-2 h-5 w-5" /> Nachricht senden</>
                        ) : (
                          <><Save className="mr-2 h-5 w-5" /> Anfrage speichern</>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </AnimateOnScroll>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
