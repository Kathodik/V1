import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Upload, Send, Sparkles, Image as ImageIcon, X, Info, CheckCircle2, Loader2 } from 'lucide-react';
import { AnimateOnScroll } from '../components/AnimateOnScroll';
import { useParallax } from '../hooks/useScrollAnimation';
import { metals } from '../data/mockData';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AIThreeDConfigurator = () => {
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Willkommen beim KI-gesteuerten 3D-Konfigurator! Beschreiben Sie mir das Teil, das Sie galvanisieren möchten. Sie können auch Bilder hochladen, um mir zu zeigen, was Sie sich vorstellen.' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploaded3DFiles, setUploaded3DFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentConfig, setCurrentConfig] = useState(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [sessionId] = useState(`ai-3d-config-${Date.now()}`);
  const fileInputRef = useRef(null);
  const modelFileInputRef = useRef(null);
  const scrollY = useParallax();

  const [contactInfo, setContactInfo] = useState({ name: '', email: '', phone: '' });
  const [showContactForm, setShowContactForm] = useState(false);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + uploadedImages.length > 5) { toast.error('Maximal 5 Bilder erlaubt'); return; }
    const newImages = files.map(file => ({ file, url: URL.createObjectURL(file), name: file.name }));
    setUploadedImages([...uploadedImages, ...newImages]);
    toast.success(`${files.length} Bild(er) hinzugefügt`);
  };

  const handle3DFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + uploaded3DFiles.length > 3) { toast.error('Maximal 3 3D-Dateien erlaubt'); return; }
    const validExtensions = ['.stl', '.obj', '.step', '.stp', '.iges', '.igs', '.3mf'];
    const invalidFiles = files.filter(file => !validExtensions.includes('.' + file.name.split('.').pop().toLowerCase()));
    if (invalidFiles.length > 0) { toast.error('Nur STL, OBJ, STEP, IGES oder 3MF Dateien erlaubt'); return; }
    const newFiles = files.map(file => ({ file, name: file.name, size: (file.size / 1024 / 1024).toFixed(2) + ' MB' }));
    setUploaded3DFiles([...uploaded3DFiles, ...newFiles]);
    toast.success(`${files.length} 3D-Datei(en) hinzugefügt`);
  };

  const remove3DFile = (index) => { const f = [...uploaded3DFiles]; f.splice(index, 1); setUploaded3DFiles(f); };
  const removeImage = (index) => { const imgs = [...uploadedImages]; URL.revokeObjectURL(imgs[index].url); imgs.splice(index, 1); setUploadedImages(imgs); };

  const sendMessage = async () => {
    if (!userInput.trim() && uploadedImages.length === 0) return;
    const userMessage = userInput.trim();
    const newMessages = [...chatMessages, { role: 'user', content: userMessage || `[${uploadedImages.length} Bild(er) hochgeladen]`, images: uploadedImages.length }];
    setChatMessages(newMessages);
    setUserInput('');
    setLoading(true);
    try {
      let aiPrompt = userMessage;
      if (uploaded3DFiles.length > 0) aiPrompt += `\n\n[Hinweis: Der Kunde hat ${uploaded3DFiles.length} 3D-Modelldatei(en) hochgeladen: ${uploaded3DFiles.map(f => f.name).join(', ')}.]`;

      // Convert first image to base64 if available
      let imageData = null;
      if (uploadedImages.length > 0) {
        try {
          const imgFile = uploadedImages[0].file;
          imageData = await fileToBase64(imgFile);
          aiPrompt += '\n\n[Ein Bild wurde hochgeladen. Bitte analysiere es.]';
        } catch (imgErr) {
          console.error('Image conversion error:', imgErr);
          aiPrompt += `\n\n[Hinweis: Der Kunde hat ${uploadedImages.length} Bild(er) hochgeladen, konnte aber nicht verarbeitet werden.]`;
        }
      }

      const response = await axios.post(`${API}/chat`, {
        session_id: sessionId,
        message: aiPrompt,
        image_data: imageData
      });
      const aiResponse = response.data.response;
      const config = extractConfiguration(userMessage, aiResponse);
      if (config) setCurrentConfig(prev => ({ ...prev, ...config }));
      setChatMessages([...newMessages, { role: 'assistant', content: aiResponse, config }]);
      if (config && config.readyForSubmission) setShowContactForm(true);
    } catch (error) {
      setChatMessages([...newMessages, { role: 'assistant', content: 'Entschuldigung, es gab einen Fehler. Können Sie Ihre Anfrage bitte wiederholen?' }]);
      toast.error('Fehler bei der Kommunikation mit der KI');
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const extractConfiguration = (userMsg, aiResponse) => {
    // Check user message FIRST for metal preference, then AI response
    const userLower = (userMsg || '').toLowerCase();
    const aiLower = aiResponse.toLowerCase();
    let config = {};

    // Detect shape
    const combined = userLower + ' ' + aiLower;
    if (combined.includes('würfel') || combined.includes('quader') || combined.includes('rechteck')) config.shape = 'cube';
    else if (combined.includes('zylinder') || combined.includes('rohr')) config.shape = 'cylinder';
    else if (combined.includes('kugel') || combined.includes('sphäre') || combined.includes('ring')) config.shape = 'sphere';

    // Detect metal – user message takes priority
    let foundInUser = false;
    metals.forEach(metal => {
      const nameL = metal.name.toLowerCase();
      const symL = metal.symbol.toLowerCase();
      if (userLower.includes(nameL) || userLower === symL || userLower.includes(' ' + symL + ' ')) {
        config.metal = metal.symbol;
        config.metalName = metal.name;
        config.metalColor = metal.color;
        foundInUser = true;
      }
    });
    // Only check AI response if user didn't specify
    if (!foundInUser) {
      metals.forEach(metal => {
        const nameL = metal.name.toLowerCase();
        // Only match full word mentions in AI response to avoid false positives
        const regex = new RegExp('\\b' + nameL + '\\b');
        if (regex.test(aiLower)) {
          config.metal = metal.symbol;
          config.metalName = metal.name;
          config.metalColor = metal.color;
        }
      });
    }

    if (config.shape && config.metal) config.readyForSubmission = true;
    return Object.keys(config).length > 0 ? config : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentConfig) { toast.error('Bitte konfigurieren Sie Ihr Teil zuerst mit der KI'); return; }
    if (!contactInfo.name || !contactInfo.email) { toast.error('Bitte füllen Sie alle Pflichtfelder aus'); return; }
    try {
      const modelResponse = await axios.post(`${API}/3d-models`, {
        shape: currentConfig.shape || 'custom', dimensions: currentConfig.dimensions || {},
        material: currentConfig.metal || 'Zn', finish: currentConfig.finish || 'Standard',
        quantity: currentConfig.quantity || 1,
        description: `KI-generiertes Modell: ${chatMessages.map(m => m.content).join(' | ')}`,
        customer_email: contactInfo.email
      });
      await axios.post(`${API}/print-requests`, {
        model_id: modelResponse.data.id, customer_email: contactInfo.email,
        customer_name: contactInfo.name, customer_phone: contactInfo.phone,
        notes: `KI-Konfiguration mit ${uploadedImages.length} Bild(ern)`
      });
      toast.success('Anfrage erfolgreich gesendet! Wir melden uns bald.');
      setChatMessages([{ role: 'assistant', content: 'Vielen Dank für Ihre Anfrage! Möchten Sie ein weiteres Teil konfigurieren?' }]);
      setCurrentConfig(null); setUploadedImages([]); setContactInfo({ name: '', email: '', phone: '' }); setShowContactForm(false);
    } catch (error) {
      toast.error('Fehler beim Senden der Anfrage');
    }
  };

  const handleKeyPress = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white" style={{ transform: `translateY(${scrollY * 0.1}px)` }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-[0.04]" style={{ background: 'radial-gradient(circle, #2c7a7b 0%, transparent 70%)' }} />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimateOnScroll variant="fadeUp" duration="slow">
            <div className="text-center">
              <p className="text-sm font-semibold tracking-[0.2em] uppercase text-[#2c7a7b] mb-4">KI-gestützt</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 mb-4 flex items-center justify-center gap-3" data-testid="configurator-heading">
                <Sparkles className="h-10 w-10 text-[#2c7a7b]" />
                3D-Konfigurator
              </h1>
              <p className="text-lg text-slate-500 max-w-xl mx-auto">
                Beschreiben Sie Ihr gewünschtes Teil – unsere KI hilft Ihnen bei der Konfiguration
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Main content */}
      <section className="pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* 3D Preview */}
            <AnimateOnScroll variant="fadeRight" duration="normal">
              <Card className="bg-white border border-slate-200 shadow-lg sticky top-24">
                <CardHeader><CardTitle className="text-center text-slate-800">3D Vorschau</CardTitle></CardHeader>
                <CardContent className="p-6">
                  <div
                    className="relative w-full aspect-square bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl flex items-center justify-center border border-slate-200"
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setRotation({ x: ((e.clientY - rect.top) / rect.height - 0.5) * 30, y: ((e.clientX - rect.left) / rect.width - 0.5) * -30 });
                    }}
                    onMouseLeave={() => setRotation({ x: 0, y: 0 })}
                  >
                    {currentConfig ? (
                      <div className="transition-transform duration-300 ease-out" style={{ transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`, transformStyle: 'preserve-3d' }}>
                        <div
                          className={`shadow-2xl ${currentConfig.shape === 'sphere' ? 'w-40 h-40 rounded-full' : currentConfig.shape === 'cylinder' ? 'w-32 h-48' : 'w-40 h-40 rounded-xl'}`}
                          style={{
                            background: currentConfig.shape === 'sphere'
                              ? `radial-gradient(circle at 30% 30%, ${currentConfig.metalColor || '#cbd5e1'}ff, ${currentConfig.metalColor || '#cbd5e1'}aa)`
                              : `linear-gradient(135deg, ${currentConfig.metalColor || '#cbd5e1'} 0%, ${currentConfig.metalColor || '#cbd5e1'}cc 100%)`,
                            boxShadow: `0 20px 60px ${currentConfig.metalColor || '#cbd5e1'}66`,
                            borderRadius: currentConfig.shape === 'cylinder' ? '50% / 20%' : undefined
                          }}
                        >
                          <div className="w-full h-full bg-gradient-to-br from-white/30 to-transparent" style={{ borderRadius: 'inherit' }} />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-slate-400">
                        <Sparkles className="h-16 w-16 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Beschreiben Sie Ihr Teil</p>
                      </div>
                    )}
                  </div>
                  {currentConfig && (
                    <div className="mt-6">
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <AlertDescription className="text-green-800">
                          <strong>Konfiguration erkannt:</strong>
                          <ul className="mt-2 text-sm space-y-1">
                            {currentConfig.shape && <li>Form: {currentConfig.shape === 'cube' ? 'Würfel' : currentConfig.shape === 'cylinder' ? 'Zylinder' : 'Kugel'}</li>}
                            {currentConfig.metalName && <li>Metall: {currentConfig.metalName}</li>}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimateOnScroll>

            {/* AI Chat Interface */}
            <div className="lg:col-span-2">
              <AnimateOnScroll variant="fadeLeft" duration="normal" delay={150}>
                <Card className="bg-white border border-slate-200 shadow-lg flex flex-col" style={{ height: '700px' }}>
                  <CardHeader className="border-b border-slate-100">
                    <CardTitle className="flex items-center space-x-2 text-slate-800">
                      <Sparkles className="h-5 w-5 text-[#2c7a7b]" />
                      <span>KI-Assistent</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col p-0">
                    <div className="flex-1 overflow-y-auto p-6 space-y-4" data-testid="chat-messages">
                      {chatMessages.map((message, index) => (
                        <div key={index} className={`flex items-start space-x-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                          {message.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-[#2c7a7b]/10 flex items-center justify-center flex-shrink-0">
                              <Sparkles className="h-5 w-5 text-[#2c7a7b]" />
                            </div>
                          )}
                          <div className={`max-w-[80%] rounded-lg p-4 ${message.role === 'user' ? 'bg-[#2c7a7b] text-white' : 'bg-slate-50 text-slate-800 border border-slate-100'}`}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            {message.images > 0 && <p className="text-xs mt-2 opacity-75">{message.images} Bild(er) angehängt</p>}
                          </div>
                        </div>
                      ))}
                      {loading && (
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 rounded-full bg-[#2c7a7b]/10 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="h-5 w-5 text-[#2c7a7b]" />
                          </div>
                          <div className="bg-slate-50 border border-slate-100 rounded-lg p-4">
                            <Loader2 className="h-5 w-5 animate-spin text-[#2c7a7b]" />
                          </div>
                        </div>
                      )}
                    </div>

                    {uploadedImages.length > 0 && (
                      <div className="px-6 py-3 border-t border-slate-100 bg-slate-50">
                        <div className="flex items-center space-x-2 overflow-x-auto">
                          {uploadedImages.map((image, index) => (
                            <div key={index} className="relative flex-shrink-0">
                              <img src={image.url} alt={`Upload ${index + 1}`} className="w-20 h-20 object-cover rounded border border-slate-200" />
                              <button onClick={() => removeImage(index)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"><X className="h-4 w-4" /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="border-t border-slate-100 p-4">
                      {uploaded3DFiles.length > 0 && (
                        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs font-semibold text-blue-800 mb-2">3D-Modelldateien:</p>
                          {uploaded3DFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-white p-2 rounded border border-blue-200 mb-1">
                              <span className="text-xs text-slate-700">{file.name} ({file.size})</span>
                              <button onClick={() => remove3DFile(index)} className="text-red-500 hover:text-red-700"><X className="h-4 w-4" /></button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-end space-x-2">
                        <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} className="flex-shrink-0 border-slate-200" title="Bilder hochladen"><ImageIcon className="h-5 w-5" /></Button>
                        <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                        <Button type="button" variant="outline" size="icon" onClick={() => modelFileInputRef.current?.click()} className="flex-shrink-0 border-slate-200 bg-blue-50" title="3D-Modell hochladen"><Upload className="h-5 w-5 text-blue-600" /></Button>
                        <input ref={modelFileInputRef} type="file" multiple accept=".stl,.obj,.step,.stp,.iges,.igs,.3mf" onChange={handle3DFileUpload} className="hidden" />
                        <textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Beschreiben Sie Ihr Teil..." className="flex-1 min-h-[60px] max-h-32 px-4 py-3 border border-slate-200 rounded-lg resize-none focus:outline-none focus:border-[#2c7a7b] text-sm" disabled={loading} data-testid="chat-input" />
                        <Button onClick={sendMessage} disabled={loading || (!userInput.trim() && uploadedImages.length === 0 && uploaded3DFiles.length === 0)} className="flex-shrink-0 bg-[#2c7a7b] hover:bg-[#285e61] text-white rounded-full" size="icon" data-testid="chat-send-btn"><Send className="h-5 w-5" /></Button>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">Tipp: Laden Sie 3D-Dateien hoch (STL, OBJ, STEP) oder beschreiben Sie Form, Größe und Material</p>
                    </div>
                  </CardContent>
                </Card>
              </AnimateOnScroll>

              {showContactForm && (
                <AnimateOnScroll variant="fadeUp" duration="normal">
                  <Card className="bg-white border border-slate-200 shadow-lg mt-6">
                    <CardHeader><CardTitle className="text-slate-800">Kontaktdaten & Anfrage absenden</CardTitle></CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Name *</Label>
                          <Input id="name" value={contactInfo.name} onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })} className="bg-white border-slate-200" required data-testid="config-name" />
                        </div>
                        <div>
                          <Label htmlFor="email">E-Mail *</Label>
                          <Input id="email" type="email" value={contactInfo.email} onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })} className="bg-white border-slate-200" required data-testid="config-email" />
                        </div>
                        <div>
                          <Label htmlFor="phone">Telefon (optional)</Label>
                          <Input id="phone" type="tel" value={contactInfo.phone} onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })} className="bg-white border-slate-200" data-testid="config-phone" />
                        </div>
                        <Button type="submit" className="w-full bg-[#2c7a7b] hover:bg-[#285e61] text-white py-6 text-lg rounded-full" data-testid="config-submit-btn">
                          <Send className="h-5 w-5 mr-2" /> Anfrage absenden
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </AnimateOnScroll>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AIThreeDConfigurator;
