import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Checkbox } from '../components/ui/checkbox';
import { Upload, Sparkles, Users, FileUp, Loader2, Image, Send, ArrowLeft, ArrowRight, CheckCircle2, Download } from 'lucide-react';
import { AnimateOnScroll } from '../components/AnimateOnScroll';
import { useParallax } from '../hooks/useScrollAnimation';
import { metals } from '../data/mockData';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const pathOptions = [
  {
    id: 'upload',
    icon: FileUp,
    title: 'Eigene Datei hochladen',
    desc: 'Sie haben bereits eine druckfertige 3D-Datei (STL, OBJ, STEP)',
    color: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    iconColor: 'text-blue-600 bg-blue-100'
  },
  {
    id: 'partner_model',
    icon: Users,
    title: 'Durch Partner modellieren',
    desc: 'Beschreiben Sie Ihr Produkt und unser Partner erstellt das 3D-Modell',
    color: 'bg-purple-50 border-purple-200 hover:border-purple-400',
    iconColor: 'text-purple-600 bg-purple-100'
  },
  {
    id: 'ai_generate',
    icon: Sparkles,
    title: 'Luigi – KI-Konzept generieren',
    desc: 'Beschreiben Sie Ihr Produkt und Luigi erstellt ein fotorealistisches Konzeptbild',
    color: 'bg-teal-50 border-teal-200 hover:border-teal-400',
    iconColor: 'text-teal-600 bg-teal-100'
  }
];

