import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Box, Cylinder, Circle, Info, MessageCircle, Send } from 'lucide-react';
import { metals } from '../data/mockData';
import { toast } from 'sonner';
import AIChat from '../components/AIChat';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ThreeDConfigurator = () => {
  const [shape, setShape] = useState('cube');
  const [dimensions, setDimensions] = useState({ width: 10, height: 10, depth: 10 });
  const [selectedMetal, setSelectedMetal] = useState(metals[0].symbol);
  const [selectedFinish, setSelectedFinish] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [chatSessionId] = useState(`3d-config-${Date.now()}`);

  const shapes = [
    { id: 'cube', name: 'Würfel', icon: Box, fields: ['width', 'height', 'depth'] },
    { id: 'cylinder', name: 'Zylinder', icon: Cylinder, fields: ['radius', 'height'] },
    { id: 'sphere', name: 'Kugel', icon: Circle, fields: ['radius'] }
  ];

  const currentShape = shapes.find(s => s.id === shape);
  const currentMetal = metals.find(m => m.symbol === selectedMetal);

  const handleDimensionChange = (field, value) => {
    setDimensions(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !name) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    try {
      // Create 3D model
      const modelResponse = await axios.post(`${API}/3d-models`, {
        shape,
        dimensions,
        material: selectedMetal,
        finish: selectedFinish,
        quantity,
        description,
        customer_email: email
      });

      // Create print request
      await axios.post(`${API}/print-requests`, {
        model_id: modelResponse.data.id,
        customer_email: email,
        customer_name: name,
        customer_phone: phone,
        notes: description
      });

      toast.success('Anfrage erfolgreich gesendet! Wir melden uns bald.');
      
      // Reset form
      setShape('cube');
      setDimensions({ width: 10, height: 10, depth: 10 });
      setQuantity(1);
      setDescription('');
      setEmail('');
      setName('');
      setPhone('');
    } catch (error) {
      console.error('Error submitting:', error);
      toast.error('Fehler beim Senden der Anfrage');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            3D <span className="text-[#2c7a7b]">Konfigurator</span>
          </h1>
          <p className="text-xl text-slate-600">
            Erstellen Sie Ihr individuelles 3D-Modell für die Galvanisierung
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* 3D Preview */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-slate-300 mb-6">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-4">3D Vorschau</h3>
                <div 
                  className="relative w-full aspect-square bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl flex items-center justify-center border-2 border-slate-200"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientY - rect.top) / rect.height - 0.5) * 30;
                    const y = ((e.clientX - rect.left) / rect.width - 0.5) * -30;
                    setRotation({ x, y });
                  }}
                  onMouseLeave={() => setRotation({ x: 0, y: 0 })}
                >
                  <div 
                    className="transition-transform duration-300 ease-out"
                    style={{
                      transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                      transformStyle: 'preserve-3d'
                    }}
                  >
                    {shape === 'cube' && (
                      <div 
                        className="rounded-xl shadow-2xl"
                        style={{
                          width: `${Math.min(dimensions.width * 10, 300)}px`,
                          height: `${Math.min(dimensions.height * 10, 300)}px`,
                          background: currentMetal ? `linear-gradient(135deg, ${currentMetal.color} 0%, ${currentMetal.color}cc 100%)` : '#cbd5e1',
                          boxShadow: currentMetal ? `0 20px 60px ${currentMetal.color}66` : '0 20px 60px rgba(0,0,0,0.2)'
                        }}
                      >
                        <div className="w-full h-full rounded-xl bg-gradient-to-br from-white/30 to-transparent"></div>
                      </div>
                    )}
                    {shape === 'cylinder' && (
                      <div 
                        className="rounded-full shadow-2xl"
                        style={{
                          width: `${Math.min(dimensions.radius * 20, 300)}px`,
                          height: `${Math.min(dimensions.height * 10, 300)}px`,
                          background: currentMetal ? `linear-gradient(135deg, ${currentMetal.color} 0%, ${currentMetal.color}cc 100%)` : '#cbd5e1',
                          boxShadow: currentMetal ? `0 20px 60px ${currentMetal.color}66` : '0 20px 60px rgba(0,0,0,0.2)',
                          borderRadius: '50% / 20%'
                        }}
                      >
                        <div className="w-full h-full bg-gradient-to-br from-white/30 to-transparent" style={{ borderRadius: '50% / 20%' }}></div>
                      </div>
                    )}
                    {shape === 'sphere' && (
                      <div 
                        className="rounded-full shadow-2xl"
                        style={{
                          width: `${Math.min(dimensions.radius * 20, 300)}px`,
                          height: `${Math.min(dimensions.radius * 20, 300)}px`,
                          background: currentMetal ? `radial-gradient(circle at 30% 30%, ${currentMetal.color}ff, ${currentMetal.color}aa)` : '#cbd5e1',
                          boxShadow: currentMetal ? `0 20px 60px ${currentMetal.color}66, inset -10px -10px 30px rgba(0,0,0,0.2)` : '0 20px 60px rgba(0,0,0,0.2)'
                        }}
                      >
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-white/40 to-transparent"></div>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
                    <p className="text-sm text-slate-700 font-semibold">
                      {currentMetal?.name} {selectedFinish && `- ${selectedFinish}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Chat Toggle */}
            <Button
              onClick={() => setShowChat(!showChat)}
              className="w-full bg-[#2c7a7b] hover:bg-[#285e61] text-white mb-6"
              size="lg"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              {showChat ? 'Chat schließen' : 'KI-Berater öffnen'}
            </Button>

            {showChat && (
              <div className="h-[500px]">
                <AIChat sessionId={chatSessionId} />
              </div>
            )}
          </div>

          {/* Configuration Form */}
          <div>
            <Card className="bg-white border-slate-300">
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold text-slate-800 mb-6">Konfiguration</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Shape Selection */}
                  <div>
                    <Label className="text-slate-800 mb-3 block font-semibold">Form *</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {shapes.map((s) => {
                        const Icon = s.icon;
                        return (
                          <Button
                            key={s.id}
                            type="button"
                            variant={shape === s.id ? 'default' : 'outline'}
                            className={shape === s.id ? 'bg-[#2c7a7b] hover:bg-[#285e61]' : 'border-slate-300'}
                            onClick={() => {
                              setShape(s.id);
                              setDimensions(s.id === 'cube' ? { width: 10, height: 10, depth: 10 } : s.id === 'cylinder' ? { radius: 5, height: 10 } : { radius: 5 });
                            }}
                          >
                            <Icon className="h-5 w-5" />
                          </Button>
                        );
                      })}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">{currentShape?.name}</p>
                  </div>

                  {/* Dimensions */}
                  <div>
                    <Label className="text-slate-800 mb-3 block font-semibold">Maße (cm) *</Label>
                    <div className="space-y-3">
                      {currentShape?.fields.map((field) => (
                        <div key={field}>
                          <Label htmlFor={field} className="text-sm text-slate-600 capitalize">
                            {field === 'width' ? 'Breite' : field === 'height' ? 'Höhe' : field === 'depth' ? 'Tiefe' : 'Radius'}
                          </Label>
                          <Input
                            id={field}
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={dimensions[field] || ''}
                            onChange={(e) => handleDimensionChange(field, e.target.value)}
                            className="bg-white border-slate-300"
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Metal Selection */}
                  <div>
                    <Label className="text-slate-800 mb-2 block font-semibold">Metall *</Label>
                    <Select value={selectedMetal} onValueChange={(value) => {
                      setSelectedMetal(value);
                      const metal = metals.find(m => m.symbol === value);
                      setSelectedFinish(metal?.finishes[0]?.name || '');
                    }}>
                      <SelectTrigger className="bg-white border-slate-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {metals.map((metal) => (
                          <SelectItem key={metal.symbol} value={metal.symbol}>
                            {metal.name} ({metal.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Finish Selection */}
                  {currentMetal && currentMetal.finishes.length > 1 && (
                    <div>
                      <Label className="text-slate-800 mb-2 block font-semibold">Bearbeitung</Label>
                      <Select value={selectedFinish} onValueChange={setSelectedFinish}>
                        <SelectTrigger className="bg-white border-slate-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {currentMetal.finishes.map((finish) => (
                            <SelectItem key={finish.id} value={finish.name}>
                              {finish.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Quantity */}
                  <div>
                    <Label htmlFor="quantity" className="text-slate-800 mb-2 block font-semibold">Stückzahl *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="bg-white border-slate-300"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor="description" className="text-slate-800 mb-2 block font-semibold">Beschreibung</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Besondere Anforderungen..."
                      className="bg-white border-slate-300 min-h-20"
                    />
                  </div>

                  {/* Contact Information */}
                  <div className="border-t border-slate-200 pt-6">
                    <h4 className="text-lg font-semibold text-slate-800 mb-4">Kontaktdaten</h4>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="name" className="text-slate-800 mb-1 block">Name *</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="bg-white border-slate-300"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-slate-800 mb-1 block">E-Mail *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-white border-slate-300"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-slate-800 mb-1 block">Telefon (optional)</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="bg-white border-slate-300"
                        />
                      </div>
                    </div>
                  </div>

                  <Alert className="bg-blue-50 border-blue-300">
                    <Info className="h-5 w-5 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-sm">
                      Ihre Anfrage wird an unser Partner-Unternehmen für 3D-Druck weitergeleitet.
                    </AlertDescription>
                  </Alert>

                  <Button 
                    type="submit" 
                    className="w-full bg-[#2c7a7b] hover:bg-[#285e61] text-white py-6 text-lg"
                  >
                    <Send className="h-5 w-5 mr-2" />
                    Anfrage senden
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreeDConfigurator;
