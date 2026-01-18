import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Upload, Send, Sparkles, Image as ImageIcon, X, Info, CheckCircle2, Loader2 } from 'lucide-react';
import { metals } from '../data/mockData';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AIThreeDConfigurator = () => {
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content: 'Willkommen beim KI-gesteuerten 3D-Konfigurator! Beschreiben Sie mir das Teil, das Sie galvanisieren möchten. Sie können auch Bilder hochladen, um mir zu zeigen, was Sie sich vorstellen. Ich helfe Ihnen, das perfekte Modell zu erstellen!'
    }
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

  // Contact info for final submission
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [showContactForm, setShowContactForm] = useState(false);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + uploadedImages.length > 5) {
      toast.error('Maximal 5 Bilder erlaubt');
      return;
    }

    const newImages = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }));

    setUploadedImages([...uploadedImages, ...newImages]);
    toast.success(`${files.length} Bild(er) hinzugefügt`);
  };

  const handle3DFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + uploaded3DFiles.length > 3) {
      toast.error('Maximal 3 3D-Dateien erlaubt');
      return;
    }

    const validExtensions = ['.stl', '.obj', '.step', '.stp', '.iges', '.igs', '.3mf'];
    const invalidFiles = files.filter(file => {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      return !validExtensions.includes(ext);
    });

    if (invalidFiles.length > 0) {
      toast.error('Nur STL, OBJ, STEP, IGES oder 3MF Dateien erlaubt');
      return;
    }

    const newFiles = files.map(file => ({
      file,
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
    }));

    setUploaded3DFiles([...uploaded3DFiles, ...newFiles]);
    toast.success(`${files.length} 3D-Datei(en) hinzugefügt`);
  };

  const remove3DFile = (index) => {
    const newFiles = [...uploaded3DFiles];
    newFiles.splice(index, 1);
    setUploaded3DFiles(newFiles);
  };

  const removeImage = (index) => {
    const newImages = [...uploadedImages];
    URL.revokeObjectURL(newImages[index].url);
    newImages.splice(index, 1);
    setUploadedImages(newImages);
  };

  const sendMessage = async () => {
    if (!userInput.trim() && uploadedImages.length === 0) return;

    const userMessage = userInput.trim();
    const imageCount = uploadedImages.length;

    // Add user message
    const newMessages = [
      ...chatMessages,
      {
        role: 'user',
        content: userMessage || `[${imageCount} Bild(er) hochgeladen]`,
        images: uploadedImages.length
      }
    ];
    setChatMessages(newMessages);
    setUserInput('');
    setLoading(true);

    try {
      // Build comprehensive message for AI
      let aiPrompt = userMessage;
      if (uploadedImages.length > 0) {
        aiPrompt += `\n\n[Hinweis: Der Kunde hat ${uploadedImages.length} Bild(er) hochgeladen, um sein gewünschtes Teil zu zeigen.]`;
      }

      // Send to AI
      const response = await axios.post(`${API}/chat`, {
        session_id: sessionId,
        message: aiPrompt
      });

      const aiResponse = response.data.response;

      // Try to extract configuration from AI response
      const config = extractConfiguration(aiResponse);
      if (config) {
        setCurrentConfig(config);
      }

      // Add AI response
      setChatMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: aiResponse,
          config: config
        }
      ]);

      // Check if AI suggests moving to contact form
      if (config && config.readyForSubmission) {
        setShowContactForm(true);
      }

    } catch (error) {
      console.error('Error:', error);
      setChatMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Entschuldigung, es gab einen Fehler. Können Sie Ihre Anfrage bitte wiederholen?'
        }
      ]);
      toast.error('Fehler bei der Kommunikation mit der KI');
    } finally {
      setLoading(false);
    }
  };

  const extractConfiguration = (aiResponse) => {
    // Simple pattern matching to extract configuration
    // In production, you'd want a more sophisticated approach
    const lowerResponse = aiResponse.toLowerCase();
    
    let config = {};
    
    // Try to extract shape
    if (lowerResponse.includes('würfel') || lowerResponse.includes('quader') || lowerResponse.includes('rechteck')) {
      config.shape = 'cube';
    } else if (lowerResponse.includes('zylinder') || lowerResponse.includes('rohr')) {
      config.shape = 'cylinder';
    } else if (lowerResponse.includes('kugel') || lowerResponse.includes('sphäre')) {
      config.shape = 'sphere';
    }

    // Try to extract metal
    metals.forEach(metal => {
      if (lowerResponse.includes(metal.name.toLowerCase()) || lowerResponse.includes(metal.symbol.toLowerCase())) {
        config.metal = metal.symbol;
        config.metalName = metal.name;
        config.metalColor = metal.color;
      }
    });

    // Check if configuration seems complete
    if (config.shape && config.metal) {
      config.readyForSubmission = true;
    }

    return Object.keys(config).length > 0 ? config : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentConfig) {
      toast.error('Bitte konfigurieren Sie Ihr Teil zuerst mit der KI');
      return;
    }

    if (!contactInfo.name || !contactInfo.email) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    try {
      // Create 3D model
      const modelResponse = await axios.post(`${API}/3d-models`, {
        shape: currentConfig.shape || 'custom',
        dimensions: currentConfig.dimensions || {},
        material: currentConfig.metal || 'Zn',
        finish: currentConfig.finish || 'Standard',
        quantity: currentConfig.quantity || 1,
        description: `KI-generiertes Modell: ${chatMessages.map(m => m.content).join(' | ')}`,
        customer_email: contactInfo.email
      });

      // Create print request
      await axios.post(`${API}/print-requests`, {
        model_id: modelResponse.data.id,
        customer_email: contactInfo.email,
        customer_name: contactInfo.name,
        customer_phone: contactInfo.phone,
        notes: `KI-Konfiguration mit ${uploadedImages.length} Bild(ern)`
      });

      toast.success('Anfrage erfolgreich gesendet! Wir melden uns bald.');
      
      // Reset
      setChatMessages([{
        role: 'assistant',
        content: 'Vielen Dank für Ihre Anfrage! Möchten Sie ein weiteres Teil konfigurieren?'
      }]);
      setCurrentConfig(null);
      setUploadedImages([]);
      setContactInfo({ name: '', email: '', phone: '' });
      setShowContactForm(false);

    } catch (error) {
      console.error('Error submitting:', error);
      toast.error('Fehler beim Senden der Anfrage');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 py-20 pb-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 mb-4">
            <Sparkles className="h-8 w-8 text-[#2c7a7b]" />
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800">
              KI-Gestützter <span className="text-[#2c7a7b]">3D-Konfigurator</span>
            </h1>
          </div>
          <p className="text-xl text-slate-600">
            Beschreiben Sie Ihr gewünschtes Teil – unsere KI hilft Ihnen bei der Konfiguration
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* 3D Preview */}
          <div className="lg:col-span-1">
            <Card className="bg-white border-slate-300 sticky top-24">
              <CardHeader>
                <CardTitle className="text-center">3D Vorschau</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
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
                  {currentConfig ? (
                    <div 
                      className="transition-transform duration-300 ease-out"
                      style={{
                        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                        transformStyle: 'preserve-3d'
                      }}
                    >
                      {/* Render based on shape */}
                      {currentConfig.shape === 'cube' && (
                        <div 
                          className="w-40 h-40 rounded-xl shadow-2xl"
                          style={{
                            background: `linear-gradient(135deg, ${currentConfig.metalColor || '#cbd5e1'} 0%, ${currentConfig.metalColor || '#cbd5e1'}cc 100%)`,
                            boxShadow: `0 20px 60px ${currentConfig.metalColor || '#cbd5e1'}66`
                          }}
                        >
                          <div className="w-full h-full rounded-xl bg-gradient-to-br from-white/30 to-transparent"></div>
                        </div>
                      )}
                      {currentConfig.shape === 'cylinder' && (
                        <div 
                          className="w-32 h-48 rounded-full shadow-2xl"
                          style={{
                            background: `linear-gradient(135deg, ${currentConfig.metalColor || '#cbd5e1'} 0%, ${currentConfig.metalColor || '#cbd5e1'}cc 100%)`,
                            boxShadow: `0 20px 60px ${currentConfig.metalColor || '#cbd5e1'}66`,
                            borderRadius: '50% / 20%'
                          }}
                        >
                          <div className="w-full h-full bg-gradient-to-br from-white/30 to-transparent" style={{ borderRadius: '50% / 20%' }}></div>
                        </div>
                      )}
                      {currentConfig.shape === 'sphere' && (
                        <div 
                          className="w-40 h-40 rounded-full shadow-2xl"
                          style={{
                            background: `radial-gradient(circle at 30% 30%, ${currentConfig.metalColor || '#cbd5e1'}ff, ${currentConfig.metalColor || '#cbd5e1'}aa)`,
                            boxShadow: `0 20px 60px ${currentConfig.metalColor || '#cbd5e1'}66`
                          }}
                        >
                          <div className="w-full h-full rounded-full bg-gradient-to-br from-white/40 to-transparent"></div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-slate-400">
                      <Sparkles className="h-16 w-16 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Beschreiben Sie Ihr Teil</p>
                    </div>
                  )}
                </div>

                {/* Current Configuration */}
                {currentConfig && (
                  <div className="mt-6 space-y-2">
                    <Alert className="bg-green-50 border-green-300">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <AlertDescription className="text-green-800">
                        <strong>Konfiguration erkannt:</strong>
                        <ul className="mt-2 text-sm space-y-1">
                          {currentConfig.shape && (
                            <li>• Form: {currentConfig.shape === 'cube' ? 'Würfel' : currentConfig.shape === 'cylinder' ? 'Zylinder' : 'Kugel'}</li>
                          )}
                          {currentConfig.metalName && (
                            <li>• Metall: {currentConfig.metalName}</li>
                          )}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* AI Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-slate-300 flex flex-col" style={{ height: '700px' }}>
              <CardHeader className="border-b border-slate-200">
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-[#2c7a7b]" />
                  <span>KI-Assistent</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {chatMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex items-start space-x-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                    >
                      {message.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-[#2c7a7b]/10 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="h-5 w-5 text-[#2c7a7b]" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.role === 'user'
                            ? 'bg-[#2c7a7b] text-white'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        {message.images > 0 && (
                          <p className="text-xs mt-2 opacity-75">
                            📎 {message.images} Bild(er) angehängt
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {loading && (
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-[#2c7a7b]/10 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-5 w-5 text-[#2c7a7b]" />
                      </div>
                      <div className="bg-slate-100 rounded-lg p-4">
                        <Loader2 className="h-5 w-5 animate-spin text-[#2c7a7b]" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Uploaded Images Preview */}
                {uploadedImages.length > 0 && (
                  <div className="px-6 py-3 border-t border-slate-200 bg-slate-50">
                    <div className="flex items-center space-x-2 overflow-x-auto">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="relative flex-shrink-0">
                          <img 
                            src={image.url} 
                            alt={`Upload ${index + 1}`} 
                            className="w-20 h-20 object-cover rounded border-2 border-slate-300"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div className="border-t border-slate-200 p-4">
                  <div className="flex items-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-shrink-0 border-slate-300"
                    >
                      <ImageIcon className="h-5 w-5" />
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <textarea
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Beschreiben Sie Ihr gewünschtes Teil..."
                      className="flex-1 min-h-[60px] max-h-32 px-4 py-3 border-2 border-slate-300 rounded-lg resize-none focus:outline-none focus:border-[#2c7a7b]"
                      disabled={loading}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={loading || (!userInput.trim() && uploadedImages.length === 0)}
                      className="flex-shrink-0 bg-[#2c7a7b] hover:bg-[#285e61] text-white"
                      size="icon"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    💡 Tipp: Beschreiben Sie Form, Größe, Material und Verwendungszweck
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Form */}
            {showContactForm && (
              <Card className="bg-white border-slate-300 mt-6">
                <CardHeader>
                  <CardTitle>Kontaktdaten & Anfrage absenden</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={contactInfo.name}
                        onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                        className="bg-white border-slate-300"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">E-Mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={contactInfo.email}
                        onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                        className="bg-white border-slate-300"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefon (optional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={contactInfo.phone}
                        onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                        className="bg-white border-slate-300"
                      />
                    </div>
                    <Alert className="bg-blue-50 border-blue-300">
                      <Info className="h-5 w-5 text-blue-600" />
                      <AlertDescription className="text-blue-800 text-sm">
                        Ihre Konfiguration wird an unser Partner-Unternehmen für 3D-Druck gesendet.
                      </AlertDescription>
                    </Alert>
                    <Button 
                      type="submit" 
                      className="w-full bg-[#2c7a7b] hover:bg-[#285e61] text-white py-6 text-lg"
                    >
                      <Send className="h-5 w-5 mr-2" />
                      Anfrage absenden
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIThreeDConfigurator;