const AIThreeDConfigurator = () => {
  const scrollY = useParallax();
  const [step, setStep] = useState(1); // 1=choose path, 2=details, 3=AI generate/review, 4=contact, 5=done
  const [selectedPath, setSelectedPath] = useState(null);
  const [description, setDescription] = useState('');
  const [selectedMetal, setSelectedMetal] = useState('');
  const [selectedFinish, setSelectedFinish] = useState('');
  const [referenceImage, setReferenceImage] = useState(null);
  const [referencePreview, setReferencePreview] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [conceptImage, setConceptImage] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [contactData, setContactData] = useState({ name: '', email: '', phone: '' });
  const [showMetalPicker, setShowMetalPicker] = useState(false);
  const [agbAccepted, setAgbAccepted] = useState(false);

  const currentMetal = metals.find(m => m.name === selectedMetal);

  const handleReferenceUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setReferenceImage(ev.target.result);
      setReferencePreview(ev.target.result);
    };
    reader.readAsDataURL(file);
    toast.success('Referenzbild hochgeladen');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Datei zu groß (max. 50 MB)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadedFile(ev.target.result);
      setUploadedFileName(file.name);
    };
    reader.readAsDataURL(file);
    toast.success(`${file.name} hochgeladen`);
  };

  const handleGenerateConcept = async () => {
    if (!description.trim()) {
      toast.error('Bitte beschreiben Sie Ihr Produkt');
      return;
    }
    setGenerating(true);
    try {
      const res = await axios.post(`${API}/configurator/generate-concept`, {
        description: description,
        metal: selectedMetal || null,
        finish: selectedFinish || null,
        reference_image: referenceImage || null
      });
      setConceptImage(res.data.image_base64);
      toast.success('Konzeptbild erstellt!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Bildgenerierung fehlgeschlagen. Bitte versuchen Sie es erneut.');
    }
    setGenerating(false);
  };

  const handleSubmitOrder = async () => {
    if (!contactData.name || !contactData.email) {
      toast.error('Bitte Name und E-Mail angeben');
      return;
    }
    if (!agbAccepted) {
      toast.error('Bitte stimmen Sie den AGB und dem Haftungsausschluss zu');
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post(`${API}/configurator/order`, {
        order_type: selectedPath,
        name: contactData.name,
        email: contactData.email,
        phone: contactData.phone,
        description: description,
        metal: selectedMetal || null,
        finish: selectedFinish || null,
        file_data: uploadedFile || null,
        file_name: uploadedFileName || null,
        concept_image: conceptImage || null,
        reference_image: referenceImage || null
      });
      setOrderId(res.data.id);
      setOrderComplete(true);
      setStep(5);
      toast.success('Auftrag erfolgreich erstellt!');
    } catch (error) {
      toast.error('Fehler beim Erstellen des Auftrags');
    }
    setSubmitting(false);
  };

  const resetConfigurator = () => {
    setStep(1);
    setSelectedPath(null);
    setDescription('');
    setSelectedMetal('');
    setSelectedFinish('');
    setReferenceImage(null);
    setReferencePreview(null);
    setUploadedFile(null);
    setUploadedFileName('');
    setConceptImage(null);
    setOrderComplete(false);
    setOrderId('');
    setContactData({ name: '', email: '', phone: '' });
    setAgbAccepted(false);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white" style={{ transform: `translateY(${scrollY * 0.1}px)` }} />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimateOnScroll variant="fadeUp" duration="slow">
            <div className="text-center">
              <p className="text-sm font-semibold tracking-[0.2em] uppercase text-[#2c7a7b] mb-4">3D Konfigurator</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 mb-4" data-testid="configurator-heading">
                Ihr Produkt. Unsere Technik.
              </h1>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                Laden Sie Ihre eigene 3D-Datei hoch, lassen Sie ein Modell erstellen oder nutzen Sie unsere KI für ein fotorealistisches Konzept.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Progress Steps */}
      <section className="pb-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              {['Auswahl', 'Details', selectedPath === 'ai_generate' ? 'KI-Konzept' : 'Überprüfen', 'Kontakt', 'Fertig'].map((label, i) => (
                <div key={i} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    step > i + 1 ? 'bg-[#2c7a7b] text-white' :
                    step === i + 1 ? 'bg-[#2c7a7b] text-white ring-4 ring-[#2c7a7b]/20' :
                    'bg-slate-200 text-slate-500'
                  }`}>
                    {step > i + 1 ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className={`ml-2 text-xs font-medium hidden sm:block ${step >= i + 1 ? 'text-slate-800' : 'text-slate-400'}`}>{label}</span>
                  {i < 4 && <div className={`w-8 sm:w-16 h-0.5 mx-2 ${step > i + 1 ? 'bg-[#2c7a7b]' : 'bg-slate-200'}`} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">

            {/* Step 1: Choose Path */}
            {step === 1 && (
              <AnimateOnScroll variant="fadeUp">
                <div className="space-y-4">
                  {pathOptions.map((opt) => (
                    <Card
                      key={opt.id}
                      className={`cursor-pointer border-2 transition-all duration-300 ${
                        selectedPath === opt.id ? 'border-[#2c7a7b] bg-[#2c7a7b]/5 shadow-lg' : opt.color
                      }`}
                      onClick={() => setSelectedPath(opt.id)}
                      data-testid={`path-${opt.id}`}
                    >
                      <CardContent className="p-6 flex items-center space-x-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                          selectedPath === opt.id ? 'bg-[#2c7a7b] text-white' : opt.iconColor
                        }`}>
                          <opt.icon className="h-7 w-7" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-800">{opt.title}</h3>
                          <p className="text-sm text-slate-500 mt-1">{opt.desc}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button
                    onClick={() => selectedPath && setStep(2)}
                    disabled={!selectedPath}
                    className="w-full bg-[#2c7a7b] hover:bg-[#285e61] text-white py-6 text-lg rounded-full mt-6"
                    data-testid="next-step-1"
                  >
                    Weiter <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              </AnimateOnScroll>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
              <AnimateOnScroll variant="fadeUp">
                <Card className="border-slate-200 shadow-lg">
                  <CardContent className="p-8 space-y-6">
                    <h2 className="text-2xl font-bold text-slate-800">
                      {selectedPath === 'upload' ? 'Datei hochladen' :
                       selectedPath === 'mobile_service' ? 'Vor-Ort-Einsatz beschreiben' :
                       'Produkt beschreiben'}
                    </h2>

                    {/* File upload for "upload" path */}
                    {selectedPath === 'upload' && (
                      <div>
                        <Label className="text-slate-800 font-semibold mb-2 block">3D-Datei (STL, OBJ, STEP) *</Label>
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-[#2c7a7b] transition-colors">
                          <input type="file" accept=".stl,.obj,.step,.stp,.3mf" onChange={handleFileUpload} className="hidden" id="file-upload" />
                          <label htmlFor="file-upload" className="cursor-pointer">
                            {uploadedFileName ? (
                              <div>
                                <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-2" />
                                <p className="text-slate-800 font-semibold">{uploadedFileName}</p>
                                <p className="text-sm text-slate-500 mt-1">Klicken zum Ändern</p>
                              </div>
                            ) : (
                              <div>
                                <Upload className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                                <p className="text-slate-600 font-medium">Datei auswählen oder hierher ziehen</p>
                                <p className="text-xs text-slate-400 mt-1">STL, OBJ, STEP (max. 50 MB)</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Description for all paths */}
                    <div>
                      <Label className="text-slate-800 font-semibold mb-2 block">
                        {selectedPath === 'upload' ? 'Beschreibung / Anmerkungen' : 'Produktbeschreibung *'}
                      </Label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={selectedPath === 'upload' 
                          ? 'Besondere Anforderungen, gewünschte Beschichtung, etc.'
                          : selectedPath === 'mobile_service'
                          ? 'Beschreiben Sie den Einsatzort und die Arbeit: z.B. Oberflächenreparatur an einer Anlage, Kamin-Beschichtung, Größe der Fläche, Zugänglichkeit...'
                          : 'Beschreiben Sie Ihr Produkt so detailliert wie möglich: Form, Größe, Material, Verwendungszweck...'
                        }
                        className="bg-white border-slate-200 min-h-32"
                        data-testid="description-input"
                      />
                    </div>

                    {/* Metal selection */}
                    <div>
                      <Label className="text-slate-800 font-semibold mb-3 block">Metall-Beschichtung</Label>
                      <button
                        type="button"
                        onClick={() => setShowMetalPicker(true)}
                        className="w-full p-4 rounded-xl border-2 border-slate-200 hover:border-[#2c7a7b] bg-white text-left transition-all duration-200 flex items-center justify-between"
                        data-testid="metal-select-trigger"
                      >
                        {selectedMetal ? (
                          <span className="text-slate-800 font-medium">{selectedMetal}</span>
                        ) : (
                          <span className="text-slate-400">Metall wählen...</span>
                        )}
                        <ArrowRight className="h-4 w-4 text-slate-400" />
                      </button>
                    </div>

                    {/* Finish selection - only show for actual metals */}
                    {currentMetal && selectedMetal !== 'Keine Beschichtung' && (
                      <div>
                        <Label className="text-slate-800 font-semibold mb-3 block">Ausführung</Label>
                        <div className="flex flex-wrap gap-2">
                          {currentMetal.finishes.map(f => (
                            <button
                              type="button"
                              key={f.id}
                              onClick={() => setSelectedFinish(f.name)}
                              className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all duration-200 ${
                                selectedFinish === f.name
                                  ? 'border-[#2c7a7b] bg-[#2c7a7b] text-white shadow-md'
                                  : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white'
                              }`}
                              data-testid={`finish-${f.id}`}
                            >
                              {f.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Metal Picker Modal */}
                    {showMetalPicker && (
                      <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={() => setShowMetalPicker(false)} data-testid="metal-picker-modal">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
                          <h3 className="text-lg font-bold text-slate-800 mb-4">Metall-Beschichtung wählen</h3>
                          <div className="space-y-2">
                            <button
                              type="button"
                              onClick={() => { setSelectedMetal('Keine Beschichtung'); setSelectedFinish(''); setShowMetalPicker(false); }}
                              className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center space-x-3 ${
                                selectedMetal === 'Keine Beschichtung' ? 'border-[#2c7a7b] bg-[#2c7a7b]/5' : 'border-slate-200 hover:border-slate-300'
                              }`}
                              data-testid="metal-pick-none"
                            >
                              <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-400">—</span>
                              <span className="font-medium text-slate-800">Keine Beschichtung</span>
                            </button>
                            {metals.map(m => (
                              <button
                                type="button"
                                key={m.symbol}
                                onClick={() => { setSelectedMetal(m.name); setSelectedFinish(''); setShowMetalPicker(false); }}
                                className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center space-x-3 ${
                                  selectedMetal === m.name ? 'border-[#2c7a7b] bg-[#2c7a7b]/5' : 'border-slate-200 hover:border-slate-300'
                                }`}
                                data-testid={`metal-pick-${m.symbol}`}
                              >
                                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${m.color}20`, color: m.color }}>{m.symbol}</span>
                                <div>
                                  <span className="font-medium text-slate-800 block">{m.name}</span>
                                  <span className="text-xs text-slate-500">{m.description}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Reference image for non-upload paths */}
                    {selectedPath !== 'upload' && (
                      <div>
                        <Label className="text-slate-800 font-semibold mb-2 block">Referenzbild (optional)</Label>
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-[#2c7a7b] transition-colors">
                          <input type="file" accept="image/*" onChange={handleReferenceUpload} className="hidden" id="ref-upload" />
                          <label htmlFor="ref-upload" className="cursor-pointer">
                            {referencePreview ? (
                              <div>
                                <img src={referencePreview} alt="Referenz" className="max-h-40 mx-auto rounded-lg mb-2" />
                                <p className="text-sm text-slate-500">Klicken zum Ändern</p>
                              </div>
                            ) : (
                              <div>
                                <Image className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                                <p className="text-slate-600 text-sm">Referenzbild hochladen</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <Button variant="outline" onClick={() => setStep(1)} className="flex-1 py-6 rounded-full">
                        <ArrowLeft className="h-5 w-5 mr-2" /> Zurück
                      </Button>
                      <Button
                        onClick={() => setStep(3)}
                        disabled={selectedPath === 'upload' ? !uploadedFile : !description.trim()}
                        className="flex-1 bg-[#2c7a7b] hover:bg-[#285e61] text-white py-6 rounded-full"
                        data-testid="next-step-2"
                      >
                        Weiter <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </AnimateOnScroll>
            )}

            {/* Step 3: AI Generate / Review */}
            {step === 3 && (
              <AnimateOnScroll variant="fadeUp">
                <Card className="border-slate-200 shadow-lg">
                  <CardContent className="p-8 space-y-6">
                    {selectedPath === 'ai_generate' ? (
                      <>
                        <h2 className="text-2xl font-bold text-slate-800">Luigi – KI-Konzeptbild</h2>
                        <p className="text-slate-500 text-sm">
                          Basierend auf Ihrer Beschreibung erstellt Luigi ein fotorealistisches Konzeptbild.
                        </p>

                        {!conceptImage && !generating && (
                          <div className="bg-slate-50 rounded-2xl p-8 text-center">
                            <Sparkles className="h-12 w-12 text-[#2c7a7b] mx-auto mb-4" />
                            <p className="text-slate-700 font-medium mb-2">Luigi ist bereit</p>
                            <p className="text-sm text-slate-500 mb-6">"{description.slice(0, 100)}{description.length > 100 ? '...' : ''}"</p>
                            <Button
                              onClick={handleGenerateConcept}
                              className="bg-[#2c7a7b] hover:bg-[#285e61] text-white px-8 py-6 rounded-full text-lg"
                              data-testid="generate-concept-btn"
                            >
                              <Sparkles className="h-5 w-5 mr-2" /> Konzeptbild generieren
                            </Button>
                          </div>
                        )}

                        {generating && (
                          <div className="bg-slate-50 rounded-2xl p-12 text-center">
                            <Loader2 className="h-12 w-12 text-[#2c7a7b] animate-spin mx-auto mb-4" />
                            <p className="text-slate-700 font-medium">Luigi erstellt Ihr Konzeptbild...</p>
                            <p className="text-sm text-slate-500 mt-2">Dies kann bis zu 60 Sekunden dauern</p>
                          </div>
                        )}

                        {conceptImage && (
                          <div className="space-y-4">
                            <div className="bg-slate-50 rounded-2xl p-4">
                              <img
                                src={`data:image/png;base64,${conceptImage}`}
                                alt="KI-Konzeptbild"
                                className="w-full rounded-xl shadow-lg"
                                data-testid="concept-image"
                              />
                            </div>
                            <div className="flex gap-3">
                              <Button
                                variant="outline"
                                onClick={() => { setConceptImage(null); handleGenerateConcept(); }}
                                className="flex-1 py-4 rounded-full"
                              >
                                <Sparkles className="h-4 w-4 mr-2" /> Neu generieren
                              </Button>
                              <Button
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = `data:image/png;base64,${conceptImage}`;
                                  link.download = 'kathodik-konzept.png';
                                  link.click();
                                }}
                                variant="outline"
                                className="py-4 rounded-full"
                              >
                                <Download className="h-4 w-4 mr-2" /> Herunterladen
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <h2 className="text-2xl font-bold text-slate-800">Zusammenfassung</h2>
                        <div className="bg-slate-50 rounded-2xl p-6 space-y-3">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Auftragstyp</span>
                            <span className="font-semibold text-slate-800">{selectedPath === 'upload' ? 'Eigene Datei' : selectedPath === 'mobile_service' ? 'Mobile Dienstleistung' : 'Partner-Modellierung'}</span>
                          </div>
                          {uploadedFileName && (
                            <div className="flex justify-between">
                              <span className="text-slate-500">Datei</span>
                              <span className="font-semibold text-slate-800">{uploadedFileName}</span>
                            </div>
                          )}
                          {selectedMetal && (
                            <div className="flex justify-between">
                              <span className="text-slate-500">Metall</span>
                              <span className="font-semibold text-slate-800">{selectedMetal} {selectedFinish ? `- ${selectedFinish}` : ''}</span>
                            </div>
                          )}
                          {description && (
                            <div className="pt-2 border-t border-slate-200">
                              <span className="text-slate-500 text-sm block mb-1">Beschreibung</span>
                              <p className="text-slate-700 text-sm">{description}</p>
                            </div>
                          )}
                          {referencePreview && (
                            <div className="pt-2 border-t border-slate-200">
                              <span className="text-slate-500 text-sm block mb-1">Referenzbild</span>
                              <img src={referencePreview} alt="Referenz" className="max-h-32 rounded-lg" />
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    <div className="flex gap-3 pt-4">
                      <Button variant="outline" onClick={() => setStep(2)} className="flex-1 py-6 rounded-full">
                        <ArrowLeft className="h-5 w-5 mr-2" /> Zurück
                      </Button>
                      <Button
                        onClick={() => setStep(4)}
                        disabled={selectedPath === 'ai_generate' && !conceptImage}
                        className="flex-1 bg-[#2c7a7b] hover:bg-[#285e61] text-white py-6 rounded-full"
                        data-testid="next-step-3"
                      >
                        Auftrag absenden <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </AnimateOnScroll>
            )}

            {/* Step 4: Contact Details */}
            {step === 4 && (
              <AnimateOnScroll variant="fadeUp">
                <Card className="border-slate-200 shadow-lg">
                  <CardContent className="p-8 space-y-6">
                    <h2 className="text-2xl font-bold text-slate-800">Kontaktdaten</h2>
                    <p className="text-slate-500 text-sm">
                      Geben Sie Ihre Kontaktdaten ein, damit wir Sie bezüglich Ihres Auftrags kontaktieren können.
                    </p>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-slate-800 font-semibold mb-2 block">Name *</Label>
                        <Input
                          value={contactData.name}
                          onChange={(e) => setContactData({...contactData, name: e.target.value})}
                          placeholder="Ihr Name"
                          className="bg-white border-slate-200"
                          required
                          data-testid="order-name"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-800 font-semibold mb-2 block">E-Mail *</Label>
                        <Input
                          type="email"
                          value={contactData.email}
                          onChange={(e) => setContactData({...contactData, email: e.target.value})}
                          placeholder="ihre@email.de"
                          className="bg-white border-slate-200"
                          required
                          data-testid="order-email"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-800 font-semibold mb-2 block">Telefon</Label>
                        <Input
                          type="tel"
                          value={contactData.phone}
                          onChange={(e) => setContactData({...contactData, phone: e.target.value})}
                          placeholder="Optional"
                          className="bg-white border-slate-200"
                          data-testid="order-phone"
                        />
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-xl border border-slate-200" data-testid="agb-checkbox-area">
                      <Checkbox id="agb-configurator" checked={agbAccepted} onCheckedChange={setAgbAccepted} className="mt-0.5" data-testid="agb-checkbox" />
                      <Label htmlFor="agb-configurator" className="text-sm text-slate-700 cursor-pointer leading-relaxed">
                        Ich habe die <Link to="/agb" target="_blank" className="text-[#2c7a7b] font-semibold underline hover:text-[#285e61]">AGB und den Haftungsausschluss</Link> gelesen und akzeptiere diese. Mir ist insbesondere bekannt, dass keine Haftung für Mängel am Grundmaterial (z.B. Schlackeeinschlüsse) übernommen wird. *
                      </Label>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button variant="outline" onClick={() => setStep(3)} className="flex-1 py-6 rounded-full">
                        <ArrowLeft className="h-5 w-5 mr-2" /> Zurück
                      </Button>
                      <Button
                        onClick={handleSubmitOrder}
                        disabled={!contactData.name || !contactData.email || !agbAccepted || submitting}
                        className="flex-1 bg-[#2c7a7b] hover:bg-[#285e61] text-white py-6 rounded-full"
                        data-testid="submit-order"
                      >
                        {submitting ? (
                          <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Wird gesendet...</>
                        ) : (
                          <><Send className="h-5 w-5 mr-2" /> Auftrag absenden</>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </AnimateOnScroll>
            )}

            {/* Step 5: Confirmation */}
            {step === 5 && (
              <AnimateOnScroll variant="fadeUp">
                <Card className="border-green-200 bg-green-50 shadow-lg">
                  <CardContent className="p-12 text-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-slate-800 mb-3">Auftrag erfolgreich!</h2>
                    <p className="text-slate-600 mb-2">
                      Vielen Dank! Wir haben Ihren Auftrag erhalten und melden uns zeitnah.
                    </p>
                    <p className="text-sm text-slate-500 mb-8">
                      Auftrags-ID: <span className="font-mono font-semibold text-[#2c7a7b]">{orderId}</span>
                    </p>
                    <Button onClick={resetConfigurator} className="bg-[#2c7a7b] hover:bg-[#285e61] text-white px-8 py-6 rounded-full" data-testid="new-order-btn">
                      Neuen Auftrag erstellen
                    </Button>
                  </CardContent>
                </Card>
              </AnimateOnScroll>
            )}

          </div>
        </div>
      </section>
    </div>
  );
};

export default AIThreeDConfigurator;
