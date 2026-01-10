import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Upload, Package, Ruler, Info } from 'lucide-react';
import { metals, companyInfo } from '../data/mockData';
import { toast } from 'sonner';

const Services = () => {
  const [selectedMetal, setSelectedMetal] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMetalSelect = (metal) => {
    setSelectedMetal(metal);
    // Reset form
    setQuantity('');
    setDescription('');
    setImages([]);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      toast.error('Maximal 5 Bilder erlaubt');
      return;
    }
    const newImages = files.map(file => URL.createObjectURL(file));
    setImages([...images, ...newImages]);
    toast.success(`${files.length} Bild(er) hinzugefügt`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedMetal || !quantity || images.length === 0) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }
    toast.success('Anfrage erfolgreich übermittelt! Wir melden uns in Kürze.');
    // Reset form
    setSelectedMetal(null);
    setQuantity('');
    setDescription('');
    setImages([]);
  };

  return (
    <div className="min-h-screen bg-slate-900 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Wählen Sie Ihr <span className="text-teal-400">Metall</span>
          </h1>
          <p className="text-xl text-slate-400">
            Klicken Sie auf ein Element im Periodensystem
          </p>
        </div>

        {/* Periodic Table */}
        <div className="mb-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-w-6xl mx-auto">
            {metals.map((metal) => (
              <Card
                key={metal.symbol}
                className={`cursor-pointer transition-all duration-300 ${
                  selectedMetal?.symbol === metal.symbol
                    ? 'bg-teal-500/20 border-teal-400 scale-105 shadow-lg shadow-teal-500/30'
                    : 'bg-slate-800/50 border-slate-700 hover:border-teal-500/50 hover:scale-105'
                }`}
                onClick={() => handleMetalSelect(metal)}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-slate-400 mb-1">{metal.atomicNumber}</div>
                  <div className="text-3xl font-bold text-white mb-1">{metal.symbol}</div>
                  <div className="text-xs text-slate-400">{metal.name}</div>
                  <div 
                    className="w-full h-2 rounded-full mt-2" 
                    style={{ backgroundColor: metal.color }}
                  ></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Selected Metal Details & Form */}
        {selectedMetal && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* 3D Preview */}
            <div>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-4 text-center">
                    {selectedMetal.name}-Beschichtung
                  </h3>
                  <div 
                    className="relative w-full aspect-square bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center"
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = ((e.clientY - rect.top) / rect.height - 0.5) * 40;
                      const y = ((e.clientX - rect.left) / rect.width - 0.5) * -40;
                      setRotation({ x, y });
                    }}
                    onMouseLeave={() => setRotation({ x: 0, y: 0 })}
                  >
                    {/* 3D Object */}
                    <div 
                      className="w-48 h-48 transition-transform duration-300 ease-out"
                      style={{
                        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                        transformStyle: 'preserve-3d'
                      }}
                    >
                      <div 
                        className="w-full h-full rounded-2xl shadow-2xl"
                        style={{
                          background: `linear-gradient(135deg, ${selectedMetal.color} 0%, ${selectedMetal.color}dd 100%)`,
                          boxShadow: `0 20px 60px ${selectedMetal.color}66, inset 0 0 40px ${selectedMetal.color}44`
                        }}
                      >
                        {/* Shine effect */}
                        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-white/30 to-transparent"></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 space-y-3">
                    <div className="flex items-start space-x-2">
                      <Info className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-white">Eigenschaften:</p>
                        <p className="text-sm text-slate-400">{selectedMetal.description}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Package className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-white">Anwendungen:</p>
                        <p className="text-sm text-slate-400">{selectedMetal.applications}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Form */}
            <div>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-6">Anfrage stellen</h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Size Warning */}
                    <Alert className="bg-amber-500/10 border-amber-500/50">
                      <Ruler className="h-5 w-5 text-amber-400" />
                      <AlertDescription className="text-amber-200">
                        <strong>Maximale Teilegröße:</strong> {companyInfo.maxSize}
                      </AlertDescription>
                    </Alert>

                    {/* Quantity */}
                    <div>
                      <Label htmlFor="quantity" className="text-white mb-2 block">
                        Stückzahl *
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="Anzahl der Teile"
                        className="bg-slate-900 border-slate-700 text-white"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <Label htmlFor="description" className="text-white mb-2 block">
                        Beschreibung (optional)
                      </Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Besondere Anforderungen oder Details..."
                        className="bg-slate-900 border-slate-700 text-white min-h-24"
                      />
                    </div>

                    {/* Image Upload */}
                    <div>
                      <Label className="text-white mb-2 block">
                        Produktbilder * (max. 5 Bilder)
                      </Label>
                      <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-teal-500/50 transition-colors">
                        <Upload className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <span className="text-teal-400 hover:text-teal-300">Bilder auswählen</span>
                          <input
                            id="file-upload"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-xs text-slate-500 mt-1">PNG, JPG bis zu 10MB</p>
                      </div>
                      {images.length > 0 && (
                        <div className="grid grid-cols-5 gap-2 mt-3">
                          {images.map((img, index) => (
                            <div key={index} className="aspect-square bg-slate-900 rounded border border-slate-700 overflow-hidden">
                              <img src={img} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Shipping Info */}
                    <Alert className="bg-teal-500/10 border-teal-500/50">
                      <Info className="h-5 w-5 text-teal-400" />
                      <AlertDescription className="text-teal-200">
                        {companyInfo.shippingNote}
                      </AlertDescription>
                    </Alert>

                    <Button 
                      type="submit" 
                      className="w-full bg-teal-500 hover:bg-teal-600 text-white py-6 text-lg transition-all duration-300 hover:scale-105"
                    >
                      Anfrage absenden
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
