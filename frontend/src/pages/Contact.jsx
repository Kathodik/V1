import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Phone, Mail, MapPin, Send } from 'lucide-react';
import { companyInfo } from '../data/mockData';
import { toast } from 'sonner';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Nachricht erfolgreich gesendet! Wir melden uns zeitnah bei Ihnen.');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-slate-900 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Kontakt <span className="text-teal-400">aufnehmen</span>
          </h1>
          <p className="text-xl text-slate-400">
            Wir freuen uns auf Ihre Anfrage
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Kontaktinformationen</h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">Adresse</h3>
                      <p className="text-slate-400">
                        {companyInfo.address}<br />
                        {companyInfo.city}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">Telefon</h3>
                      <a 
                        href={`tel:${companyInfo.phone}`} 
                        className="text-slate-400 hover:text-teal-400 transition-colors"
                      >
                        {companyInfo.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">E-Mail</h3>
                      <a 
                        href={`mailto:${companyInfo.email}`} 
                        className="text-slate-400 hover:text-teal-400 transition-colors"
                      >
                        {companyInfo.email}
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-teal-600/20 to-cyan-600/20 border-teal-500/30">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-white mb-4">Öffnungszeiten</h3>
                <div className="space-y-2 text-slate-300">
                  <div className="flex justify-between">
                    <span>Montag - Freitag:</span>
                    <span className="font-semibold">Nach Vereinbarung</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Samstag - Sonntag:</span>
                    <span className="font-semibold">Geschlossen</span>
                  </div>
                </div>
                <p className="text-sm text-slate-400 mt-4">
                  Bitte vereinbaren Sie telefonisch oder per E-Mail einen Termin.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Senden Sie uns eine Nachricht</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-white mb-2 block">
                    Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ihr vollständiger Name"
                    className="bg-slate-900 border-slate-700 text-white"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-white mb-2 block">
                    E-Mail *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ihre@email.de"
                    className="bg-slate-900 border-slate-700 text-white"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-white mb-2 block">
                    Telefon (optional)
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Ihre Telefonnummer"
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-white mb-2 block">
                    Nachricht *
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Beschreiben Sie Ihr Anliegen..."
                    className="bg-slate-900 border-slate-700 text-white min-h-32"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-teal-500 hover:bg-teal-600 text-white py-6 text-lg transition-all duration-300 hover:scale-105"
                >
                  Nachricht senden
                  <Send className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;
