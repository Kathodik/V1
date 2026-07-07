import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Settings, Users, Bell, Package, LogOut, Mail, BarChart3, Eye, TrendingUp, Cookie, Box, Euro, Trash2, Plus } from 'lucide-react';
import { Input } from '../components/ui/input';
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
  const [configuratorOrders, setConfiguratorOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pricing, setPricing] = useState(null);
  const [savingPricing, setSavingPricing] = useState(false);
  const [orderFiles, setOrderFiles] = useState({});
  const [orderFilter, setOrderFilter] = useState('all');

  const ORDER_FILTERS = [
    { id: 'all', label: 'Alle', types: null },
    { id: 'lohn', label: 'Lohngalvanik', types: ['metal_order'] },
    { id: 'cart', label: 'Warenkorb', types: ['cart_order'] },
    { id: '3d', label: '3D-Konfigurator', types: ['upload', 'partner_model', 'ai_generate'] },
    { id: 'vorort', label: 'Vor-Ort', types: ['mobile_service'] },
  ];

  const STATUS_META = {
    new: { label: 'Neu', cls: 'bg-amber-100 text-amber-700' },
    confirmed: { label: 'Bestätigt', cls: 'bg-green-100 text-green-700' },
    declined: { label: 'Abgelehnt', cls: 'bg-red-100 text-red-700' },
    in_progress: { label: 'In Arbeit', cls: 'bg-blue-100 text-blue-700' },
    completed: { label: 'Abgeschlossen', cls: 'bg-slate-200 text-slate-700' },
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${API}/configurator/orders/${orderId}/status`, { status }, { headers });
      setConfiguratorOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
      toast.success(`Status geändert: ${STATUS_META[status]?.label || status}. Der Kunde wurde per E-Mail informiert.`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Status konnte nicht geändert werden');
    }
  };

  const updateContactStatus = async (contactId, status) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${API}/contact/messages/${contactId}/status`, { status }, { headers });
      setContactMessages((prev) => prev.map((m) => (m.id === contactId ? { ...m, status } : m)));
      toast.success(status === 'accepted'
        ? 'Anfrage angenommen – der Kunde wurde per E-Mail informiert.'
        : 'Anfrage abgelehnt – der Kunde wurde per E-Mail informiert.');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Status konnte nicht geändert werden');
    }
  };

  const loadOrderFiles = async (orderId) => {
    if (orderFiles[orderId]) {
      setOrderFiles((prev) => { const n = { ...prev }; delete n[orderId]; return n; });
      return;
    }
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API}/configurator/orders/${orderId}/files`, { headers });
      setOrderFiles((prev) => ({ ...prev, [orderId]: res.data.files || [] }));
    } catch (error) {
      toast.error('Bilder konnten nicht geladen werden');
    }
  };

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
      const [settingsRes, waitlistRes, savedRes, contactRes, analyticsRes, configRes] = await Promise.all([
        axios.get(`${API}/settings/accepting-orders`),
        axios.get(`${API}/waitlist`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API}/saved-requests`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API}/contact/messages`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API}/analytics/stats`, { headers }).catch(() => ({ data: null })),
        axios.get(`${API}/configurator/orders`, { headers }).catch(() => ({ data: [] }))
      ]);
      axios.get(`${API}/pricing`).then((res) => setPricing(res.data)).catch(() => setPricing(null));
      setAcceptingOrders(settingsRes.data.accepting_orders);
      setPauseMessage(settingsRes.data.pause_message || '');
      setWaitlist(waitlistRes.data);
      setSavedRequests(savedRes.data);
      setContactMessages(contactRes.data);
      setAnalytics(analyticsRes.data);
      setConfiguratorOrders(configRes.data);
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

  const updatePauseMessage = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(`${API}/settings/accepting-orders`, {
        accepting_orders: acceptingOrders,
        pause_message: pauseMessage || null
      }, { headers });
      toast.success('Nachricht aktualisiert');
    } catch (error) {
      toast.error('Fehler beim Aktualisieren');
    }
  };

  const savePricing = async () => {
    if (!pricing) return;
    setSavingPricing(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.put(`${API}/pricing`, {
        cart_enabled: !!pricing.cart_enabled,
        products: pricing.products || [],
        metal_factors: pricing.metal_factors || {},
        condition_factors: pricing.condition_factors || {},
        materials: pricing.materials || [],
        finish_factors: pricing.finish_factors || {},
      }, { headers });
      setPricing(res.data);
      toast.success('Preise gespeichert');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Fehler beim Speichern der Preise');
    } finally {
      setSavingPricing(false);
    }
  };

  const updateProduct = (idx, field, value) => {
    setPricing((prev) => ({
      ...prev,
      products: prev.products.map((p, i) => (i === idx ? { ...p, [field]: value } : p)),
    }));
  };

  const removeProduct = (idx) => {
    setPricing((prev) => ({ ...prev, products: prev.products.filter((_, i) => i !== idx) }));
  };

  const addProduct = () => {
    const name = window.prompt('Name des neuen Produkts (z. B. "Feuerzeug"):');
    if (!name) return;
    const id = name.toLowerCase().replace(/[^a-z0-9äöüß]+/g, '-').replace(/^-|-$/g, '') || `produkt-${Date.now()}`;
    setPricing((prev) => ({
      ...prev,
      products: [...(prev.products || []), { id, name, base_price_eur: 49.0, active: true }],
    }));
  };

  if (!user || !user.is_admin) return null;

  const maxViews = analytics?.daily_views ? Math.max(...analytics.daily_views.map(d => d.views), 1) : 1;

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
                        {acceptingOrders ? 'Aufträge werden aktuell angenommen' : 'Aufträge sind aktuell pausiert'}
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
                    <Label className="text-sm font-semibold text-amber-800 mb-2 block">Nachricht für Kunden (optional):</Label>
                    <Textarea
                      value={pauseMessage}
                      onChange={(e) => setPauseMessage(e.target.value)}
                      placeholder="z.B. Wir sind im Urlaub und nehmen ab dem 15. Januar wieder Aufträge an..."
                      className="bg-white border-amber-200 min-h-20"
                      data-testid="pause-message-input"
                    />
                    <Button
                      onClick={updatePauseMessage}
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
            <Tabs defaultValue="analytics">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-6">
                <TabsTrigger value="analytics">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Statistiken
                </TabsTrigger>
                <TabsTrigger value="configurator">
                  <Box className="h-4 w-4 mr-2" />
                  Aufträge ({configuratorOrders.length})
                </TabsTrigger>
                <TabsTrigger value="waitlist">
                  <Bell className="h-4 w-4 mr-2" />
                  Warteliste ({waitlist.length})
                </TabsTrigger>
                <TabsTrigger value="saved">
                  <Package className="h-4 w-4 mr-2" />
                  Anfragen ({savedRequests.length})
                </TabsTrigger>
                <TabsTrigger value="contact">
                  <Mail className="h-4 w-4 mr-2" />
                  Kontakt ({contactMessages.length})
                </TabsTrigger>
                <TabsTrigger value="pricing" data-testid="pricing-tab">
                  <Euro className="h-4 w-4 mr-2" />
                  Preise
                </TabsTrigger>
              </TabsList>

              {/* Pricing Tab */}
              <TabsContent value="pricing">
                {!pricing ? (
                  <p className="text-sm text-slate-500">Preiskonfiguration wird geladen…</p>
                ) : (
                  <div className="space-y-6" data-testid="pricing-panel">
                    <Card className="border-2 border-[#2c7a7b]/20">
                      <CardContent className="p-6 flex items-center justify-between gap-4">
                        <div>
                          <p className="font-bold text-slate-800">Neue Bestellstrecke (Warenkorb mit Sofortpreis)</p>
                          <p className="text-sm text-slate-500 mt-1">
                            Erst aktivieren, wenn die Preise unten stimmen. Solange sie aus ist, sehen Kunden den bisherigen Anfrage-Weg.
                          </p>
                        </div>
                        <Switch
                          checked={!!pricing.cart_enabled}
                          onCheckedChange={(v) => setPricing((prev) => ({ ...prev, cart_enabled: v }))}
                          data-testid="cart-enabled-switch"
                        />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Produkte & Basispreise</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {(pricing.products || []).map((p, idx) => (
                          <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200">
                            <Input
                              value={p.name}
                              onChange={(e) => updateProduct(idx, 'name', e.target.value)}
                              className="flex-1"
                              data-testid={`price-name-${p.id}`}
                            />
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                step="0.5"
                                min="0"
                                value={p.base_price_eur}
                                onChange={(e) => updateProduct(idx, 'base_price_eur', e.target.value === '' ? '' : parseFloat(e.target.value))}
                                className="w-28 text-right"
                                data-testid={`price-value-${p.id}`}
                              />
                              <span className="text-sm text-slate-500">€</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={p.active !== false}
                                onCheckedChange={(v) => updateProduct(idx, 'active', v)}
                              />
                              <span className="text-xs text-slate-400 w-10">{p.active !== false ? 'aktiv' : 'aus'}</span>
                            </div>
                            <button onClick={() => removeProduct(idx)} className="text-slate-300 hover:text-red-500" aria-label="Produkt entfernen">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <Button variant="outline" onClick={addProduct} className="rounded-full" data-testid="add-product-btn">
                          <Plus className="w-4 h-4 mr-2" /> Produkt hinzufügen
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Metallfaktoren</CardTitle>
                        <p className="text-sm text-slate-500 font-normal">
                          Preis = Basispreis × Metall × Zustand × Grundmaterial × Finish. Beispiel: Ring 29 € × Gold 4,0 × Neu 1,0 × Messing 1,0 × Roségold 1,15 = 133,40 €.
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                          {Object.entries(pricing.metal_factors || {}).map(([sym, factor]) => (
                            <div key={sym} className="p-3 rounded-xl border border-slate-200 text-center">
                              <p className="text-sm font-bold text-slate-700 mb-1">{sym}</p>
                              <Input
                                type="number"
                                step="0.1"
                                min="0.1"
                                value={factor}
                                onChange={(e) =>
                                  setPricing((prev) => ({
                                    ...prev,
                                    metal_factors: { ...prev.metal_factors, [sym]: e.target.value === '' ? '' : parseFloat(e.target.value) },
                                  }))
                                }
                                className="text-center"
                                data-testid={`factor-${sym}`}
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Zustandsfaktoren</CardTitle>
                        <p className="text-sm text-slate-500 font-normal">Aufbereitungsaufwand je Bauteilzustand.</p>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { id: 'neu', label: '🟢 Neu / Neuwertig' },
                            { id: 'leicht', label: '🟡 Leicht oxidiert' },
                            { id: 'stark', label: '🔴 Starker Rost' },
                          ].map((c) => (
                            <div key={c.id} className="p-3 rounded-xl border border-slate-200 text-center">
                              <p className="text-xs font-semibold text-slate-700 mb-1">{c.label}</p>
                              <Input
                                type="number"
                                step="0.05"
                                min="0.1"
                                value={pricing.condition_factors?.[c.id] ?? 1.0}
                                onChange={(e) =>
                                  setPricing((prev) => ({
                                    ...prev,
                                    condition_factors: { ...prev.condition_factors, [c.id]: e.target.value === '' ? '' : parseFloat(e.target.value) },
                                  }))
                                }
                                className="text-center"
                                data-testid={`condition-factor-${c.id}`}
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Grundmaterial-Faktoren</CardTitle>
                        <p className="text-sm text-slate-500 font-normal">Vorbehandlungsaufwand je Ausgangsmaterial.</p>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {(pricing.materials || []).map((m, idx) => (
                            <div key={m.id} className="p-3 rounded-xl border border-slate-200 text-center">
                              <p className="text-xs font-semibold text-slate-700 mb-1">{m.name}</p>
                              <Input
                                type="number"
                                step="0.05"
                                min="0.1"
                                value={m.factor}
                                onChange={(e) =>
                                  setPricing((prev) => ({
                                    ...prev,
                                    materials: prev.materials.map((mm, i) => (i === idx ? { ...mm, factor: e.target.value === '' ? '' : parseFloat(e.target.value) } : mm)),
                                  }))
                                }
                                className="text-center"
                                data-testid={`material-factor-${m.id}`}
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Finish-Faktoren</CardTitle>
                        <p className="text-sm text-slate-500 font-normal">
                          Aufschlag für besondere Ausführungen (z. B. Roségold, Schwarzchrom). Standard-Finishes ohne Eintrag zählen als 1,0.
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                          {Object.entries(pricing.finish_factors || {}).map(([fid, factor]) => (
                            <div key={fid} className="p-3 rounded-xl border border-slate-200 text-center">
                              <p className="text-[11px] font-semibold text-slate-700 mb-1 break-all">{fid}</p>
                              <Input
                                type="number"
                                step="0.05"
                                min="0.1"
                                value={factor}
                                onChange={(e) =>
                                  setPricing((prev) => ({
                                    ...prev,
                                    finish_factors: { ...prev.finish_factors, [fid]: e.target.value === '' ? '' : parseFloat(e.target.value) },
                                  }))
                                }
                                className="text-center"
                                data-testid={`finish-factor-${fid}`}
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Button
                      onClick={savePricing}
                      disabled={savingPricing}
                      className="bg-[#2c7a7b] hover:bg-[#285e61] text-white rounded-full px-8"
                      data-testid="save-pricing-btn"
                    >
                      {savingPricing ? 'Wird gespeichert…' : 'Preise speichern'}
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics">
                {analytics ? (
                  <div className="space-y-6">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card className="bg-white border-slate-200">
                        <CardContent className="p-5">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                              <Eye className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-slate-800">{analytics.today_views}</p>
                              <p className="text-xs text-slate-500">Heute</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-white border-slate-200">
                        <CardContent className="p-5">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                              <TrendingUp className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-slate-800">{analytics.week_views}</p>
                              <p className="text-xs text-slate-500">Diese Woche</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-white border-slate-200">
                        <CardContent className="p-5">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                              <Users className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-slate-800">{analytics.unique_week}</p>
                              <p className="text-xs text-slate-500">Besucher (Woche)</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-white border-slate-200">
                        <CardContent className="p-5">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                              <Cookie className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-slate-800">{analytics.cookies_accepted}</p>
                              <p className="text-xs text-slate-500">Cookies akzeptiert</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Chart: Daily Views */}
                    <Card className="bg-white border-slate-200">
                      <CardHeader>
                        <CardTitle className="text-lg text-slate-800">Seitenaufrufe (letzte 7 Tage)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-end justify-between h-40 gap-2">
                          {analytics.daily_views.map((day, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                              <span className="text-xs font-semibold text-slate-600">{day.views}</span>
                              <div
                                className="w-full bg-[#2c7a7b] rounded-t-md transition-all duration-500"
                                style={{ height: `${Math.max((day.views / maxViews) * 100, 4)}%`, minHeight: '4px' }}
                              />
                              <span className="text-[10px] text-slate-400 mt-1">{day.date}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Top Pages + Cookie Stats */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card className="bg-white border-slate-200">
                        <CardHeader>
                          <CardTitle className="text-lg text-slate-800">Top Seiten (30 Tage)</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {analytics.top_pages.length === 0 ? (
                              <p className="text-sm text-slate-400">Noch keine Daten</p>
                            ) : (
                              analytics.top_pages.map((page, i) => (
                                <div key={i} className="flex items-center justify-between">
                                  <span className="text-sm text-slate-700 font-medium truncate mr-4">{page.page === '/' ? 'Home' : page.page}</span>
                                  <div className="flex items-center space-x-2">
                                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-[#2c7a7b] rounded-full"
                                        style={{ width: `${(page.count / (analytics.top_pages[0]?.count || 1)) * 100}%` }}
                                      />
                                    </div>
                                    <span className="text-xs text-slate-500 w-8 text-right">{page.count}</span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-white border-slate-200">
                        <CardHeader>
                          <CardTitle className="text-lg text-slate-800">Cookie-Einwilligungen</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                              <span className="text-sm font-medium text-green-800">Akzeptiert</span>
                              <span className="text-xl font-bold text-green-700">{analytics.cookies_accepted}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                              <span className="text-sm font-medium text-red-800">Abgelehnt</span>
                              <span className="text-xl font-bold text-red-700">{analytics.cookies_declined}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                              <span className="text-sm font-medium text-slate-700">Gesamt</span>
                              <span className="text-xl font-bold text-slate-800">{analytics.total_views} Seitenaufrufe</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <Card className="bg-white border-slate-200">
                    <CardContent className="p-8 text-center">
                      <BarChart3 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">Statistiken werden geladen...</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Configurator Orders Tab */}
              <TabsContent value="configurator">
                <div className="flex flex-wrap gap-2 mb-4">
                  {ORDER_FILTERS.map((f) => {
                    const count = f.types
                      ? configuratorOrders.filter((o) => f.types.includes(o.order_type)).length
                      : configuratorOrders.length;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setOrderFilter(f.id)}
                        className={`px-4 py-1.5 rounded-full text-sm border-2 transition-colors ${
                          orderFilter === f.id
                            ? 'border-[#2c7a7b] bg-[#2c7a7b]/5 text-[#2c7a7b] font-semibold'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                        data-testid={`order-filter-${f.id}`}
                      >
                        {f.label} ({count})
                      </button>
                    );
                  })}
                </div>
                <div className="space-y-3">
                  {(() => {
                    const activeFilter = ORDER_FILTERS.find((f) => f.id === orderFilter);
                    const filtered = activeFilter?.types
                      ? configuratorOrders.filter((o) => activeFilter.types.includes(o.order_type))
                      : configuratorOrders;
                    return filtered.length === 0 ? (
                    <Card className="bg-white border-slate-200">
                      <CardContent className="p-8 text-center">
                        <Box className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">Keine Aufträge in dieser Kategorie</p>
                      </CardContent>
                    </Card>
                  ) : (
                    filtered.map((order, i) => {
                      const typeLabels = { upload: 'Eigene Datei', partner_model: 'Partner-Modellierung', ai_generate: 'Luigi – KI-Konzept', mobile_service: 'Mobile Dienstleistung', metal_order: 'Metall-Auftrag', cart_order: 'Warenkorb-Bestellung' };
                      const typeColors = { upload: 'bg-blue-100 text-blue-700', partner_model: 'bg-purple-100 text-purple-700', ai_generate: 'bg-teal-100 text-teal-700', mobile_service: 'bg-amber-100 text-amber-700', metal_order: 'bg-emerald-100 text-emerald-700', cart_order: 'bg-emerald-100 text-emerald-700' };
                      const isMetalOrder = order.order_type === 'metal_order' || order.order_type === 'cart_order';
                      const paymentAmount = order.payment_amount_eur || 49;
                      const paymentPaid = order.payment_status === 'paid';
                      const paymentPending = order.payment_status === 'pending';
                      const files = orderFiles[order.id];
                      return (
                        <Card key={i} className="bg-white border-slate-200">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center space-x-2 mb-1 flex-wrap gap-y-1">
                                  <p className="font-semibold text-slate-800">{order.name}</p>
                                  <Badge className={`text-xs ${typeColors[order.order_type] || 'bg-slate-100 text-slate-700'}`}>
                                    {typeLabels[order.order_type] || order.order_type}
                                  </Badge>
                                  {isMetalOrder && paymentPaid && (
                                    <Badge className="bg-green-100 text-green-700 text-xs">💳 {paymentAmount.toFixed(2).replace('.', ',')} € bezahlt</Badge>
                                  )}
                                  {isMetalOrder && paymentPending && (
                                    <Badge className="bg-orange-100 text-orange-700 text-xs">💳 {paymentAmount.toFixed(2).replace('.', ',')} € offen</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-slate-500">{order.email} {order.phone ? `| ${order.phone}` : ''}</p>
                                {order.metal && <p className="text-sm text-[#2c7a7b] mt-1">Metall: {order.metal} {order.finish ? `- ${order.finish}` : ''} {order.quantity ? `· ${order.quantity} Stk` : ''}</p>}
                                {order.base_material && <p className="text-xs text-slate-500 mt-0.5">Grundmaterial: {order.base_material}</p>}
                                {order.condition && <p className="text-xs text-slate-500 mt-0.5">Zustand: {order.condition === 'neu' ? '🟢 Stufe 1 – Neu' : order.condition === 'leicht' ? '🟡 Stufe 2 – Leicht oxidiert' : '🔴 Stufe 3 – Starker Rost'}</p>}
                                {order.description && <p className="text-sm text-slate-600 mt-1">{order.description}</p>}
                                {order.items && order.items.length > 0 && (
                                  <div className="mt-2 text-sm text-slate-600 space-y-0.5">
                                    {order.items.map((it, idx) => (
                                      <p key={idx}>
                                        {it.quantity}× {it.product_name} · {it.metal}{it.finish ? ` (${it.finish})` : ''} — {Number(it.line_total_eur).toFixed(2).replace('.', ',')} €
                                      </p>
                                    ))}
                                  </div>
                                )}
                                {order.image_count > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => loadOrderFiles(order.id)}
                                    className="text-xs text-blue-600 mt-1 underline underline-offset-2"
                                    data-testid={`show-images-${order.id}`}
                                  >
                                    📷 {order.image_count} Bauteilfoto(s) {files ? 'ausblenden' : 'anzeigen'}
                                  </button>
                                )}
                                {files && files.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {files.map((f, idx) => (
                                      <a key={idx} href={f.file_data} target="_blank" rel="noreferrer" title={f.file_name}>
                                        <img
                                          src={f.file_data}
                                          alt={f.file_name}
                                          className="w-20 h-20 object-cover rounded-lg border border-slate-200 hover:border-[#2c7a7b]"
                                        />
                                      </a>
                                    ))}
                                  </div>
                                )}
                                {files && files.length === 0 && (
                                  <p className="text-xs text-slate-400 mt-1">Keine Bilddaten gespeichert (Auftrag vor dem Bilder-Fix erstellt)</p>
                                )}
                                {order.file_name && <p className="text-sm text-blue-600 mt-1">Datei: {order.file_name}</p>}
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-slate-400">{new Date(order.created_at).toLocaleDateString('de-DE')}</p>
                                <Badge className={`text-xs mt-1 ${(STATUS_META[order.status] || STATUS_META.new).cls}`}>
                                  {(STATUS_META[order.status] || { label: order.status }).label}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
                              {order.status === 'new' && (
                                <>
                                  <Button size="sm" onClick={() => updateOrderStatus(order.id, 'confirmed')} className="bg-[#2c7a7b] hover:bg-[#285e61] text-white rounded-full px-4 h-8 text-xs" data-testid={`confirm-order-${order.id}`}>
                                    ✔ Bestätigen
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, 'declined')} className="border-red-200 text-red-600 hover:bg-red-50 rounded-full px-4 h-8 text-xs" data-testid={`decline-order-${order.id}`}>
                                    ✕ Ablehnen
                                  </Button>
                                </>
                              )}
                              {order.status === 'confirmed' && (
                                <Button size="sm" onClick={() => updateOrderStatus(order.id, 'in_progress')} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 h-8 text-xs">
                                  🛠 In Arbeit
                                </Button>
                              )}
                              {order.status === 'in_progress' && (
                                <Button size="sm" onClick={() => updateOrderStatus(order.id, 'completed')} className="bg-slate-700 hover:bg-slate-800 text-white rounded-full px-4 h-8 text-xs">
                                  ✅ Abschließen
                                </Button>
                              )}
                              {order.status === 'declined' && (
                                <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, 'confirmed')} className="rounded-full px-4 h-8 text-xs">
                                  Doch bestätigen
                                </Button>
                              )}
                              <span className="text-[11px] text-slate-400 self-center ml-auto">Statuswechsel benachrichtigt den Kunden per E-Mail</span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  );
                  })()}
                </div>
              </TabsContent>

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
                    contactMessages.map((msg, i) => {
                      const isConfirmed = msg.status === 'confirmed';
                      const isPending = msg.status === 'pending_confirmation';
                      const isAccepted = msg.status === 'accepted';
                      const isDeclined = msg.status === 'declined';
                      return (
                        <Card key={i} className="bg-white border-slate-200">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <p className="font-semibold text-slate-800">{msg.name}</p>
                                  {isConfirmed && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[11px] font-semibold">
                                      ✓ Bestätigt
                                    </span>
                                  )}
                                  {isPending && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[11px] font-semibold">
                                      ⧖ Wartet auf Kundenbestätigung
                                    </span>
                                  )}
                                  {isAccepted && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-semibold">
                                      ✔ Angenommen
                                    </span>
                                  )}
                                  {isDeclined && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[11px] font-semibold">
                                      ✕ Abgelehnt
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-slate-500">{msg.email} {msg.phone ? `| ${msg.phone}` : ''}</p>
                                <p className="text-sm text-slate-600 mt-2">{msg.message}</p>
                                {isConfirmed && msg.confirmed_at && (
                                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-0.5">
                                    <p>✓ Datenschutz akzeptiert{msg.datenschutz_accepted_at ? ` (${new Date(msg.datenschutz_accepted_at).toLocaleString('de-DE')})` : ''}</p>
                                    <p>✓ AGB · Haftungsausschluss · Widerruf bestätigt am {new Date(msg.confirmed_at).toLocaleString('de-DE')}</p>
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-slate-400 whitespace-nowrap">{new Date(msg.created_at).toLocaleDateString('de-DE')}</p>
                            </div>
                            {!isAccepted && !isDeclined && (
                              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
                                <Button size="sm" onClick={() => updateContactStatus(msg.id, 'accepted')} className="bg-[#2c7a7b] hover:bg-[#285e61] text-white rounded-full px-4 h-8 text-xs" data-testid={`accept-contact-${msg.id}`}>
                                  ✔ Annehmen
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => updateContactStatus(msg.id, 'declined')} className="border-red-200 text-red-600 hover:bg-red-50 rounded-full px-4 h-8 text-xs" data-testid={`decline-contact-${msg.id}`}>
                                  ✕ Ablehnen
                                </Button>
                                <span className="text-[11px] text-slate-400 self-center ml-auto">Entscheidung benachrichtigt den Kunden per E-Mail</span>
                              </div>
                            )}
                            {isDeclined && (
                              <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                                <Button size="sm" variant="outline" onClick={() => updateContactStatus(msg.id, 'accepted')} className="rounded-full px-4 h-8 text-xs">
                                  Doch annehmen
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })
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
