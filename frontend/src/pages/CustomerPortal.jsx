import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { LogOut, Package, MessageCircle, FileText, User, RefreshCw } from 'lucide-react';
import { AnimateOnScroll } from '../components/AnimateOnScroll';
import { useAuth } from '../contexts/AuthContext';
import AIChat from '../components/AIChat';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CustomerPortal = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [printRequests, setPrintRequests] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatSessionId] = useState(`portal-${user?.email}-${Date.now()}`);

  useEffect(() => {
    if (!user) {
      navigate('/portal/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const [ordersRes, printRequestsRes, modelsRes] = await Promise.all([
        axios.get(`${API}/orders`, { headers }),
        axios.get(`${API}/print-requests?email=${user.email}`),
        axios.get(`${API}/3d-models?email=${user.email}`)
      ]);

      setOrders(ordersRes.data);
      setPrintRequests(printRequestsRes.data);
      setModels(modelsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      processing: 'bg-blue-100 text-blue-800 border-blue-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      shipped: 'bg-purple-100 text-purple-800 border-purple-300',
      sent: 'bg-blue-100 text-blue-800 border-blue-300',
      confirmed: 'bg-teal-100 text-teal-800 border-teal-300'
    };
    return colors[status] || 'bg-slate-100 text-slate-800 border-slate-300';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Ausstehend',
      processing: 'In Bearbeitung',
      completed: 'Abgeschlossen',
      shipped: 'Versandt',
      sent: 'Gesendet',
      confirmed: 'Bestätigt'
    };
    return texts[status] || status;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="bg-white min-h-screen">
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <AnimateOnScroll variant="fadeUp" duration="normal">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold tracking-[0.15em] uppercase text-[#2c7a7b] mb-2">Kundenportal</p>
                <h1 className="text-4xl font-bold text-slate-800 mb-2" data-testid="portal-heading">
                  Willkommen, <span className="text-[#2c7a7b]">{user.name}</span>
                </h1>
                <p className="text-slate-500">{user.email}</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button onClick={fetchData} variant="outline" className="border-slate-200 rounded-full" data-testid="refresh-btn">
                  <RefreshCw className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Aktualisieren
                </Button>
                <Button onClick={() => { logout(); navigate('/'); }} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 rounded-full" data-testid="logout-btn">
                  <LogOut className="h-5 w-5 mr-2" />
                  Abmelden
                </Button>
              </div>
            </div>
          </AnimateOnScroll>

        <AnimateOnScroll variant="fadeUp" duration="normal" delay={150}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="orders" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="orders">
                  <Package className="h-4 w-4 mr-2" />
                  Aufträge ({orders.length})
                </TabsTrigger>
                <TabsTrigger value="print-requests">
                  <FileText className="h-4 w-4 mr-2" />
                  3D-Drucke ({printRequests.length})
                </TabsTrigger>
                <TabsTrigger value="models">
                  <User className="h-4 w-4 mr-2" />
                  Meine Modelle ({models.length})
                </TabsTrigger>
              </TabsList>

              {/* Orders Tab */}
              <TabsContent value="orders">
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <Card className="bg-white border-slate-300">
                      <CardContent className="p-8 text-center">
                        <Package className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-600">Noch keine Aufträge vorhanden</p>
                      </CardContent>
                    </Card>
                  ) : (
                    orders.map((order) => (
                      <Card key={order.id} className="bg-white border-slate-300 hover:border-[#2c7a7b] transition-colors">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                              {order.metal} - {order.finish}
                            </CardTitle>
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusText(order.status)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <p className="text-slate-600">
                              <strong>Stückzahl:</strong> {order.quantity}
                            </p>
                            {order.description && (
                              <p className="text-slate-600">
                                <strong>Beschreibung:</strong> {order.description}
                              </p>
                            )}
                            <p className="text-slate-500 text-xs">
                              Erstellt: {new Date(order.created_at).toLocaleDateString('de-DE')}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Print Requests Tab */}
              <TabsContent value="print-requests">
                <div className="space-y-4">
                  {printRequests.length === 0 ? (
                    <Card className="bg-white border-slate-300">
                      <CardContent className="p-8 text-center">
                        <FileText className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-600">Keine 3D-Druck-Anfragen</p>
                      </CardContent>
                    </Card>
                  ) : (
                    printRequests.map((request) => (
                      <Card key={request.id} className="bg-white border-slate-300 hover:border-[#2c7a7b] transition-colors">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                              3D-Druck Anfrage
                            </CardTitle>
                            <Badge className={getStatusColor(request.status)}>
                              {getStatusText(request.status)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <p className="text-slate-600">
                              <strong>Modell-ID:</strong> {request.model_id.substring(0, 8)}...
                            </p>
                            {request.notes && (
                              <p className="text-slate-600">
                                <strong>Notizen:</strong> {request.notes}
                              </p>
                            )}
                            <p className="text-slate-500 text-xs">
                              Erstellt: {new Date(request.created_at).toLocaleDateString('de-DE')}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Models Tab */}
              <TabsContent value="models">
                <div className="space-y-4">
                  {models.length === 0 ? (
                    <Card className="bg-white border-slate-300">
                      <CardContent className="p-8 text-center">
                        <User className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-600">Keine 3D-Modelle erstellt</p>
                      </CardContent>
                    </Card>
                  ) : (
                    models.map((model) => (
                      <Card key={model.id} className="bg-white border-slate-300 hover:border-[#2c7a7b] transition-colors">
                        <CardHeader>
                          <CardTitle className="text-lg capitalize">
                            {model.shape} - {model.material}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <p className="text-slate-600">
                              <strong>Maße:</strong> {Object.entries(model.dimensions).map(([key, value]) => `${key}: ${value}cm`).join(', ')}
                            </p>
                            <p className="text-slate-600">
                              <strong>Bearbeitung:</strong> {model.finish}
                            </p>
                            <p className="text-slate-600">
                              <strong>Stückzahl:</strong> {model.quantity}
                            </p>
                            {model.description && (
                              <p className="text-slate-600">
                                <strong>Beschreibung:</strong> {model.description}
                              </p>
                            )}
                            <p className="text-slate-500 text-xs">
                              Erstellt: {new Date(model.created_at).toLocaleDateString('de-DE')}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - AI Chat */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 bg-white border-slate-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5 text-[#2c7a7b]" />
                  <span>KI-Berater</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[600px]">
                  <AIChat sessionId={chatSessionId} />
                </div>
              </CardContent>
            </Card>
          </div>
          </div>
        </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
};

export default CustomerPortal;
