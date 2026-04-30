import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Settings, Users, Bell, Package, LogOut, Mail, Clock } from 'lucide-react';
import { AnimateOnScroll } from '../components/AnimateOnScroll';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminPortal = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [acceptingOrders, setAcceptingOrders] = useState(true);
  const [pauseMessage, setPauseMessage] = useState('');
  const [waitlist, setWaitlist] = useState([]);
  const [savedRequests, setSavedRequests] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !user.is_admin) {
      navigate('/portal/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [settingsRes, waitlistRes, savedRes, contactRes] = await Promise.all([
        axios.get(`${API}/settings/accepting-orders`),
        axios.get(`${API}/waitlist`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API}/saved-requests`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API}/contact/messages`, { headers }).catch(() => ({ data: [] }))
      ]);
      setAcceptingOrders(settingsRes.data.accepting_orders);
      setPauseMessage(settingsRes.data.pause_message || '');
      setWaitlist(waitlistRes.data);
      setSavedRequests(savedRes.data);
      setContactMessages(contactRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAcceptingOrders = async () => {
    const newValue = !acceptingOrders;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${API}/settings/accepting-orders`, {
        accepting_orders: newValue,
        pause_message: pauseMessage || null
      }, { headers });
      setAcceptingOrders(newValue);
      toast.success(newValue
        ? 'Auftragsannahme aktiviert! Warteliste wird benachrichtigt.'
        : 'Auftragsannahme pausiert.'
      );
    } catch (error) {
      toast.error('Fehler beim Aktualisieren der Einstellung');
    }
  };

  if (!user || !user.is_admin) return null;

  return (
    <div className="bg-white min-h-screen">
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll variant="fadeUp" duration="normal">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold tracking-[0.15em] uppercase text-[#2c7a7b] mb-2">Admin</p>
                <h1 className="text-4xl font-bold text-slate-800" data-testid="admin-heading">
                  Verwaltung
                </h1>
              </div>
              <Button onClick={() => { logout(); navigate('/'); }} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 rounded-full" data-testid="admin-logout-btn">
                <LogOut className="h-5 w-5 mr-2" /> Abmelden
              </Button>
            </div>
          </AnimateOnScroll>

          {/* Order Toggle Card */}
          <AnimateOnScroll variant="fadeUp" delay={100}>
            <Card className="mb-8 border-2 border-slate-200 shadow-lg" data-testid="order-toggle-card">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${acceptingOrders ? 'bg-green-100' : 'bg-red-100'}`}>
                      <Package className={`h-7 w-7 ${acceptingOrders ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Auftragsannahme</h2>
                      <p className="text-slate-500 text-sm">
                        {acceptingOrders ? 'Auftraege werden aktuell angenommen' : 'Auftraege sind aktuell pausiert'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge className={acceptingOrders ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'}>
                      {acceptingOrders ? 'Aktiv' : 'Pausiert'}
                    </Badge>
                    <Switch
                      checked={acceptingOrders}
                      onCheckedChange={toggleAcceptingOrders}
                      data-testid="order-toggle-switch"
                    />
                  </div>
                </div>

                {!acceptingOrders && (
                  <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <Label className="text-sm font-semibold text-amber-800 mb-2 block">Nachricht fuer Kunden (optional):</Label>
                    <Textarea
                      value={pauseMessage}
                      onChange={(e) => setPauseMessage(e.target.value)}
                      placeholder="z.B. Wir sind im Urlaub und nehmen ab dem 15. Januar wieder Auftraege an..."
                      className="bg-white border-amber-200 min-h-20"
                      data-testid="pause-message-input"
                    />
                    <Button
                      onClick={toggleAcceptingOrders}
                      variant="outline"
                      className="mt-3 border-amber-300 text-amber-700 hover:bg-amber-100"
                      data-testid="save-pause-message-btn"
                    >
                      Nachricht aktualisieren
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </AnimateOnScroll>

          {/* Tabs */}
          <AnimateOnScroll variant="fadeUp" delay={200}>
            <Tabs defaultValue="waitlist">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="waitlist">
                  <Bell className="h-4 w-4 mr-2" />
                  Warteliste ({waitlist.length})
                </TabsTrigger>
                <TabsTrigger value="saved">
                  <Package className="h-4 w-4 mr-2" />
                  Gespeicherte Anfragen ({savedRequests.length})
                </TabsTrigger>
                <TabsTrigger value="contact">
                  <Mail className="h-4 w-4 mr-2" />
                  Kontaktanfragen ({contactMessages.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="waitlist">
                <div className="space-y-3">
                  {waitlist.length === 0 ? (
                    <Card className="bg-white border-slate-200">
                      <CardContent className="p-8 text-center">
                        <Bell className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">Noch niemand auf der Warteliste</p>
                      </CardContent>
                    </Card>
                  ) : (
                    waitlist.map((entry, i) => (
                      <Card key={i} className="bg-white border-slate-200">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-slate-800">{entry.name || 'Unbekannt'}</p>
                            <p className="text-sm text-slate-500">{entry.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-400">{new Date(entry.created_at).toLocaleDateString('de-DE')}</p>
                            {entry.notified && <Badge className="bg-green-100 text-green-700 text-xs mt-1">Benachrichtigt</Badge>}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="saved">
                <div className="space-y-3">
                  {savedRequests.length === 0 ? (
                    <Card className="bg-white border-slate-200">
                      <CardContent className="p-8 text-center">
                        <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">Keine gespeicherten Anfragen</p>
                      </CardContent>
                    </Card>
                  ) : (
                    savedRequests.map((req, i) => (
                      <Card key={i} className="bg-white border-slate-200">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-slate-800">{req.name}</p>
                              <p className="text-sm text-slate-500">{req.email}</p>
                              {req.metal && <p className="text-sm text-[#2c7a7b] mt-1">Metall: {req.metal} {req.finish ? `- ${req.finish}` : ''}</p>}
                              {req.message && <p className="text-sm text-slate-600 mt-1">{req.message}</p>}
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-slate-400">{new Date(req.created_at).toLocaleDateString('de-DE')}</p>
                              {req.notify_when_open && <Badge className="bg-blue-100 text-blue-700 text-xs mt-1">Benachrichtigung</Badge>}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="contact">
                <div className="space-y-3">
                  {contactMessages.length === 0 ? (
                    <Card className="bg-white border-slate-200">
                      <CardContent className="p-8 text-center">
                        <Mail className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">Keine Kontaktanfragen</p>
                      </CardContent>
                    </Card>
                  ) : (
                    contactMessages.map((msg, i) => (
                      <Card key={i} className="bg-white border-slate-200">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-slate-800">{msg.name}</p>
                              <p className="text-sm text-slate-500">{msg.email} {msg.phone ? `| ${msg.phone}` : ''}</p>
                              <p className="text-sm text-slate-600 mt-2">{msg.message}</p>
                            </div>
                            <p className="text-xs text-slate-400">{new Date(msg.created_at).toLocaleDateString('de-DE')}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
};

export default AdminPortal;
